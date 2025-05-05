'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,

} from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast";
import { deleteDoc, doc } from 'firebase/firestore'; // Import deleteDoc and doc
import { db } from '@/firebase/config'; // Import your Firebase config


interface DeleteVehicleButtonProps {
  vehicleId: string;
}

export default function DeleteVehicleButton({ vehicleId }: DeleteVehicleButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
      try {
        await deleteDoc(doc(db, 'vehicles', vehicleId)); // Delete from Firebase
        toast({
          title: "Success",
          description: "Vehicle deleted successfully.",
          variant: "default",
        });
        router.refresh(); // Refresh the page
        setIsOpen(false); // Close the dialog on success
      } catch (error) {
        console.error('Delete failed:', error);
        toast({
          title: "Error",
          description: "Failed to delete vehicle.",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isDeleting}>
          {isDeleting ? (
             <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
           <span className="sr-only">Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the vehicle data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
             {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

