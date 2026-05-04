/**
 * Interfaz que define la estructura de un elemento de navegación
 * Se utiliza para configurar los botones/iconos de la barra de navegación inferior
 */
export interface NavItem {
  /*Emoji o icono que representa visualmente la sección (ej: '🏠', '👤', '⚔️') */
  icon: string;
  /* Etiqueta de texto que aparece debajo del icono (ej: 'Inicio', 'Perfil', 'Batallas') */
  label: string;
  /* Ruta de Angular a la que navega al hacer clic (ej: '/dashboard', '/perfil', '/batallas') */
  route: string;
}
