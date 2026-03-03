export interface Xuxemon {
  id: number;
  nombre: string;
  tipo: 'Aigua' | 'Terra' | 'Aire';  // Coincide con el ENUM de Laravel
  tamano: 'Petit' | 'Mitjà' | 'Gran'; // Coincide con el ENUM de Laravel
  imagen?: string;
}
