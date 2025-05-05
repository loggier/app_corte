
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Save, Loader2, ArrowLeft, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import type { Vehicle, Brand, Model } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { getAllBrands, getModelsByBrandId } from '@/firebase/data/brandsModels';
import { db } from '@/firebase/config';

// Global backend base URL (use env variable in production)
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://49.12.123.80:3000';

// Validation constants
const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// Zod form schema
const formSchema = z.object({
  brand: z.string().min(1, { message: 'Brand is required.' }),
  model: z
    .string()
    .min(2, { message: 'Model must be at least 2 characters.' })
    .max(50),
  year: z
    .coerce.number({ invalid_type_error: 'Year must be a number.' })
    .int()
    .min(1900, { message: 'Year must be after 1900.' })
    .max(new Date().getFullYear() + 1, { message: 'Year cannot be in the future.' }),
  tipo: z.enum(['Auto', 'Moto']).default('Auto'), // Add tipo field with default
  corte: z.string().min(1, { message: 'Corte is required.' }),
  colors: z
    .string()
    .min(3, { message: 'Color(s) required.' })
    .max(100),
  ubicacion: z
    .string()
    .min(3, { message: 'Location is required.' })
    .max(100),
  existingImageUrls: z.array(z.string().url()).optional(),
  images: z
    .array(z.instanceof(File))
    .max(5, { message: 'You can only upload up to 5 images.' })
    .refine((files) => files.every((file) => file.size <= MAX_FILE_SIZE), {
      message: 'Max image size is 5MB.',
    })
    .refine((files) => files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)), {
      message: 'Only .jpg, .jpeg, .png and .webp formats are supported.',
    })
    .optional(),
  observation: z.string().max(500).optional(),
});

type VehicleFormValues = z.infer<typeof formSchema>;

interface VehicleFormProps {
  initialData?: Vehicle | null;
  vehicleId?: string;
}

export default function VehicleForm({ initialData = null, vehicleId }: VehicleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialData?.brandId || ''); // Use brandId for consistency if available
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    initialData?.imageUrls || []
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Fetch brands
  useEffect(() => {
    getAllBrands().then(setBrands);
  }, []);

  // Fetch models on brand change
  useEffect(() => {
    if (selectedBrand) {
      getModelsByBrandId(selectedBrand).then(setModels);
    } else {
      setModels([]);
    }
  }, [selectedBrand]);

  // Update image previews
  useEffect(() => {
    const previews = [...existingImageUrls];
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          previews.push(reader.result as string);
          setImagePreviews([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
    if (!selectedFiles.length) {
      setImagePreviews(previews);
    }
    // Cleanup function to revoke object URLs if needed
    return () => {
        imagePreviews.forEach(preview => {
            if (preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        });
    };
  }, [existingImageUrls, selectedFiles]); // Dependency array needs review if previews cause issues

  const handleFileChange = (files: File[]) => {
    setSelectedFiles(files.slice(0, 5));
  };

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          brand: initialData.brandId || brands.find(b => b.name === initialData.brand)?.id || '', // Prefer brandId, fallback to lookup
          model: initialData.model,
          year: initialData.year,
          tipo: initialData.tipo || 'Auto', // Set default 'Auto' if missing
          corte: initialData.corte,
          colors: initialData.colors,
          ubicacion: initialData.ubicacion,
          existingImageUrls: initialData.imageUrls || [],
          images: undefined, // Files are handled separately
          observation: initialData.observation || '',
        }
      : {
          brand: '',
          model: '',
          year: '' as any, // Initialize with empty string to avoid uncontrolled error
          tipo: 'Auto', // Default for new vehicles
          corte: '',
          colors: '',
          ubicacion: '',
          existingImageUrls: [],
          images: undefined,
          observation: '',
        },
  });

   // Effect to set the selected brand when editing and brands are loaded
   useEffect(() => {
    if (initialData && brands.length > 0) {
        const initialBrandId = brands.find(b => b.name === initialData.brand)?.id || '';
        setSelectedBrand(initialBrandId);
        form.setValue('brand', initialBrandId, { shouldValidate: true }); // Set brand in form
    }
    }, [initialData, brands, form]);


   // Effect to set the selected model when editing and models are loaded
   useEffect(() => {
    if (initialData && models.length > 0 && !form.getValues('model')) {
        // Check if the initial model name exists in the loaded models
        const modelExists = models.some(m => m.name === initialData.model);
        if (modelExists) {
            form.setValue('model', initialData.model, { shouldValidate: true });
        }
    }
  }, [initialData, models, form]);


  const removeExistingImage = (url: string) => {
    const updated = existingImageUrls.filter((u) => u !== url);
    setExistingImageUrls(updated);
    setImagePreviews((prev) => prev.filter((p) => p !== url));
    form.setValue('existingImageUrls', updated);
  };

  const removeSelectedFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    const dataTransfer = new DataTransfer();
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    updatedFiles.forEach(file => dataTransfer.items.add(file));

    // Find the input element and update its files property
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    if (fileInput) {
        fileInput.files = dataTransfer.files;
        // Manually trigger the change event for react-hook-form
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
    }

    setSelectedFiles(updatedFiles);
    form.setValue('images', updatedFiles); // Update RHF state
};


  const corteOptions = useMemo(
    () => [
      { value: 'Ignición', label: 'Ignición' },
      { value: 'Bomba de Gasolina', label: 'Bomba de Gasolina' },
      { value: 'Fusliera', label: 'Fusliera' },
    ],
    []
  );

    const tipoOptions = useMemo(
    () => [
      { value: 'Auto', label: 'Auto' },
      { value: 'Moto', label: 'Moto' },
    ],
    []
  );

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    form.setValue('brand', brandId);
    form.setValue('model', ''); // Reset model when brand changes
    setModels([]); // Clear models immediately
    getModelsByBrandId(brandId).then(setModels); // Fetch new models
  };

  const onSubmit = async (values: VehicleFormValues) => {
    setIsSubmitting(true);
    try {
      const { images, existingImageUrls: existingUrls = [], ...rest } = values;
      let imageUrls = [...existingUrls];

      if (images?.length) {
        const dataFD = new FormData();
        images.forEach((img) => dataFD.append('files', img));
        const resp = await fetch(`${BACKEND_BASE_URL}/upload`, {
          method: 'POST',
          body: dataFD,
        });
        if (!resp.ok) throw new Error(`Image upload failed: ${resp.statusText}`);
        const json = await resp.json();
        if (Array.isArray(json.urls)) {
          imageUrls = [
            ...imageUrls,
            ...json.urls.map((u: string) =>
              u.replace('http://localhost:3000', BACKEND_BASE_URL)
            ),
          ];
        } else {
            throw new Error('Invalid response format from image upload server');
        }
      }

      const brandObj = brands.find((b) => b.id === values.brand);
      if (!brandObj) throw new Error("Selected brand not found");

      const modelObj = models.find((m) => m.name === values.model);
      // If it's a new vehicle, modelObj must exist
      if (!vehicleId && !modelObj) throw new Error("Selected model not found");


      const payload: Partial<Vehicle> & { brandId?: string; modelId?: string } = {
        ...rest,
        brand: brandObj.name, // Store brand name
        brandId: brandObj.id, // Store brand ID
        modelId: modelObj?.id, // Store model ID if found
        imageUrls,
        tipo: values.tipo || 'Auto', // Ensure tipo is included, default to 'Auto' if somehow undefined
      };

      // Remove potentially undefined observation if empty
      if (!payload.observation) {
        delete payload.observation;
      }


      if (vehicleId && initialData) {
        // Update existing document
        const refDoc = doc(db, 'vehicles', vehicleId);
        // Only include fields that were actually submitted in the form
        // Brand and Model cannot be changed in edit mode per current UI logic
        const updateData: any = {
            year: payload.year,
            corte: payload.corte,
            colors: payload.colors,
            ubicacion: payload.ubicacion,
            tipo: payload.tipo,
            imageUrls: payload.imageUrls, // Updated image URLs
            ...(payload.observation && { observation: payload.observation }), // Conditionally add observation
        };
        await updateDoc(refDoc, updateData);
        toast({ title: 'Success', description: 'Vehículo actualizado correctamente.' });
        router.push('/vehicles'); // Redirect after update

      } else {
        // Add new document
        // Ensure required fields for new doc are present
        if (!payload.brandId || !payload.modelId || !payload.model) {
            throw new Error("Missing brand or model information for new vehicle.");
        }
        await addDoc(collection(db, 'vehicles'), payload);
        toast({ title: 'Success', description: 'Vehículo agregado correctamente.' });
        router.push('/vehicles');
      }
    } catch (err: any) {
      console.error("Error submitting form:", err);
      toast({
        title: 'Error',
        description: err.message || 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modelField = selectedBrand || form.getValues('brand') ? (
    <FormField
      control={form.control}
      name="model"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Modelo</FormLabel>
          {vehicleId && initialData ? (
            // Display initial model name but it's not part of the form submission for edit
             <Input value={initialData.model} disabled />
          ) : (
            <FormControl>
              <Select
                onValueChange={field.onChange}
                value={field.value} // Ensure this value is controlled
                disabled={isSubmitting || models.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un modelo" />
                </SelectTrigger>
                <SelectContent>
                  {models.length > 0 ? (
                    models.map((m) => (
                        <SelectItem key={m.id} value={m.name}>
                        {m.name}
                        </SelectItem>
                    ))
                    ) : (
                    <SelectItem value="loading" disabled>Cargando modelos...</SelectItem>
                 )}
                </SelectContent>
              </Select>
            </FormControl>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  ) : null;

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/vehicles"
        passHref
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Regresar
      </Link>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 bg-card p-6 rounded-lg shadow-md border"
        >
          {/* Marca */}
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                {vehicleId && initialData ? (
                  // Display initial brand name but it's not part of the form submission for edit
                  <Input value={initialData.brand} disabled />
                ) : (
                  <FormControl>
                    <Select
                      onValueChange={(value) => handleBrandChange(value)} // Use handler to manage dependent state
                      value={field.value} // Ensure this value is controlled
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione la Marca" />
                      </SelectTrigger>
                      <SelectContent>
                       {brands.length > 0 ? (
                            brands.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                                {b.name}
                            </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="loading" disabled>Cargando marcas...</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {modelField}

          {/* Año */}
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej., 2023"
                    {...field}
                    value={field.value ?? ''} // Ensure value is never undefined
                    onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} // Handle empty string for clearing
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo */}
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Vehículo</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || 'Auto'} // Ensure value is always set, default visually
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Corte */}
          <FormField
            control={form.control}
            name="corte"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Corte</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione corte" />
                    </SelectTrigger>
                    <SelectContent>
                      {corteOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField control={form.control} name="colors" render={({ field }) => (
            <FormItem>
              <FormLabel>Color(es) de cable</FormLabel>
              <FormControl>
                <Input placeholder="Ej., Rojo, Azul" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormDescription>Separa con comas para varios colores.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="ubicacion" render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Bajo el tablero.." {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="images" render={({ field }) => (
             <FormItem>
               <FormLabel>Imágenes</FormLabel>
               <FormControl>
                 <Input
                   type="file"
                   multiple
                   accept="image/*"
                   onChange={(e) => {
                     const files = e.target.files ? Array.from(e.target.files) : [];
                     // Filter out files that are already selected or exceed the limit
                     const newFiles = files.filter(
                       (file) => !selectedFiles.some((sf) => sf.name === file.name && sf.size === file.size)
                     );
                     const combinedFiles = [...selectedFiles, ...newFiles].slice(0, 5 - existingImageUrls.length);

                     handleFileChange(combinedFiles);
                     field.onChange(combinedFiles); // Update RHF state
                   }}
                   disabled={isSubmitting || (existingImageUrls.length + selectedFiles.length >= 5)}
                 />
               </FormControl>
               <FormDescription>
                 Puedes subir hasta {5 - existingImageUrls.length} imágenes nuevas. Máximo 5 en total.
               </FormDescription>
               <FormMessage />
               {(imagePreviews.length > 0 || selectedFiles.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {/* Display existing images */}
                    {existingImageUrls.map((url, idx) => (
                        <div key={`existing-${idx}`} className="relative group">
                        <img src={url} alt={`existing-preview-${idx}`} className="w-full h-24 object-cover rounded-md" />
                        <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeExistingImage(url)}
                            type="button"
                        >
                            <X className="w-4 h-4" />
                            <span className="sr-only">Remove existing image</span>
                        </Button>
                         <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">Existente</div>
                        </div>
                    ))}
                    {/* Display newly selected file previews */}
                    {selectedFiles.map((file, idx) => (
                        <div key={`new-${idx}`} className="relative group">
                         <img src={URL.createObjectURL(file)} alt={`new-preview-${idx}`} className="w-full h-24 object-cover rounded-md" />
                        <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeSelectedFile(idx)}
                            type="button" // Prevent form submission
                        >
                            <X className="w-4 h-4" />
                            <span className="sr-only">Remove new image</span>
                        </Button>
                        </div>
                    ))}
                </div>
                )}
             </FormItem>
          )} />

          <FormField control={form.control} name="observation" render={({ field }) => (
            <FormItem>
              <FormLabel>Observación</FormLabel>
              <FormControl>
                <Textarea placeholder="Observación adicional..." rows={4} {...field} disabled={isSubmitting} className="resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {vehicleId ? 'Guardar cambio' : 'Agregar Vehículo'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

