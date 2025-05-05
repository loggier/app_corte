'use client';

import { useState, useEffect, useMemo, useCallback } from 'react'; // Keep useMemo
import { useSearchParams } from 'next/navigation';
import { Vehicle } from '@/lib/definitions'; // Keep Vehicle import
import VehicleCard from './vehicle-card';
import VehicleSearchBar from './vehicle-search-bar';

interface VehicleListWithSearchProps {
  vehicles: Vehicle[];
  fetchVehicles: () => Promise<void>;
  onVehicleDeleted: () => void; // Add onVehicleDeleted prop
}

export default function VehicleListWithSearch({ vehicles, fetchVehicles, onVehicleDeleted }: VehicleListWithSearchProps) {
  const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');

    // Sync internal state with URL search param on initial load
    useEffect(() => {
        const initialSearch = searchParams.get('search') || '';
        setSearchTerm(initialSearch);
    }, [searchParams]);

  // Filter vehicles based on the search term
  const filteredVehicles = useMemo(() => {
    if (!searchTerm) {
      return vehicles;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return vehicles.filter(vehicle => {
      const lowerCaseBrand = vehicle.brand.toLowerCase();
      const lowerCaseModel = vehicle.model.toLowerCase();

      // Check if the search term is included in either brand or model
      return lowerCaseBrand.includes(lowerCaseSearchTerm) || lowerCaseModel.includes(lowerCaseSearchTerm);
    });
  }, [vehicles, searchTerm]); // Re-filter when vehicles data or search term changes

  // Function to update the internal search term state
  // This will be passed to VehicleSearchBar
  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
    // VehicleSearchBar is responsible for updating the URL
  };

  if (vehicles.length === 0) {
    return <p className="text-center text-muted-foreground">No vehicles available.</p>;
  }

    return (
        <>
            <div className="mb-4">
                {/* Pass the current searchTerm and a callback to update it */}
                <VehicleSearchBar initialSearchTerm={searchTerm} onSearchTermChange={handleSearchTermChange} />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {filteredVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} onVehicleDeleted={onVehicleDeleted} />
                ))}
            </div>
        </>
    );
};
