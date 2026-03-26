import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../Services/auth.service';
import { CommonModule } from '@angular/common';

export type TipoXuxemon = 'Tierra' | 'Aire' | 'Agua';
export type TamanoXuxemon = 'Pequeño' | 'Mediano' | 'Grande';

export interface Xuxemon {
  IDxuxemon: number;
  nombre: string;
  tipo: TipoXuxemon;
  tamano: TamanoXuxemon;
  xuxes_acumuladas: number;
  archivo: string;
  img: string;
  enfermo: boolean;
  enfermedad: string | null;
}

interface NavItem { icon: string; label: string; route: string; }

const EMOJIS: Record<string, string> = {
  'Apleki': '🐌', 'Avecrem': '🐔', 'Bambino': '🦌',
  'Beeboo': '🐝', 'Boo-hoot': '🦉', 'Cabrales': '🐐',
  'Catua': '🦜', 'Catyuska': '🕊️', 'Chapapá': '🐸',
  'Chopper': '🐱', 'Cuellilargui': '🦕', 'Deskangoo': '🦘',
  'Doflamingo': '🦩', 'Dolly': '🐑', 'Elconchudo': '🦀',
  'Eldientes': '🦛', 'Elgominas': '🦔', 'Flipper': '🐬',
  'Floppi': '🐒', 'Horseluis': '🦄', 'Krokolisko': '🐊',
  'Kurama': '🦊', 'Ladybug': '🐞', 'Lengualargui': '🦎',
  'Medusation': '🪼', 'Meekmeek': '🐭', 'Megalo': '🦈',
  'Mocha': '🐳', 'Murcimurci': '🦇', 'Nemo': '🐠',
  'Oinkcelot': '🐷', 'Oreo': '🐄', 'Otto': '🦦',
  'Pinchimott': '🦀', 'Pollis': '🐣', 'Posón': '🦋',
  'Quakko': '🦆', 'Rajoy': '🕊️', 'Rawlion': '🦁',
  'Rexxo': '🦖', 'Ron': '🐈', 'Sesssi': '🐍',
  'Shelly': '🐢', 'Sirucco': '🦅', 'Torcas': '🦫',
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

  searchQuery = '';
  filterTipo: string = 'Todos';
  filterTamano: string = 'Todos';

  tiposFiltro = ['Todos', 'Tierra', 'Aire', 'Agua'];
  tamanosFiltro = ['Todos', 'Pequeño', 'Mediano', 'Grande'];

  private apiUrl = 'http://localhost:8000/api';
  xuxemons: Xuxemon[] = [];
  userOwnedIds: number[] = [];
  cargando = true;
  mensajes: Record<number, string> = {};
  xuxesConfig = { pequeno_mediano: 3, mediano_grande: 5 };

  vacunasEnMochila: { item_id: number; nombre: string; cantidad: number }[] = [];

  xuxemonACurar: Xuxemon | null = null;
  vacunaSeleccionada: number | null = null;
  mensajeCura = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const saved = localStorage.getItem('xuxemon_mensajes');
    if (saved) this.mensajes = JSON.parse(saved);
    this.cargarConfig();
  }

  cargarConfig(): void {
    const headers = { 'Authorization': `Bearer ${this.authService.obtenerToken()}` };
    this.http.get<any>(`${this.apiUrl}/configuracion/xuxes`, { headers }).subscribe({
      next: (data) => {
        this.xuxesConfig = {
          pequeno_mediano: data.xuxes_pequeno_a_mediano,
          mediano_grande: data.xuxes_mediano_a_grande,
        };
        this.cargarDatos();
      },
      error: () => { this.cargarDatos(); }
    });
  }

  cargarDatos(): void {
    const headers = { 'Authorization': `Bearer ${this.authService.obtenerToken()}` };
    this.cargando = true;

    this.http.get<Xuxemon[]>(`${this.apiUrl}/xuxemons`, { headers }).subscribe({
      next: (fullList) => {
        this.http.get<any[]>(`${this.apiUrl}/xuxemons/me`, { headers }).subscribe({
          next: (myList) => {
            const myMap = new Map(myList.map(x => [x.IDxuxemon, x]));
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
          error: () => { this.cargando = false; this.cdr.detectChanges(); }
        });
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
    });

    const headers2 = { 'Authorization': `Bearer ${this.authService.obtenerToken()}` };
    this.http.get<any[]>(`${this.apiUrl}/mochila`, { headers: headers2 }).subscribe({
      next: (mochila) => {
        this.vacunasEnMochila = mochila
          .filter(e => e.item?.tipo === 'vacuna')
          .map(e => ({ item_id: e.item_id, nombre: e.item.nombre, cantidad: e.cantidad }));
        this.cdr.detectChanges();
      }
    });
  }

  isDiscovered(id: number): boolean {
    return this.userOwnedIds.includes(id);
  }

  getEmoji(nombre: string): string {
    return EMOJIS[nombre] ?? '🥚';
  }

  getMensaje(id: number): string {
    return this.mensajes[id] ?? '';
  }

  /**
   * Xuxes necesarias para evolucionar, aplicando modificadores de enfermedad:
   * - "Bajón de azúcar": +2 sobre el valor base
   * - "Atracón": mismo valor base (el botón se bloquea en la vista)
   */
  xuxesNecesarias(tamano: TamanoXuxemon, enfermedad?: string | null): number {
    const base = tamano === 'Pequeño'
      ? this.xuxesConfig.pequeno_mediano
      : this.xuxesConfig.mediano_grande;
    return enfermedad === 'Bajón de azúcar' ? base + 2 : base;
  }

  get totalXuxemons(): number { return this.xuxemons.length; }
  get descubiertos(): number { return this.userOwnedIds.length; }

  get filteredXuxemons(): Xuxemon[] {
    let list = this.xuxemons;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(x => this.isDiscovered(x.IDxuxemon) && x.nombre.toLowerCase().includes(q));
    }
    if (this.filterTipo !== 'Todos') list = list.filter(x => x.tipo === this.filterTipo);
    if (this.filterTamano !== 'Todos') list = list.filter(x => x.tamano === this.filterTamano);
    return list;
  }

  nextTamano(t: TamanoXuxemon): TamanoXuxemon | null {
    if (t === 'Pequeño') return 'Mediano';
    if (t === 'Mediano') return 'Grande';
    return null;
  }

  canEvolve(xux: Xuxemon): boolean {
    // Atracón bloquea; Bajón de azúcar permite evolucionar pero con más xuxes
    return this.isDiscovered(xux.IDxuxemon)
      && xux.tamano !== 'Grande'
      && xux.enfermedad !== 'Atracón';
  }

  evolucionar(xux: Xuxemon): void {
    const headers = { 'Authorization': `Bearer ${this.authService.obtenerToken()}` };
    this.http.post<any>(`${this.apiUrl}/xuxemons/${xux.IDxuxemon}/evolucionar`, {}, { headers }).subscribe({
      next: (res) => {
        this.mensajes[xux.IDxuxemon] = res.message;
        localStorage.setItem('xuxemon_mensajes', JSON.stringify(this.mensajes));
        this.cargarConfig();
      },
      error: (err) => {
        // FIX: en vez de alert(), mostramos el error como mensaje inline en la carta
        this.mensajes[xux.IDxuxemon] = '⚠️ ' + (err.error?.error || 'Error al evolucionar');
        localStorage.setItem('xuxemon_mensajes', JSON.stringify(this.mensajes));
        this.cdr.detectChanges();
      }
    });
  }

  tamanoLabel(t: TamanoXuxemon): string {
    if (t === 'Pequeño') return '🥚 Pequeño';
    if (t === 'Mediano') return '🌿 Mediano';
    return '⭐ Grande';
  }

  abrirModalCurar(xux: Xuxemon): void {
    this.xuxemonACurar = xux;
    this.vacunaSeleccionada = this.vacunasEnMochila.length > 0
      ? this.vacunasEnMochila[0].item_id
      : null;
    this.mensajeCura = '';
  }

  cerrarModalCurar(): void {
    this.xuxemonACurar = null;
    this.vacunaSeleccionada = null;
    this.mensajeCura = '';
  }

  curar(): void {
    if (!this.xuxemonACurar || !this.vacunaSeleccionada) return;
    const headers = { 'Authorization': `Bearer ${this.authService.obtenerToken()}` };
    this.http.post<any>(`${this.apiUrl}/xuxemons/curar`, {
      xuxemon_id: this.xuxemonACurar.IDxuxemon,
      item_id: this.vacunaSeleccionada
    }, { headers }).subscribe({
      next: (res) => {
        this.mensajeCura = '✅ ' + res.message;
        this.cargarDatos();
        setTimeout(() => this.cerrarModalCurar(), 1500);
      },
      error: (err) => {
        this.mensajeCura = '⚠️ ' + (err.error?.error || 'Error al curar');
        this.cdr.detectChanges();
      }
    });
  }

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