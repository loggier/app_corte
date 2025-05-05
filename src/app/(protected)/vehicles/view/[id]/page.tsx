import { notFound } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getVehicleById } from './getVehicleData';
import ViewVehicleClient from './_components/view-vehicle-client';
import { Vehicle } from '@/lib/definitions';

export async function generateStaticParams() {
  const vehiclesCollection = collection(db, 'vehicles');
  const vehicleSnapshot = await getDocs(vehiclesCollection);

  // Mapear los documentos para obtener solo los IDs
  const params = vehicleSnapshot.docs.map(doc => ({
    id: doc.id,
  }));

  return params;
}

interface ViewVehiclePageProps {
  params: { id: string };
}
export default async function ViewVehiclePage({ params }: ViewVehiclePageProps) {
  const vehicle: Vehicle | null = await getVehicleById(params.id);
  if(!vehicle){
    notFound();
  }
  return <ViewVehicleClient vehicle={vehicle}/>;
}
