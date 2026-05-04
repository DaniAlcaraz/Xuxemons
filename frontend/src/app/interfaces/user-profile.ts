//Interfaz que define la estructura del perfil de usuario. Contiene la información personal y de progreso del jugador
export interface UserProfile {
  
  /** Nombre de usuario o apodo del jugador (ej: "EntrenadorXuxe") */
  name: string;

  /** Fecha de registro o antigüedad en el juego */
  since: string;

  /** Ubicación o región del jugador */
  location: string;

  /** Nivel general del jugador/entrenador (no confundir con nivel de Xuxemons) */
  level: number;

  /**Puntos de experiencia actuales acumulados por el jugador */
  xp: number;

  /** XP necesarios para subir al siguiente nivel */
  xpMax: number;
}
