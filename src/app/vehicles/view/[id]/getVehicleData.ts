import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Vehicle } from '@/lib/definitions'; // Adjust path if necessary

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  try {
    const vehicleRef = doc(db, 'vehicles', id);
    const vehicleSnap = await getDoc(vehicleRef);

    if (!vehicleSnap.exists()) {
      return null;
    }

    const vehicleData = vehicleSnap.data();
    return {
      id: vehicleSnap.id,
      ...vehicleData,
      imageUrls: vehicleData.imageUrls || [],
      year: vehicleData.year,
      brand: vehicleData.brand,
      model: vehicleData.model,
      corte: vehicleData.corte,
      colors: vehicleData.colors,
      ubicacion: vehicleData.ubicacion,
      observation: vehicleData.observation || '',
    } as Vehicle;

  } catch (error) {
    console.error(`Error fetching vehicle with ID ${id}:`, error);
    return null;
  }
}