//Interfaz que define la estructura de un Xuxemon individual. Representa la información base de una criatura en el sistema
export interface Xuxemon {
  //ID unico del xuxemon en la base de datos
  IDxuxemon: number;

   // Nombre del Xuxemon (ej: "Fueguito", "Aquos", "Ventus")
  nombre: string;

  // Tipo elemental del Xuxemon. Solo puede ser uno de estos tres valores: 'Agua', 'Tierra' o 'Aire'
  tipo: 'Agua' | 'Tierra' | 'Aire';

  // Tamaño o categoría del Xuxemon. Solo puede ser: 'Pequeño', 'Mediano' o 'Grande'
  tamano: 'Pequeño' | 'Mediano' | 'Grande';

  //Nombre del archivo de imagen o emoji que representa al Xuxemon
  archivo: string;

  // Puntos de evolución necesarios para que este Xuxemon evolucione
  evolucion_puntos: number;
}

//Interfaz que representa una entrada individual en la colección de un entrenador. Relaciona al Xuxemon con el ID de la colección que lo contiene
export interface EntradaColeccion {

  //ID único de la entrada en la colección (relación entrenador-xuxemon)
  coleccion_id: number;

  // Objeto Xuxemon con toda la información de la criatura
  xuxemon: Xuxemon;
}

//Interfaz que define la respuesta de la API al obtener la colección de un entrenador. Incluye el total de Xuxemons y la lista de entradas de la colección
export interface ColeccionResponse {

  //Número total de Xuxemons diferentes que tiene el entrenador en su colección
  total: number;

  //Lista de entradas de la colección, cada una con su ID y el Xuxemon asociado
  coleccion: EntradaColeccion[];
}