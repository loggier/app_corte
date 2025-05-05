"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Suspense, useEffect } from 'react';
import VehicleListWithSearch from './_components/vehicle-list-with-search';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function VehiclesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  return (
    <div className="container mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          Lista de Vehículos
        </h1>
        <Link href="/vehicles/new" passHref>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Vehículo
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading vehicles...</div>}>
        <VehicleListWithSearch />
      </Suspense>

    </div>
  );
}
