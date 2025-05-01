'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import type { Vehicle } from '@/lib/definitions';
import { useRouter } from 'next/navigation';
import { addVehicle, updateVehicle } from '@/lib/mock-data';
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

// Define Zod schema for validation
const formSchema = z.object({
  model: z.string().min(2, { message: 'Model must be at least 2 characters.' }).max(50),
  year: z.coerce.number().int().min(1900, { message: 'Year must be after 1900.' }).max(new Date().getFullYear() + 1, { message: `Year cannot be in the future.` }),
  corte: z.string().min(1, {message: 'Corte is required.'}).max(50),
  bomba: z.string().min(1, {message: 'Bomba is required.'}).max(50),
  corteIgnicion: z.string().min(1, {message: 'Corte Ignicion is required.'}).max(50),
  colors: z.string().min(3, {message: 'Color(s) required.'}).max(100),
  ubicacion: z.string().min(3, {message: 'Location is required.'}).max(100),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  observation: z.string().max(500).optional(),
});

type VehicleFormValues = z.infer<typeof formSchema>;

interface VehicleFormProps {
  initialData?: Vehicle | null; // Make initialData optional and nullable
  vehicleId?: string; // Pass vehicleId for editing
}

export default function VehicleForm({ initialData, vehicleId }: VehicleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      imageUrl: initialData.imageUrl ?? '', // Ensure imageUrl is '' if null/undefined
      observation: initialData.observation ?? '', // Ensure observation is '' if null/undefined
    } : { // Provide default empty values for a new form
      model: '',
      year: undefined, // Use undefined for number input initially
      corte: '',
      bomba: '',
      corteIgnicion: '',
      colors: '',
      ubicacion: '',
      imageUrl: '',
      observation: '',
    },
  });

  const onSubmit = async (values: VehicleFormValues) => {
     setIsSubmitting(true);
     try {
        let result;
        if (vehicleId && initialData) {
         // Update existing vehicle
         result = await updateVehicle(vehicleId, values);
         toast({
             title: "Success",
             description: "Vehicle updated successfully.",
         });
        } else {
         // Add new vehicle
         result = await addVehicle(values);
          toast({
             title: "Success",
             description: "Vehicle added successfully.",
         });
        }

        if (result) {
            router.push('/vehicles'); // Redirect to list after success
            router.refresh(); // Refresh server data
        } else {
             toast({
                title: "Error",
                description: `Failed to ${vehicleId ? 'update' : 'add'} vehicle.`,
                variant: "destructive",
             });
        }
     } catch (error) {
        console.error("Form submission error:", error);
         toast({
             title: "Error",
             description: "An unexpected error occurred.",
             variant: "destructive",
         });
     } finally {
        setIsSubmitting(false);
     }
  };

  return (
     <div className="max-w-2xl mx-auto">
      <Link href="/vehicles" passHref className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Vehicles
      </Link>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow-md border">
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Toyota Camry" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 2023" {...field} disabled={isSubmitting}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="corte"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Corte</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Sistema X" {...field} disabled={isSubmitting}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="bomba"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bomba</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Tipo Y" {...field} disabled={isSubmitting}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="corteIgnicion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Corte Ignicion</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Metodo Z" {...field} disabled={isSubmitting}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="colors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color(s)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Red, Blue" {...field} disabled={isSubmitting}/>
              </FormControl>
               <FormDescription>
                Separate multiple colors with commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ubicacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (Ubicación)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Main Lot, Section B" {...field} disabled={isSubmitting}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/image.jpg" {...field} disabled={isSubmitting}/>
              </FormControl>
               <FormDescription>
                Optional: Provide a link to an image of the vehicle.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="observation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observation</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional notes about the vehicle..."
                  className="resize-none"
                  {...field}
                  rows={4}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                 {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" /> }
                 {vehicleId ? 'Save Changes' : 'Add Vehicle'}
            </Button>
        </div>
      </form>
    </Form>
    </div>
  );
}
