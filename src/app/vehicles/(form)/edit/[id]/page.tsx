import VehicleForm from '../../_components/vehicle-form';
import { getVehicleById } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

interface EditVehiclePageProps {
  params: { id: string };
}

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  const { id } = params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    notFound(); // Show 404 if vehicle doesn't exist
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-foreground">Edit Vehicle</h1>
      <VehicleForm initialData={vehicle} vehicleId={id} />
    </div>
  );
}
