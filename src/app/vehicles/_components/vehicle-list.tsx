import type { Vehicle } from '@/lib/definitions';
import VehicleCard from './vehicle-card';

interface VehicleListProps {
  vehicles: Vehicle[];
}

export default function VehicleList({ vehicles }: VehicleListProps) {
  if (!vehicles || vehicles.length === 0) {
    return <p className="text-center text-muted-foreground">No vehicles found. Add one to get started!</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
