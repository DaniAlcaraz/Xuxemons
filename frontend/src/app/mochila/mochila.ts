// Importaciones de Angular necesarias para el componente
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router'; // Para navegación entre rutas
import { FormsModule } from '@angular/forms'; // Para ngModel y formularios
import { CommonModule } from '@angular/common'; // Para directivas comunes (ngFor, ngIf, etc.)
import { MochilaService } from '../Services/mochila'; // Servicio para comunicarse con la API de mochila
import { AuthService } from '../Services/auth.service'; // Servicio de autenticación

// Definición de tipo para las rarezas disponibles en el juego
export type Rareza = 'común' | 'raro' | 'épico' | 'legendario';

/**
 * Interfaz para items apilables (como xuxes)
 * Estos items pueden agruparse en stacks de hasta TAM_STACK unidades
 */
export interface ItemApilable {
  id: number; // ID único del tipo de item
  name: string; // Nombre del item
  kind: 'apilable'; // Tipo de item: apilable (se puede agrupar en stacks)
  quantity: number; // Cantidad total de este item
  img: string; // Emoji o imagen que representa el item
  description: string; // Descripción del item
  rareza: Rareza; // Rareza del item
}

/**
 * Interfaz para items simples (como vacunas)
 * Estos items ocupan un espacio individual cada uno
 */
export interface ItemSimple {
  id: number; // ID único del tipo de item
  name: string; 
  kind: 'simple'; // Tipo de item: simple (cada unidad ocupa un espacio)
  quantity: number; 
  img: string; 
  description: string; 
  rareza: Rareza; 
}

// Tipo union que puede ser cualquiera de los dos tipos de items
export type Item = ItemApilable | ItemSimple;

// Interfaz para los items de navegación de la barra inferior
interface NavItem { icon: string; label: string; route: string; }

// Constantes del sistema de mochila (espacios y stack maximo permitido)
const MAX_ESPACIOS = 20;
const TAM_STACK = 5;

//Contante que contiene el nombre de cada xuxe y su emoji representativo
const EMOJIS: Record<string, string> = {
  'Xuxe Roja':           '🔴',
  'Xuxe Azul':           '🔵',
  'Xuxe Dorada':         '🟡',
  'Chocolatina':         '🍫',
  'Mermelada de frutas': '🍓',
  'Insulina':            '💉',
};

// Decorador que define el componente
@Component({
  selector: 'app-mochila',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './mochila.html',
  styleUrls: ['./mochila.css']
})

// Propiedades del componente
export class Mochila implements OnInit {

  items: Item[] = []; // Array que almacena todos los items de la mochila
  cargando = true; // Indicador de carga (true = mostrando spinner)
  searchQuery = ''; // Texto de búsqueda para filtrar items
  selectedFilter = 'Todos'; // Filtro seleccionado actualmente
  filters = ['Todos', 'Xuxes', 'Vacunas']; // Opciones de filtro

  constructor(
    private mochilaService: MochilaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  //Ciclo de vida: se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.cargarMochila();
  }

   /* Carga los items de la mochila desde el servidor
   *  Transforma los datos recibidos al formato necesario para la vista
   */
  cargarMochila(): void {
    this.cargando = true; // Activa indicador de carga

    // Llama al servicio para obtener la mochila del usuario
    this.mochilaService.getMochila().subscribe({
      next: (datos) => {
        // Mapea los datos de la API al formato de Item que usa el componente
        this.items = datos.map(entry => ({
          id: entry.item.id, // ID del item
          name: entry.item.nombre, // Nombre del item
          kind: entry.item.tipo === 'xuxe' ? 'apilable' : 'simple', // Tipo según sea xuxe o no
          quantity: entry.cantidad, // Cantidad del item 
          img: EMOJIS[entry.item.nombre] ?? '📦', // Emoji correspondiente o de caja por defecto
          description: entry.item.descripcion, // Descripción del item
          rareza: entry.item.rareza as Rareza, // Rareza con cast al tipo Rareza
        }));
        this.cargando = false; // Desactiva indicador de carga
        this.cdr.detectChanges(); // Fuerza actualización de la vista
      },
      error: () => {
        this.cargando = false; // Desactiva indicador de carga en caso de error
        this.cdr.detectChanges(); // Fuerza actualización de la vista
      }
    });
  }

  /**
   * Calcula cuántos espacios ocupa un item en la mochila
   * @param item - Item a evaluar
   * @returns Número de espacios que ocupa
   */
  espaciosDe(item: Item): number {
    // Si es apilable, divide la cantidad entre el tamaño del stack y redondea hacia arriba
    // Si es simple, cada unidad ocupa un espacio
    return item.kind === 'apilable' ? Math.ceil(item.quantity / TAM_STACK) : item.quantity;
  }

  /**
   * Getter que calcula el total de espacios usados en la mochila
   * @returns Número total de espacios ocupados
   */
  get espaciosUsados(): number {
    // Suma los espacios que ocupa cada item en el array
    return this.items.reduce((total, item) => total + this.espaciosDe(item), 0);
  }
  /**
   * Getter que calcula los espacios libres restantes
   * @returns Número de espacios disponibles
   */
  get espaciosLibres(): number { 
    // Espacios máximos menos los espacios usados
    return MAX_ESPACIOS - this.espaciosUsados; }

  /**
   * Getter que indica si la mochila está completamente llena
   * @returns true si no hay espacios libres
   */
  get mochilaLlena(): boolean { return this.espaciosUsados >= MAX_ESPACIOS; }
  
  /**
   * Getter que genera los slots visuales de la mochila
   * Para items apilables: crea stacks completos y un stack parcial si sobra
   * Para items simples: crea un slot por cada unidad
   * @returns Array de objetos con el item, cantidad y índice del stack
   */
  get slotsRellenos(): { item: Item; cantidad: number; stackIndex: number }[] {
    const slots: { item: Item; cantidad: number; stackIndex: number }[] = [];
    // Itera sobre cada tipo de item
    for (const item of this.items) {
      if (item.kind === 'apilable') {
        // Para items apilables: calcula stacks completos y resto
        const completos = Math.floor(item.quantity / TAM_STACK); // Stacks llenos
        const resto = item.quantity % TAM_STACK; // Unidades sobrantes
        // Agrega slots para cada stack completo
        for (let i = 0; i < completos; i++) slots.push({ item, cantidad: TAM_STACK, stackIndex: i });
        // Agrega un slot adicional si hay resto
        if (resto > 0) slots.push({ item, cantidad: resto, stackIndex: completos });

      } else {
        // Para items simples: cada unidad es un slot individual
        for (let i = 0; i < item.quantity; i++) slots.push({ item, cantidad: 1, stackIndex: i });
      }
    }
    return slots;
  }

  /**
   * Getter que prepara los slots para mostrar en la interfaz
   * Aplica filtros de búsqueda y categoría, y rellena con espacios vacíos
   * @returns Array de slots (rellenos o null para vacíos)
   */
  get displaySlots() {
    let rellenos = this.slotsRellenos; // Comienza con todos los slots rellenos
    // Aplica filtro de búsqueda si hay texto
    if (this.searchQuery)
      rellenos = rellenos.filter(s => s.item.name.toLowerCase().includes(this.searchQuery.toLowerCase()));

    //Aplica filtro por categoría
    if (this.selectedFilter === 'Xuxes') rellenos = rellenos.filter(s => s.item.kind === 'apilable');
    if (this.selectedFilter === 'Vacunas') rellenos = rellenos.filter(s => s.item.kind === 'simple');
    
    // Crea array de espacios vacíos para completar la cuadrícula
    const vacios = Array(Math.max(0, MAX_ESPACIOS - rellenos.length)).fill(null);
    
    // Combina slots rellenos con espacios vacíos
    return [...rellenos, ...vacios];
  }

  /**
   * Getter que filtra solo los items apilables de la mochila
   * @returns Array de items apilables
   */
  get itemsApilables(): ItemApilable[] {
    // Filtra items por tipo 'apilable' y hace cast del tipo
    return this.items.filter((i): i is ItemApilable => i.kind === 'apilable');
  }

  // Configuración de los items de navegación de la barra inferior
  navItems: NavItem[] = [
    { icon: '🏠', label: 'Inicio',   route: '/dashboard' },
    { icon: '📖', label: 'Xuxemons', route: '/xuxemons'  },
    { icon: '🎒', label: 'Mochila',  route: '/mochila'   },
    { icon: '👥', label: 'Amigos',   route: '/amigos'    },
    { icon: '⚔️', label: 'Batallas', route: '/batallas'  },
    { icon: '💬', label: 'Chat',     route: '/chat'      },
    { icon: '👤', label: 'Perfil',   route: '/perfil'    },
    { icon: '🛡️', label: 'Admin',    route: '/admin'     },
  ];
}