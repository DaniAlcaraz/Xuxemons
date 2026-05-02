/**
 * Interfaz que define la estructura de un logro/achievement en el juego
 * Se usa para representar los logros que un jugador puede desbloquear
 */
export interface Logro {
  /** Emoji o icono que representa visualmente el logro */
  icon: string;
  /** Nombre descriptivo del logro (ej: "Primera captura", "Maestro Xuxemon") */
  name: string;

  /** 
   * Indica si el logro ha sido desbloqueado por el jugador
   * true = desbloqueado (se muestra en color/activo)
   * false = bloqueado (se muestra en escala de grises/apagado)
   */
  unlocked: boolean;
}
