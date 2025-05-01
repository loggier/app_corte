import Image from 'next/image';
import Link from 'next/link';
import type { Vehicle } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, MapPin, Palette, Calendar, Wrench, Fuel } from 'lucide-react';
import DeleteVehicleButton from './delete-vehicle-button'; // Import the client component

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        {vehicle.imageUrl && (
          <div className="relative h-40 w-full">
            <Image
              src={vehicle.imageUrl}
              alt={`Image of ${vehicle.model}`}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
              data-ai-hint={`${vehicle.model} car`}
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-2">
        <CardTitle className="text-lg font-semibold text-primary truncate">{vehicle.model}</CardTitle>
        <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5"> <Calendar className="w-3.5 h-3.5"/> Year: {vehicle.year}</div>
            <div className="flex items-center gap-1.5"> <Palette className="w-3.5 h-3.5"/> Colors: {vehicle.colors}</div>
            <div className="flex items-center gap-1.5"> <MapPin className="w-3.5 h-3.5"/> Location: {vehicle.ubicacion}</div>
            <div className="flex items-center gap-1.5"> <Wrench className="w-3.5 h-3.5"/> Corte: {vehicle.corte}</div>
             <div className="flex items-center gap-1.5"> <Fuel className="w-3.5 h-3.5"/> Bomba: {vehicle.bomba}</div>
             <div className="flex items-center gap-1.5"> <Wrench className="w-3.5 h-3.5"/> Corte Ignición: {vehicle.corteIgnicion}</div>
        </div>
         {vehicle.observation && (
            <CardDescription className="text-xs pt-2 border-t border-border">
                <strong>Observation:</strong> {vehicle.observation}
            </CardDescription>
         )}
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t border-border flex justify-end gap-2">
         <Link href={`/vehicles/edit/${vehicle.id}`} passHref>
            <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
            </Button>
         </Link>
        <DeleteVehicleButton vehicleId={vehicle.id} />
      </CardFooter>
    </Card>
  );
}
