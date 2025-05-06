
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Save, Loader2, ArrowLeft, X, PlusCircle } from 'lucide-react';

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label'; // Import Label

import type { Vehicle, Brand, Model } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { getAllBrands, getModelsByBrandId, addModelToBrand } from '@/firebase/data/brandsModels'; // Import addModelToBrand
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
    .min(1, { message: 'Model is required.' }) // Changed min to 1 as it can be newly added
    .max(50),
  year: z
    .coerce.number({ invalid_type_error: 'Year must be a number.' })
    .int()
    .min(1900, { message: 'Year must be after 1900.' })
    .max(new Date().getFullYear() + 1, { message: 'Year cannot be in the future.' }),
  tipo: z.enum(['Auto', 'Moto','Camion','Maquinaria Pesada','Otro']).default('Auto'),
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
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialData?.brandId || '');
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    initialData?.imageUrls || []
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isAddModelDialogOpen, setIsAddModelDialogOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');


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
        // Ensure we don't add duplicates if selection changes
        const objectUrl = URL.createObjectURL(file);
        if (!previews.includes(objectUrl)) {
            previews.push(objectUrl);
        }
    });
    setImagePreviews(previews);

    // Cleanup function to revoke object URLs
    return () => {
        previews.forEach(preview => {
            if (preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        });
    };
  }, [existingImageUrls, selectedFiles]);


  const handleFileChange = (files: File[]) => {
    const currentTotalImages = existingImageUrls.length + selectedFiles.length;
    const allowedNewFiles = 5 - currentTotalImages;
    const filesToAdd = files.slice(0, allowedNewFiles);

    // Prevent duplicates based on name and size
    const uniqueNewFiles = filesToAdd.filter(
      (newFile) =>
        !selectedFiles.some(
          (existingFile) =>
            existingFile.name === newFile.name && existingFile.size === newFile.size
        )
    );

    const combined = [...selectedFiles, ...uniqueNewFiles].slice(0, 5 - existingImageUrls.length);
    setSelectedFiles(combined);
     // Also update the form state
     form.setValue('images', combined, { shouldValidate: true });
  };


  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          brand: initialData.brandId || brands.find(b => b.name === initialData.brand)?.id || '',
          model: initialData.model,
          year: initialData.year,
          tipo: initialData.tipo || 'Auto',
          corte: initialData.corte,
          colors: initialData.colors,
          ubicacion: initialData.ubicacion,
          existingImageUrls: initialData.imageUrls || [],
          images: undefined,
          observation: initialData.observation || '',
        }
      : {
          brand: '',
          model: '',
          year: undefined, // Set to undefined to avoid controlled/uncontrolled issue
          tipo: 'Auto',
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
        const initialBrandId = brands.find(b => b.name === initialData.brand)?.id || initialData.brandId || '';
        if (initialBrandId) {
            setSelectedBrand(initialBrandId);
            form.setValue('brand', initialBrandId, { shouldValidate: true });
        }
    }
    }, [initialData, brands, form]);


   // Effect to set the selected model when editing and models are loaded
   useEffect(() => {
    if (initialData?.model && models.length > 0) {
        // Check if the initial model name exists in the loaded models
        const modelExists = models.some(m => m.name === initialData.model);
        if (modelExists) {
            // Only set the value if it's not already set or differs, to avoid infinite loops
             if (form.getValues('model') !== initialData.model) {
                 form.setValue('model', initialData.model, { shouldValidate: true, shouldDirty: false });
             }
        } else if (!vehicleId) {
             // If it's a new form and the initial model (if any provided) isn't in the list, reset it.
             // This case might not be typical for 'edit' but good for consistency.
             // form.setValue('model', '', { shouldValidate: true });
        }
    }
  }, [initialData, models, form, vehicleId]);


  const removeExistingImage = (url: string) => {
    const updated = existingImageUrls.filter((u) => u !== url);
    setExistingImageUrls(updated);
    // No need to manage imagePreviews separately for existing URLs
    form.setValue('existingImageUrls', updated);
  };

  const removeSelectedFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);

    // Update component state
    setSelectedFiles(updatedFiles);

    // Update React Hook Form state
    form.setValue('images', updatedFiles, { shouldValidate: true });

    // Update the file input visually (optional but good UX)
    const dataTransfer = new DataTransfer();
    updatedFiles.forEach(file => dataTransfer.items.add(file));
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    if (fileInput) {
        fileInput.files = dataTransfer.files;
    }
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
      { value: 'Camion', label: 'Camion' },
      { value: 'Maquinaria Pesada', label: 'Maquinaria Pesada' },
    ],
    []
  );

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    form.setValue('brand', brandId);
    form.setValue('model', '', { shouldValidate: true }); // Reset model when brand changes
    setModels([]); // Clear models immediately
    getModelsByBrandId(brandId).then(setModels); // Fetch new models
  };

    // Function to handle adding a new model
    const handleAddNewModel = async () => {
        if (!newModelName.trim()) {
          toast({ title: 'Error', description: 'El nombre del modelo no puede estar vacío.', variant: 'destructive' });
          return;
        }
        if (!selectedBrand) {
          toast({ title: 'Error', description: 'Seleccione una marca primero.', variant: 'destructive' });
          return;
        }

        // Check if model already exists (case-insensitive)
        const existingModel = models.find(m => m.name.toLowerCase() === newModelName.trim().toLowerCase());
        if (existingModel) {
            toast({ title: 'Información', description: `El modelo "${existingModel.name}" ya existe para esta marca. Seleccionándolo...` });
            form.setValue('model', existingModel.name, { shouldValidate: true });
            setIsAddModelDialogOpen(false);
            setNewModelName('');
            return;
        }


        setIsAddingModel(true);
        try {
          const addedModel = await addModelToBrand(selectedBrand, newModelName.trim());
          // Refetch models to include the new one
          const updatedModels = await getModelsByBrandId(selectedBrand);
          setModels(updatedModels);
          // Set the new model as selected in the form
          form.setValue('model', addedModel.name, { shouldValidate: true });
          toast({ title: 'Éxito', description: `Modelo "${addedModel.name}" agregado correctamente.` });
          setIsAddModelDialogOpen(false);
          setNewModelName('');
        } catch (error: any) {
          console.error("Error adding new model:", error);
          toast({ title: 'Error', description: error.message || 'No se pudo agregar el modelo.', variant: 'destructive' });
        } finally {
          setIsAddingModel(false);
        }
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

      // Find the model object using the potentially newly added model name
      let modelObj = models.find((m) => m.name === values.model);


       // Prepare payload - modelId might be missing if it was just added but state hasn't updated yet
       // In a robust implementation, addModelToBrand should return the ID, or we refetch models *before* this point.
       // For now, we assume the model name is sufficient for the backend or we find it if available.
       const payload: Partial<Vehicle> & { brandId?: string; modelId?: string | undefined } = {
           ...rest,
           brand: brandObj.name, // Store brand name
           brandId: brandObj.id, // Store brand ID
           model: values.model, // Use the model name from the form
           modelId: modelObj?.id, // Store model ID if found, otherwise undefined
           imageUrls,
           tipo: values.tipo || 'Auto',
           year: values.year || 0, // Ensure year is a number, default to 0 if undefined
       };

        // If modelObj wasn't found initially (e.g., just added), try finding it again after potential state update
        if (!payload.modelId) {
            const potentiallyNewModel = models.find(m => m.name === values.model);
            if (potentiallyNewModel) {
                payload.modelId = potentiallyNewModel.id;
            }
        }


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
         if (!payload.brandId || !payload.model) { // Model ID might be tricky if just added
             throw new Error("Missing brand or model information for new vehicle.");
         }
         // If modelId is missing after checks, log a warning or handle as needed
         if (!payload.modelId) {
             console.warn("Model ID is missing. Saving vehicle without explicit model reference ID.");
             // Consider fetching the model ID again here if critical
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
           <div className="flex items-center gap-2">
              <FormControl className="flex-grow">
                <Select
                  onValueChange={field.onChange}
                  value={field.value} // Ensure this value is controlled
                  disabled={isSubmitting || vehicleId !== undefined} // Disable if editing
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
                      <SelectItem value="loading" disabled>
                          {selectedBrand ? 'Cargando modelos...' : 'Seleccione una marca primero'}
                       </SelectItem>
                   )}
                  </SelectContent>
                </Select>
              </FormControl>
              {!vehicleId && ( // Only show Add button for new vehicles
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsAddModelDialogOpen(true)}
                    disabled={isSubmitting || !selectedBrand}
                    aria-label="Agregar nuevo modelo"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
              )}
           </div>
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
                    value={field.value ?? ''} // Ensure value is never undefined or null for input
                    onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} // Set to undefined on empty
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
                <Input placeholder="Ej., Rojo, Azul" {...field} value={field.value ?? ''} disabled={isSubmitting} />
              </FormControl>
              <FormDescription>Separa con comas para varios colores.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="ubicacion" render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Bajo el tablero.." {...field} value={field.value ?? ''} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="images" render={({ field: { onChange, value, ...restField } }) => ( // Destructure onChange and value
             <FormItem>
               <FormLabel>Imágenes</FormLabel>
               <FormControl>
                 <Input
                   type="file"
                   multiple
                   accept="image/*"
                   onChange={(e) => {
                       const files = e.target.files ? Array.from(e.target.files) : [];
                       handleFileChange(files); // Use the updated handler
                       // No need to call field.onChange here, handleFileChange updates RHF
                   }}
                   disabled={isSubmitting || (existingImageUrls.length + selectedFiles.length >= 5)}
                   {...restField} // Pass down other field properties like ref, name, onBlur
                 />
               </FormControl>
               <FormDescription>
                 Puedes subir hasta {5 - existingImageUrls.length} imágenes nuevas. Máximo 5 en total.
               </FormDescription>
               <FormMessage />
               {(existingImageUrls.length > 0 || selectedFiles.length > 0) && ( // Check both existing and selected
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {/* Display existing images */}
                    {existingImageUrls.map((url, idx) => (
                        <div key={`existing-${url}-${idx}`} className="relative group">
                        <img src={url} alt={`existing-preview-${idx}`} className="w-full h-24 object-cover rounded-md" />
                        <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    {selectedFiles.map((file, idx) => {
                        const previewUrl = imagePreviews.find(p => p.startsWith('blob:') && selectedFiles[idx] && p.endsWith(file.name)); // Basic match, might need improvement
                        const objectUrl = URL.createObjectURL(file); // Create URL for display

                         return (
                            <div key={`new-${file.name}-${idx}`} className="relative group">
                            <img src={objectUrl} alt={`new-preview-${idx}`} className="w-full h-24 object-cover rounded-md" onLoad={() => URL.revokeObjectURL(objectUrl)} /> {/* Revoke after load */}
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeSelectedFile(idx)}
                                type="button" // Prevent form submission
                            >
                                <X className="w-4 h-4" />
                                <span className="sr-only">Remove new image</span>
                            </Button>
                            </div>
                         );
                    })}
                </div>
                )}
             </FormItem>
          )} />

          <FormField control={form.control} name="observation" render={({ field }) => (
            <FormItem>
              <FormLabel>Observación</FormLabel>
              <FormControl>
                <Textarea placeholder="Observación adicional..." rows={4} {...field} value={field.value ?? ''} disabled={isSubmitting} className="resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || isAddingModel} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {vehicleId ? 'Guardar cambio' : 'Agregar Vehículo'}
            </Button>
          </div>
        </form>
      </Form>

        {/* Add New Model Dialog */}
        <Dialog open={isAddModelDialogOpen} onOpenChange={setIsAddModelDialogOpen}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Agregar Nuevo Modelo</DialogTitle>
                <DialogDescription>
                Agregue un nuevo modelo para la marca seleccionada.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-model-name" className="text-right">
                    Nombre
                </Label>
                <Input
                    id="new-model-name"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    className="col-span-3"
                    placeholder="Ej., Corolla"
                    disabled={isAddingModel}
                />
                </div>
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isAddingModel}>
                    Cancelar
                    </Button>
                 </DialogClose>
                <Button onClick={handleAddNewModel} disabled={isAddingModel || !newModelName.trim()}>
                {isAddingModel ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                Agregar Modelo
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}

