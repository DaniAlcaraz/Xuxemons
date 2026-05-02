// Importación de la interfaz Xuxemon para usarla en la lista de Xuxemons
import { Xuxemon } from './xuxemon';

//Interfaz que define la estructura del Xuxedex (Pokédex) de un entrenador. Representa la colección completa de Xuxemons que un jugador ha descubierto/registrado
export interface Xuxedex {
  /** ID único del usuario/entrenador al que pertenece este Xuxedex */
  usuario_id: number;

  /** Nombre del entrenador (del jugador)*/
  nombre_entrenador: string;

  //Lista completa de xuxemons que el jugador ha registrado en su Xuxedex. Cada xuxemon contiene su informacion detallada (nombre, tipo, tamaño...).
  listaXuxemons: Xuxemon[];

  // Número total de Xuxemons diferentes que el entrenador ha descubierto. Este valor puede ser menor o igual al total de Xuxemons existentes en el juego.
  total_descubiertos: number;
}