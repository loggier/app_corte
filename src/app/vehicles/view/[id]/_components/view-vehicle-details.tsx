'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore'; // These imports might still be needed for client-side fetches if you decide to do that, but for now, we'll rely on the prop.
import { db } from '@/firebase/config'; // Same as above
import type { Vehicle } from '@/lib/definitions';
import { useParams, useRouter } from 'next/navigation'; // Keep these if you still need client-side routing/params, but params should ideally come from the server component
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ViewVehicleDetailsProps {
  vehicle: Vehicle;
}

export default function ViewVehicleDetails({ vehicle }: ViewVehicleDetailsProps) {
  // We are now receiving the vehicle data as a prop, so we don't need loading state or fetching here
  // const { id } = useParams(); // Params should come from the server component if needed
  // const router = useRouter(); // Keep if you use client-side navigation
  // const [vehicle, setVehicle] = useState<Vehicle | null>(null); // Remove
  // const [loading, setLoading] = useState(true); // Remove
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Remove the useEffect as data fetching happens in the server component
  // useEffect(() => {
  //   const fetchVehicle = async () => {
  //     if (id) {
  //       const vehicleRef = doc(db, 'vehicles', id as string);
  //       const docSnap = await getDoc(vehicleRef);

  //       if (docSnap.exists()) {
  //         setVehicle({ id: docSnap.id, ...docSnap.data() } as Vehicle);
  //       } else {
  //         console.log('No such document!');
  //         // Optionally redirect to a 404 page or show an error
  //       }
  //       setLoading(false);
  //     }
  //   };

  //   fetchVehicle();
  // }, [id]);


  // Loading and not found states are now handled in the server component
  // if (loading) {
  //   return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  // }

  // if (!vehicle) {
  //   return <div className="flex justify-center items-center min-h-screen">Vehículo no encontrado.</div>;
  // }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/vehicles" passHref className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Regresar
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{vehicle.brand} {vehicle.model} ({vehicle.year})</CardTitle>
          <CardDescription className="text-muted-foreground">{vehicle.ubicacion}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">Detalles:</h4>
            <p><strong>Corte:</strong> {vehicle.corte}</p>
            <p><strong>Colores:</strong> {vehicle.colors}</p>
            {vehicle.observation && <p><strong>Observación:</strong> {vehicle.observation}</p>}
          </div>

          {vehicle.imageUrls && vehicle.imageUrls.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-2">Imágenes:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {vehicle.imageUrls.map((url, index) => (
                  <div key={index} className="relative cursor-pointer overflow-hidden rounded-md" onClick={() => setSelectedImage(url)}>
                    <Image
                        src={url}
                        alt={`Image ${index + 1} of ${vehicle.model}`}
                        width={200}
                        height={150}
                        unoptimized
                        className="object-cover hover:scale-105 transition-transform duration-300 ease-in-out"

                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Imagen Ampliada</DialogTitle>
          <DialogDescription></DialogDescription>
          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Amplified vehicle image"
              width={800}
              height={600}
              unoptimized
              className='object-contain'
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}