import type { Vehicle } from './definitions';

// In-memory store for vehicles
let vehicles: Vehicle[] = [
  {
    id: '1',
    model: 'Toyota Corolla',
    year: 2020,
    corte: 'Sistema A',
    bomba: 'Bomba X',
    corteIgnicion: 'Tipo 1',
    colors: 'Blanco, Negro',
    ubicacion: 'Patio Central',
    imageUrl: 'https://picsum.photos/300/200?random=1',
    observation: 'Pequeño rayon en puerta derecha.',
  },
  {
    id: '2',
    model: 'Honda Civic',
    year: 2019,
    corte: 'Sistema B',
    bomba: 'Bomba Y',
    corteIgnicion: 'Tipo 2',
    colors: 'Rojo',
    ubicacion: 'Estacionamiento Sur',
    imageUrl: 'https://picsum.photos/300/200?random=2',
    observation: 'Neumáticos nuevos.',
  },
   {
    id: '3',
    model: 'Ford F-150',
    year: 2022,
    corte: 'Sistema C',
    bomba: 'Bomba Z',
    corteIgnicion: 'Tipo 1',
    colors: 'Azul Marino',
    ubicacion: 'Sector Norte',
    imageUrl: 'https://picsum.photos/300/200?random=3',
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getVehicles(): Promise<Vehicle[]> {
  await delay(50); // Simulate network latency
  return [...vehicles]; // Return a copy to prevent direct mutation
}

export async function getVehicleById(id: string): Promise<Vehicle | undefined> {
  await delay(30);
  return vehicles.find(v => v.id === id);
}

export async function addVehicle(vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle> {
  await delay(80);
  const newId = String(Date.now() + Math.random()); // Simple unique ID generation
  const newVehicle: Vehicle = { ...vehicleData, id: newId };
  vehicles.push(newVehicle);
  return newVehicle;
}

export async function updateVehicle(id: string, vehicleData: Partial<Omit<Vehicle, 'id'>>): Promise<Vehicle | undefined> {
  await delay(80);
  const index = vehicles.findIndex(v => v.id === id);
  if (index !== -1) {
    vehicles[index] = { ...vehicles[index], ...vehicleData };
    return vehicles[index];
  }
  return undefined;
}

export async function deleteVehicle(id: string): Promise<boolean> {
  await delay(100);
  const initialLength = vehicles.length;
  vehicles = vehicles.filter(v => v.id !== id);
  return vehicles.length < initialLength;
}
