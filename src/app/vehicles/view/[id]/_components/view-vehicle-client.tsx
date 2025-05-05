'use client';

import { useState } from 'react'; // Keep useState for selectedImage
// Remove useEffect, useParams, useRouter as data is from props
import type { Vehicle } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Car, Bike } from 'lucide-react'; // Added Car, Bike icons
import Link from 'next/link';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ViewVehicleClientProps {
  vehicle: Vehicle; // Component now receives vehicle data as a prop
}

export default function ViewVehicleClient({ vehicle }: ViewVehicleClientProps) {
  // Remove state and effect for fetching vehicle data
  // const { id } = useParams();
  // const router = useRouter();
  // const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  // const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Remove the useEffect hook for fetching data
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

  // Remove loading and vehicle not found checks as data is provided
  // if (loading) {
  //   return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  // }

  // if (!vehicle) {
  //   return <div className="flex justify-center items-center min-h-screen">Vehículo no encontrado.</div>;
  // }

  const vehicleType = vehicle.tipo || 'Auto'; // Default to 'Auto' if tipo is missing

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/vehicles" passHref className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Regresar
      </Link>

      <Card>
        <CardHeader>
          {/* Use the vehicle prop */}
          <CardTitle className="text-2xl font-bold">{vehicle.brand} {vehicle.model} ({vehicle.year})</CardTitle>
          {/* Use the vehicle prop */}
          <CardDescription className="text-muted-foreground">{vehicle.ubicacion}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">Detalles:</h4>
            {/* Use the vehicle prop */}
            <div className="flex items-center gap-1.5 mb-1">
              {vehicleType === 'Moto' ? <Bike className="w-4 h-4" /> : <Car className="w-4 h-4" />}
              <strong>Tipo:</strong> {vehicleType}
            </div>
            <p><strong>Corte:</strong> {vehicle.corte}</p>
            {/* Use the vehicle prop */}
            <p><strong>Colores:</strong> {vehicle.colors}</p>
            {/* Use the vehicle prop */}
            {vehicle.observation && <p><strong>Observación:</strong> {vehicle.observation}</p>}
          </div>

          {/* Use the vehicle prop */}
          {vehicle.imageUrls && vehicle.imageUrls.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-2">Imágenes:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Use the vehicle prop */}
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
