export interface Xuxemon {
  IDxuxemon: number;
  nombre: string;
  tipo: 'Agua' | 'Tierra' | 'Aire';
  tamano: 'Pequeño' | 'Mediano' | 'Grande';
  archivo: string;
  evolucion_puntos: number;
}

export interface EntradaColeccion {
  coleccion_id: number;
  xuxemon: Xuxemon;
}

export interface ColeccionResponse {
  total: number;
  coleccion: EntradaColeccion[];
}