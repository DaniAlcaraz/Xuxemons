import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../Services/auth.service';
import { CommonModule } from '@angular/common';

// Tipos personalizados para seleccionar los valores posibles
export type TipoXuxemon = 'Tierra' | 'Aire' | 'Agua';
export type TamanoXuxemon = 'Pequeño' | 'Mediano' | 'Grande';

// Interfaz que define la estructura de un Xuxemon
export interface Xuxemon {
  IDxuxemon: number;
  nombre: string;
  tipo: TipoXuxemon;
  tamano: TamanoXuxemon;
  xuxes_acumuladas: number; // Cuántas xuxes lleva acumuladas hacia la evolución
  archivo: string;
  img: string;
  enfermo: boolean;
  enfermedad: string | null; // null si está sano
}

// Interfaz para los items de la barra de navegación inferior
interface NavItem { icon: string; label: string; route: string; }

//Xuxmeons: nombre y emoji
const EMOJIS: Record<string, string> = {
  'Apleki': '🐌', 'Avecrem': '🐔', 'Bambino': '🦌',
  'Beeboo': '🐝', 'Boo-hoot': '🦉', 'Cabrales': '🐐',
  'Catua': '🦜', 'Catyuska': '🦢', 'Chapapá': '🐸',
  'Chopper': '🐱', 'Cuellilargui': '🦕', 'Deskangoo': '🦘',
  'Doflamingo': '🦩', 'Dolly': '🐑', 'Elconchudo': '🦀',
  'Eldientes': '🦛', 'Elgominas': '🦔', 'Flipper': '🐬',
  'Floppi': '🐒', 'Horseluis': '🦄', 'Krokolisko': '🐊',
  'Kurama': '🦊', 'Ladybug': '🐞', 'Lengualargui': '🦎',
  'Medusation': '🐟', 'Meekmeek': '🐭', 'Megalo': '🦈',
  'Mocha': '🐳', 'Murcimurci': '🦇', 'Nemo': '🐠',
  'Oinkcelot': '🐷', 'Oreo': '🐄', 'Otto': '🦦',
  'Pinchimott': '🦀', 'Pollis': '🐣', 'Posón': '🦋',
  'Quakko': '🦆', 'Rajoy': '🕊️', 'Rawlion': '🦁',
  'Rexxo': '🦖', 'Ron': '🐈', 'Sesssi': '🐍',
  'Shelly': '🐢', 'Sirucco': '🦅', 'Torcas': '🦒',
  'Trompeta': '🐦', 'Trompi': '🐘', 'Tux': '🐧',
};

@Component({
  selector: 'app-xuxemons',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './xuxemons.html',
  styleUrls: ['./xuxemons.css']
})
export class Xuxemons implements OnInit {

   // Filtros de búsqueda
  searchQuery = '';
  filterTipo: string = 'Todos';
  filterTamano: string = 'Todos';

  tiposFiltro = ['Todos', 'Tierra', 'Aire', 'Agua'];
  tamanosFiltro = ['Todos', 'Pequeño', 'Mediano', 'Grande'];

  // Datos principales
  private apiUrl = 'http://localhost:8000/api';
  xuxemons: Xuxemon[] = [];
  userOwnedIds: number[] = [];
  cargando = true;
  mensajes: Record<number, string> = {};

  // Configuración de evolución (se carga desde la BD, estos son los valores por defecto)
  xuxesConfig = { pequeno_mediano: 3, mediano_grande: 5 };

  // Items de la mochila
  vacunasEnMochila: { item_id: number; nombre: string; cantidad: number }[] = [];
  xuxesEnMochila: { item_id: number; nombre: string; cantidad: number }[] = [];

  // Pop ups
  xuxemonACurar: Xuxemon | null = null; // Xuxemon seleccionado para curar
  vacunaSeleccionada: number | null = null; //Vacuna elegida en el modal
  mensajeCura = '';

  xuxemonAAlimentar: Xuxemon | null = null; // Xuxemon seleccionado para dar xuxe
  xuxeSeleccionada: number | null = null; // Xuxe elegida en el modal
  mensajeXuxe = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef, // Para forzar la actualización de la vista manualmente
    private router: Router
  ) {}

  // Se ejecuta automáticamente al cargar el componente
  ngOnInit(): void {
    const saved = localStorage.getItem('xuxemon_mensajes');
    if (saved) this.mensajes = JSON.parse(saved);
    this.cargarConfig();
  }

  // Obtiene de Laravel cuántas xuxes se necesitan para evolucionar
  cargarConfig(): void {
    const headers = { 'Authorization': `Bearer ${this.authService.obtenerToken()}` };
    this.http.get<any>(`${this.apiUrl}/configuracion/xuxes`, { headers }).subscribe({
      next: (data) => {
        // Actualiza los valores con los que tiene configurados el admin en la BD
        this.xuxesConfig = {
          pequeno_mediano: data.xuxes_pequeno_a_mediano,
          mediano_grande: data.xuxes_mediano_a_grande,
        };
        this.cargarDatos(); // Una vez tenemos la config, cargamos los xuxemons
      },
      error: () => { this.cargarDatos(); } // Si falla, carga igualmente con los valores por defecto
    });
  }

  // Carga la lista de xuxemons y los items de la mochila del usuario
  cargarDatos(): void {
    const token = this.authService.obtenerToken();
    if (!token) {
      this.router.navigate(['/login']); // Si no hay token, redirige al login
      return;
    }
    const headers = { 'Authorization': `Bearer ${token}` };
    this.cargando = true;

    // Primero obtiene el catálogo completo de xuxemons del juego
    this.http.get<Xuxemon[]>(`${this.apiUrl}/xuxemons`, { headers }).subscribe({
      next: (fullList) => {
        // Luego obtiene los xuxemons que tiene el usuario concretamente
        this.http.get<any[]>(`${this.apiUrl}/xuxemons/me`, { headers }).subscribe({
          next: (myList) => {
            // Crea un mapa para buscar rápidamente por ID
            const myMap = new Map(myList.map(x => [x.IDxuxemon, x]));

            // Combina el catálogo completo con los datos personales del usuario
            // Si el usuario tiene ese xuxemon, usa sus datos (tamaño, xuxes, enfermedad)
            // Si no lo tiene, usa los datos base del catálogo
            this.xuxemons = fullList.map(x => {
              const mine = myMap.get(x.IDxuxemon);
              return {
                ...x,
                tamano: mine ? mine.tamano : x.tamano,
                xuxes_acumuladas: mine ? mine.xuxes_acumuladas : 0,
                enfermo: mine ? mine.enfermo : false,
                enfermedad: mine ? mine.enfermedad : null,
              };
            });
            this.userOwnedIds = myList.map(x => x.IDxuxemon);
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            if (err.status === 401) {
              this.authService.cerrarSesion();
              this.router.navigate(['/login']);
            }
            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        if (err.status === 401) {
          this.authService.cerrarSesion();
          this.router.navigate(['/login']);
        }
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });

    // Cargar items de la mochila (Vacunas y Xuxes)
    this.http.get<any[]>(`${this.apiUrl}/mochila`, { headers }).subscribe({
      next: (mochila) => {
        // Separa los items de la mochila por tipo
        this.vacunasEnMochila = mochila
          .filter(e => e.item?.tipo === 'vacuna')
          .map(e => ({ item_id: e.item_id, nombre: e.item.nombre, cantidad: e.cantidad }));
        
        this.xuxesEnMochila = mochila
          .filter(e => e.item?.tipo === 'xuxe')
          .map(e => ({ item_id: e.item_id, nombre: e.item.nombre, cantidad: e.cantidad }));

        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 401) {
          this.authService.cerrarSesion();
          this.router.navigate(['/login']);
          return;
        }
      },
    });
  }

  // Comprueba si el usuario posee un xuxemon concreto
  isDiscovered(id: number): boolean { return this.userOwnedIds.includes(id); }
  // Devuelve el emoji correspondiente a un xuxemon, o un emoji de huevo si no esta definido en el array
  getEmoji(nombre: string): string { return EMOJIS[nombre] ?? '🥚'; }
  
  // Devuelve el mensaje de evolucion de un xuxemon si existe
  getMensaje(id: number): string { return this.mensajes[id] ?? ''; }

  // Calcula cuantas xuxes necesita un xuxemon para evolucionar
  // Si tiene "Bajon de azucar" necesita 2 xuxes extra
  xuxesNecesarias(tamano: TamanoXuxemon, enfermedad?: string | null): number {
    const base = tamano === 'Pequeño'
      ? this.xuxesConfig.pequeno_mediano
      : this.xuxesConfig.mediano_grande;
    return enfermedad === 'Bajón de azúcar' ? base + 2 : base;
  }

  // Getters para el contador de la Xuxedex
  get totalXuxemons(): number { return this.xuxemons.length; }
  get descubiertos(): number { return this.userOwnedIds.length; }

  // Filtra los xuxemons según búsqueda, tipo y tamaño seleccionados
  get filteredXuxemons(): Xuxemon[] {
    let list = this.xuxemons;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      // Solo busca entre los xuxemons descubiertos por el usuario
      list = list.filter(x => this.isDiscovered(x.IDxuxemon) && x.nombre.toLowerCase().includes(q));
    }
    if (this.filterTipo !== 'Todos') list = list.filter(x => x.tipo === this.filterTipo);
    if (this.filterTamano !== 'Todos') list = list.filter(x => x.tamano === this.filterTamano);
    return list;
  }

  // Devuelve la etiqueta visual del tamaño con su emoji
  tamanoLabel(t: TamanoXuxemon): string {
    if (t === 'Pequeño') return '🥚 Pequeño';
    if (t === 'Mediano') return '🌿 Mediano';
    return '⭐ Grande';
  }

  // --- POP UP DE CURAR ---
  
  // Abre el modal de curar con el xuxemon seleccionado y la primera vacuna disponible
  abrirModalCurar(xux: Xuxemon): void {
    this.xuxemonACurar = xux;
    this.vacunaSeleccionada = this.vacunasEnMochila.length > 0 ? this.vacunasEnMochila[0].item_id : null;
    this.mensajeCura = '';
  }

  cerrarModalCurar(): void {
    this.xuxemonACurar = null;
    this.vacunaSeleccionada = null;
    this.mensajeCura = '';
  }
  
  // Envía la petición a Laravel para curar al xuxemon con la vacuna seleccionada
  curar(): void {
    if (!this.xuxemonACurar || !this.vacunaSeleccionada) return;
    const headers = { 'Authorization': `Bearer ${this.authService.obtenerToken()}` };
    this.http.post<any>(`${this.apiUrl}/xuxemons/curar`, {
      xuxemon_id: this.xuxemonACurar.IDxuxemon,
      item_id: this.vacunaSeleccionada
    }, { headers }).subscribe({
      next: (res) => {
        this.mensajeCura = '✅ ' + res.message;
        this.cargarDatos(); // Recarga para reflejar el cambio de estado
        setTimeout(() => this.cerrarModalCurar(), 1500); // Cierra el modal tras 1.5s
      },
      error: (err) => {
        this.mensajeCura = '⚠️ ' + (err.error?.error || 'Error al curar');
        this.cdr.detectChanges();
      }
    });
  }
  // --- POP UP PARA DAR XUXE ---

  // Abre el modal de alimentar con el xuxemon seleccionado y la primera xuxe disponible
  abrirModalXuxe(xux: Xuxemon): void {
    this.xuxemonAAlimentar = xux;
    this.xuxeSeleccionada = this.xuxesEnMochila.length > 0 ? this.xuxesEnMochila[0].item_id : null;
    this.mensajeXuxe = '';
  }

  cerrarModalXuxe(): void {
    this.xuxemonAAlimentar = null;
    this.xuxeSeleccionada = null;
    this.mensajeXuxe = '';
  }

  // Envía la peticion a Laravel para dar una xuxe al xuxemon
  // Laravel comprueba si acumula suficientes para evolucionar
  darXuxe(): void {
    if (!this.xuxemonAAlimentar || !this.xuxeSeleccionada) return;
    const headers = { 'Authorization': `Bearer ${this.authService.obtenerToken()}` };
    this.http.post<any>(`${this.apiUrl}/xuxemons/${this.xuxemonAAlimentar.IDxuxemon}/evolucionar`, 
      { item_id: this.xuxeSeleccionada }, 
      { headers }
    ).subscribe({
      next: (res) => {
        // Guarda el mensaje de evolución en localStorage para persistirlo
        this.mensajes[this.xuxemonAAlimentar!.IDxuxemon] = res.message;
        localStorage.setItem('xuxemon_mensajes', JSON.stringify(this.mensajes));
        this.mensajeXuxe = '✅ ' + res.message;
        this.cargarConfig(); // Recarga xuxemons y mochila para reflejar cambios
        setTimeout(() => this.cerrarModalXuxe(), 1500);
      },
      error: (err) => {
        this.mensajeXuxe = '⚠️ ' + (err.error?.error || 'Error al dar xuxe');
        this.cdr.detectChanges();
      }
    });
  }

  // Items de la barra de navegacion inferior
  navItems: NavItem[] = [
    { icon: '🏠', label: 'Inicio', route: '/dashboard' },
    { icon: '📖', label: 'Xuxemons', route: '/xuxemons' },
    { icon: '🎒', label: 'Mochila', route: '/mochila' },
    { icon: '👥', label: 'Amigos', route: '/amigos' },
    { icon: '⚔️', label: 'Batallas', route: '/batallas' },
    { icon: '💬', label: 'Chat', route: '/chat' },
    { icon: '👤', label: 'Perfil', route: '/perfil' },
    { icon: '🛡️', label: 'Admin', route: '/admin' },
  ];
}