
'use client';

import Image from 'next/image'
import Link from 'next/link'
import type { Vehicle, User } from '@/lib/definitions' // Import User type
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, MapPin, Palette, Calendar, Wrench, Eye, Car, Bike } from 'lucide-react' // Added Car, Bike icons
import { useState, useEffect } from 'react'; // Import useState and useEffect

import { useRouter } from 'next/navigation';
import { deleteVehicleAction } from '@/app/(protected)/vehicles/actions'; // Importa la Server Action
import { useToast } from '@/hooks/use-toast';

interface VehicleCardProps {
    vehicle: Vehicle;
    onVehicleDeleted: () => void;
  }
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function VehicleCard({ vehicle, onVehicleDeleted }: VehicleCardProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [userProfile, setUserProfile] = useState<string | null>(null);

    useEffect(() => {
        // Fetch user data from localStorage on the client side
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
          try {
            const user: User = JSON.parse(userDataString);
            setUserProfile(user.perfil); // Store the profile type
          } catch (e) {
            console.error("Error parsing user data from localStorage in VehicleCard", e);
          }
        }
      }, []); // Empty dependency array ensures this runs once on mount


    const handleDelete = async () => {
        try {
            // Llama a la Server Action para eliminar y revalidar
            const result = await deleteVehicleAction(vehicle.id);

            if (result.success) {
               
                toast({
                  title: 'Success',
                  description: 'Vehicle deleted successfully.',
                });
                onVehicleDeleted();
               
                // Ya no necesitas router.refresh() aquí, la Server Action lo maneja
            } else {

                console.error('Server Action Delete failed:', result.error);
                toast({
                    title: 'Error',
                    description: `Failed to delete vehicle: ${result.error}`,
                    variant: 'destructive',
                });
                }
        } catch (error) {
                console.error('Unexpected error during deletion:', error);
                toast({
                    title: 'Error',
                    description: 'An unexpected error occurred while trying to delete the vehicle.',
                    variant: 'destructive',
                });
            }

    };

    const handleView = () => {
        router.push(`/vehicles/view/${vehicle.id}`);
    };

    const vehicleType = vehicle.tipo || 'Auto'; // Default to 'Auto' if tipo is missing

  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">

      <CardContent className="flex-grow p-4 space-y-2">
        <CardTitle className="text-lg font-semibold text-primary truncate">{vehicle.brand} - {vehicle.model}</CardTitle>
        <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5"> <Calendar className="w-3.5 h-3.5"/> Año: {vehicle.year}</div>
            <div className="flex items-center gap-1.5">
              {vehicleType === 'Moto' ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
              Tipo: {vehicleType}
            </div>
            <div className="flex items-center gap-1.5"> <Palette className="w-3.5 h-3.5"/> Color de Cable: {vehicle.colors}</div>
            <div className="flex items-center gap-1.5"> <Wrench className="w-3.5 h-3.5"/> Corte: {vehicle.corte}</div>
            <div className="flex items-center gap-1.5"> <MapPin className="w-3.5 h-3.5"/> Ubicación de corte: {vehicle.ubicacion}</div>

        </div>
         {vehicle.observation && (
            <CardDescription className="text-xs pt-2 border-t border-border">
                <strong>Observation:</strong> {vehicle.observation}
            </CardDescription>
         )}
      </CardContent>
        <CardFooter className="p-4 pt-0 border-t border-border flex justify-between gap-2">
         <Button variant="ghost" size="sm" onClick={handleView}>
             <Eye className="h-4 w-4" /> <span className="sr-only">View</span>
         </Button>
         <Link href={`/vehicles/edit/${vehicle.id}`} passHref>
            <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
            </Button>
         </Link>
         {userProfile !== 'tecnico' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Esta seguro de eliminar el vehículo?</AlertDialogTitle>
                <AlertDialogDescription>Esta acción no se puede revertir.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
         )}

      </CardFooter>
    </Card>
  );
}
