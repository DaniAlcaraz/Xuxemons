import { Xuxemon } from './xuxemon';

export interface Xuxedex {
  usuario_id: number;
  nombre_entrenador: string;
  listaXuxemons: Xuxemon[];
  total_descubiertos: number;
}