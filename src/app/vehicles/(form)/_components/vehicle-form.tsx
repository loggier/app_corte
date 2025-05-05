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
    .coerce.number()
    .int()
    .min(1900, { message: 'Year must be after 1900.' })
    .max(new Date().getFullYear() + 1, { message: 'Year cannot be in the future.' }),
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
  const [selectedBrand, setSelectedBrand] = useState<string>(initialData?.brand || '');
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
  }, [existingImageUrls, selectedFiles]);

  const handleFileChange = (files: File[]) => {
    setSelectedFiles(files.slice(0, 5));
  };

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          brand: initialData.brand,
          model: initialData.model,
          year: initialData.year,
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
          year: undefined,
          corte: '',
          colors: '',
          ubicacion: '',
          existingImageUrls: [],
          images: undefined,
          observation: '',
        },
  });

  const removeExistingImage = (url: string) => {
    const updated = existingImageUrls.filter((u) => u !== url);
    setExistingImageUrls(updated);
    setImagePreviews((prev) => prev.filter((p) => p !== url));
    form.setValue('existingImageUrls', updated);
  };

  const corteOptions = useMemo(
    () => [
      { value: 'Ignición', label: 'Ignición' },
      { value: 'Bomba de Gasolina', label: 'Bomba de Gasolina' },
      { value: 'Fusliera', label: 'Fusliera' },
    ],
    []
  );

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    form.setValue('brand', brandId);
    form.setValue('model', '');
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
        if (!resp.ok) throw new Error(resp.statusText);
        const json = await resp.json();
        if (Array.isArray(json.urls)) {
          imageUrls = [
            ...imageUrls,
            ...json.urls.map((u: string) =>
              u.replace('http://localhost:3000', BACKEND_BASE_URL)
            ),
          ];
        }
      }

      const brandName =
        brands.find((b) => b.id === values.brand)?.name || values.brand;
      const modelObj = models.find((m) => m.name === values.model);

      const payload = {
        ...rest,
        brand: brandName,
        modelId: modelObj?.id,
        imageUrls,
      };

      if (vehicleId && initialData) {
        // Create the object only for fields that need to be updated in edit mode
        const refDoc = doc(db, 'vehicles', vehicleId);
        const updateData: any = {
            ...rest, // Includes year, corte, colors, ubicacion, observation
            imageUrls: imageUrls, // Use new and existing image URLs
        };
        // Remove modelId and brand to prevent from updating
        delete updateData.modelId;
        delete updateData.brand;

        await updateDoc(refDoc, updateData);

        toast({ title: 'Success', description: 'Vehículo actualizado correctamente.' });
      } else {
        await addDoc(collection(db, 'vehicles'), payload);
        toast({ title: 'Success', description: 'Vehículo agregado correctamente.' });
        router.push('/vehicles');
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado.',
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
            <Input value={initialData.model} disabled />
          ) : (
            <FormControl>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un modelo" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
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
                  <Input value={initialData.brand} disabled />
                ) : (
                  <FormControl>
                    <Select
                      onValueChange={handleBrandChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione la Marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
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
                    disabled={isSubmitting}
                  />
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
                    handleFileChange(files);
                    field.onChange(files);
                  }}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative">
                      <img src={src} alt={`preview-${idx}`} className="w-full h-24 object-cover rounded-md" />
                      {existingImageUrls.includes(src) && (
                        <>
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white text-xs">Existente</span>
                          </div>
                          <Button size="icon" variant="destructive" className="absolute top-1 right-1" onClick={() => removeExistingImage(src)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
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
