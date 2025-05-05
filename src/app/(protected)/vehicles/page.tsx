"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { Suspense } from 'react';
import VehicleListWithSearch from './_components/vehicle-list-with-search';
import { Vehicle } from '@/lib/definitions';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useToast } from '@/hooks/use-toast';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'vehicles'));
      const fetchedVehicles: Vehicle[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Vehicle));
      setVehicles(fetchedVehicles);
    } catch (e) {
      console.error("Error fetching vehicles:", e);
      setError("Failed to fetch vehicles.");
      toast({
          title: "Error",
          description: `Failed to fetch vehicles. ${e}`,
          variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="container mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Lista de Vehículos</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchVehicles}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/vehicles/new" passHref>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Vehículo
            </Button>
          </Link>
        </div>
      </div>
      {loading && <div>Loading vehicles...</div>}
      {error && <div>Error: {error}</div>}
      {!loading && !error && (
        <Suspense fallback={<div>Loading vehicle list...</div>}>
          <VehicleListWithSearch vehicles={vehicles} onVehicleDeleted={fetchVehicles} />
        </Suspense>
      )}
    </div>
  );
}
