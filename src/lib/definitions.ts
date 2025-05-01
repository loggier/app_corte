export type Vehicle = {
  id: string; // Unique identifier
  model: string;
  year: number;
  corte: string; // Assuming text, could be boolean if it's a yes/no
  bomba: string; // Assuming text
  corteIgnicion: string; // Assuming text
  colors: string; // Could be an array or comma-separated
  ubicacion: string;
  imageUrl?: string; // Optional image URL
  observation?: string; // Optional text area
};
