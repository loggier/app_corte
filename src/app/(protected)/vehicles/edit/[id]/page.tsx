
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Vehicle } from '@/lib/definitions'; // Adjust path if necessary
import { notFound, redirect } from 'next/navigation';

// Assume VehicleForm component exists and is imported
import VehicleForm from '../../(form)/_components/vehicle-form';

interface EditPageProps {
  params: { id: string };
}

async function getVehicleById(id: string): Promise<Vehicle | null> {
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
      brandId: vehicleData.brandId, // Include brandId
      model: vehicleData.model,
      modelId: vehicleData.modelId, // Include modelId
      corte: vehicleData.corte,
      colors: vehicleData.colors,
      ubicacion: vehicleData.ubicacion,
      observation: vehicleData.observation || '',
      tipo: vehicleData.tipo || 'Auto',
      userEmail: vehicleData.userEmail || '', // Add userEmail
    } as Vehicle;

  } catch (error) {
    console.error(`Error fetching vehicle with ID ${id}:`, error);
    return null;
  }
}
export async function _generateStaticParams() {
  const vehiclesCollection = collection(db, 'vehicles');
  const vehicleSnapshot = await getDocs(vehiclesCollection);
  const params = vehicleSnapshot.docs.map(doc => ({
    id: doc.id,
  }));
  return params;
}

export default async function EditVehiclePage({ params }: EditPageProps) {
  const vehicleId = params.id;
  const vehicle = await getVehicleById(vehicleId);
    if (!vehicle) {
    notFound();
    }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Editar Vehículo</h1>
      <VehicleForm initialData={vehicle} vehicleId={vehicleId}/>
    </div>
  );
}
