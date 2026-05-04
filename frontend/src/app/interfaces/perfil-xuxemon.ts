// Interfaz que define la estructura de un Xuxemon mostrado en el perfil del usuario. Representa la información resumida de un Xuxemon para mostrarla en tarjetas o listas
export interface PerfilXuxemon {

  /* Nombre del Xuxemon (ej: "Charmander", "Pikachu", "Bulbasaur") */
  name: string;

  /* Tipo elemental del Xuxemon (ej: "Fuego", "Agua", "Planta", "Eléctrico") */
  type: string;

  /* Nivel actual del Xuxemon (determina su poder y habilidades desbloqueadas) */
  level: number;

  /* Puntos de vida actuales del Xuxemon (Health Points) */
  hp: number;
  
  /* URL o ruta de la imagen/emoji que representa visualmente al Xuxemon */
  img: string;
}
