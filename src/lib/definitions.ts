
export interface Brand {
  id: string; // El ID del documento generado por Firebase
  name: string;
}

export interface Model {
  id: string; // El ID del documento generado por Firebase
  name: string;
  brandId: string; // Para relacionar el modelo con su marca
  createdAt?: any; // Optional: Firebase Timestamp or Date
}
export interface Vehicle {
  id: string; // Unique identifier
  brand: string;
  brandId?: string; // Added: Foreign key to the 'brands' collection
  model: string;
  modelId?: string; // Added: Foreign key to the 'models' collection
  year: number;
  corte: string; // ignicion, bomba de gasolina, fusilera
  colors: string;
  ubicacion: string; // ubicacion del corte de motor
  imageUrls: string[]; // array of url, max 5
  observation?: string; // comentario - made optional
  tipo?: 'Auto' | 'Moto' | 'Camion' | 'Maquinaria Pesada' | 'Otro'; // New optional field for vehicle type
  userEmail?: string; // Email of the user who created/last updated the record
};

export interface User {
  id: string;
  correo: string;
  nombre: string;
  empresa?: string;
  password?: string; // Password hash - should not be sent to client
  perfil: 'admin' | 'user' | 'tecnico'; // Example profiles including 'tecnico'
  status: 'activo' | 'inactivo';
  telefono?: string;
  createdAt?: any; // Firebase Timestamp or Date
  updatedAt?: any; // Firebase Timestamp or Date
}

export interface UserData {
    id: string;
    correo: string;
    nombre: string;
    empresa?: string;
    perfil: 'admin' | 'user' | 'tecnico';
    status?: 'activo' | 'inactivo'; // Make status optional if not always present
    telefono?: string;
    // Add other fields from your User interface that might be stored
}
