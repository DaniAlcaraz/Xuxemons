//Interfaz que define las estadísticas generales de un jugador. Se utiliza para mostrar un resumen numérico de la actividad y progreso en el juego
export interface Stat {

  /** Número total de Xuxemons que posee el jugador (capturados o en su colección) */
  xuxemons: number;

  /** Número total de batallas en las que ha participado el jugador */
  batallas: number;

  /** Número de batallas ganadas por el jugador */
  victorias: number;

  /** Número de batallas perdidas por el jugador */
  derrotas: number;

  /** Número de amigos que tiene el jugador en su lista */
  amigos: number;

  /** Días totales que el jugador lleva registrado/jugando (racha o antigüedad) */
  dias: number;
}
