
'use client';

import Image from 'next/image'
import Link from 'next/link'
import type { Vehicle, User } from '@/lib/definitions' // Import User type
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, MapPin, Palette, Calendar, Wrench, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'; // Import useState and useEffect

import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface VehicleCardProps { vehicle: Vehicle; }
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function VehicleCard({ vehicle }: VehicleCardProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [userProfile, setUserProfile] = useState<string | null>(null); // State for user profile

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
            await deleteDoc(doc(db, 'vehicles', vehicle.id));
            toast({
                title: 'Success',
                description: 'Vehicle deleted successfully.',
            });
            router.refresh();
            } catch (error) {
                console.error('Error deleting vehicle:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to delete vehicle.',
                    variant: 'destructive',
                });
            }


    };

    const handleView = () => {
        router.push(`/vehicles/view/${vehicle.id}`);
    };
  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">

      <CardContent className="flex-grow p-4 space-y-2">
        <CardTitle className="text-lg font-semibold text-primary truncate">{vehicle.brand} - {vehicle.model}</CardTitle>
        <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5"> <Calendar className="w-3.5 h-3.5"/> Año: {vehicle.year}</div>
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
         {/* Conditionally render the delete button based on user profile */}
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
