'use client';

import VehicleForm from '../(form)/_components/vehicle-form';

export default function NewVehiclePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-foreground">Agregar Nuevo</h1>
      <VehicleForm />
    </div>
  );
}