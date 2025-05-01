import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import VehicleList from './_components/vehicle-list';
import { getVehicles } from '@/lib/mock-data';

export const revalidate = 0; // Ensure data is fetched dynamically

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return (
    <div className="container mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Vehicle Inventory</h1>
        <Link href="/vehicles/new" passHref>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Vehicle
          </Button>
        </Link>
      </div>

      <VehicleList vehicles={vehicles} />
    </div>
  );
}
