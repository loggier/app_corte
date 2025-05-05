'use server';

import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { revalidatePath } from 'next/cache';

export async function deleteVehicleAction(vehicleId: string) {
  try {
    await deleteDoc(doc(db, 'vehicles', vehicleId));
    // Revalidar la ruta de la lista de vehículos después de la eliminación exitosa
    revalidatePath('/vehicles');
    return { success: true }; // Indica éxito
  } catch (error) {
    console.error('Error deleting vehicle in Server Action:', error);
    return { success: false, error: (error as Error).message }; // Indica fallo con mensaje de error
  }
}