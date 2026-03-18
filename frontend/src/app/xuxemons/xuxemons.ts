import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../Services/auth.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
export type TipoXuxemon = 'Tierra' | 'Aire' | 'Agua';
export type TamanoXuxemon = 'Pequeño' | 'Mediano' | 'Grande';

export interface Xuxemon {
  IDxuxemon: number;
  nombre: string;
  tipo: TipoXuxemon;
  tamano: TamanoXuxemon;
  img: string;
}

interface NavItem { icon: string; label: string; route: string; }

const EMOJIS: Record<string, string> = {
  'Apleki':       '🐌', 'Avecrem':      '🐔', 'Bambino':      '🦌',
  'Beeboo':       '🐝', 'Boo-hoot':     '🦉', 'Cabrales':     '🐐',
  'Catua':        '🦜', 'Catyuska':     '🕊️', 'Chapapá':      '🐸',
  'Chopper':      '🐱', 'Cuellilargui': '🦕', 'Deskangoo':    '🦘',
  'Doflamingo':   '🦩', 'Dolly':        '🐑', 'Elconchudo':   '🦀',
  'Eldientes':    '🦛', 'Elgominas':    '🦔', 'Flipper':      '🐬',
  'Floppi':       '🐒', 'Horseluis':    '🦄', 'Krokolisko':   '🐊',
  'Kurama':       '🦊', 'Ladybug':      '🐞', 'Lengualargui': '🦎',
  'Medusation':   '🪼', 'Meekmeek':     '🐭', 'Megalo':       '🦈',
  'Mocha':        '🐳', 'Murcimurci':   '🦇', 'Nemo':         '🐠',
  'Oinkcelot':    '🐷', 'Oreo':         '🐄', 'Otto':         '🦦',
  'Pinchimott':   '🦀', 'Pollis':       '🐣', 'Posón':        '🦋',
  'Quakko':       '🦆', 'Rajoy':        '🕊️', 'Rawlion':      '🦁',
  'Rexxo':        '🦖', 'Ron':          '🐈', 'Sesssi':       '🐍',
  'Shelly':       '🐢', 'Sirucco':      '🦅', 'Torcas':       '🦫',
  'Trompeta':     '🐦', 'Trompi':       '🐘', 'Tux':          '🐧',
};


@Component({
  selector: 'app-xuxemons',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './xuxemons.html',
  styleUrls: ['./xuxemons.css']
})
export class Xuxemons {

  searchQuery = '';
  filterTipo: string = 'Todos';
  filterTamano: string = 'Todos';

  tiposFiltro = ['Todos', 'Tierra', 'Aire', 'Agua'];
  tamanosFiltro = ['Todos', 'Pequeño', 'Mediano', 'Grande'];

  private apiUrl = 'http://localhost:8000/api';
  xuxemons: Xuxemon[] = [];
  userOwnedIds: number[] = [];
  cargando = true;

  constructor(private http: HttpClient, private authService: AuthService, private cdr: ChangeDetectorRef) {}

ngOnInit(): void {
  console.log('Token:', this.authService.obtenerToken());
  this.cargarDatos();
}

  cargarDatos(): void {
  const headers = { 'Authorization': `Bearer ${this.authService.obtenerToken()}` };
  this.cargando = true;
  
  this.http.get<Xuxemon[]>(`${this.apiUrl}/xuxemons`, { headers }).subscribe({
    next: (fullList) => {
      console.log('Catálogo xuxemons:', fullList); 
      this.xuxemons = fullList;
      this.http.get<any[]>(`${this.apiUrl}/xuxemons/me`, { headers }).subscribe({
        next: (myList) => {
          console.log('Mis xuxemons:', myList); 
          this.userOwnedIds = myList.map(x => x.IDxuxemon);
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error /xuxemons/me:', err);  
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    },
    error: (err) => {
      console.error('Error /xuxemons:', err);  
      this.cargando = false;
    }
  });
}

  isDiscovered(id: number): boolean {
    return this.userOwnedIds.includes(id);
  }

  getEmoji(nombre: string): string {
    return EMOJIS[nombre] ?? '🥚';
  }

  // ── Computed 
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

  // ── Evolución 
  nextTamano(t: TamanoXuxemon): TamanoXuxemon | null {
    if (t === 'Pequeño') return 'Mediano';
    if (t === 'Mediano') return 'Grande';
    return null;
  }

  evolucionar(xux: Xuxemon): void {
    const headers = { 'Authorization': `Bearer ${this.authService.obtenerToken()}` };
    this.http.post<any>(`${this.apiUrl}/xuxemons/${xux.IDxuxemon}/evolucionar`, {}, { headers }).subscribe({
      next: (res) => {
        console.log('Evolución exitosa:', res);
        this.cargarDatos(); // Recargar para ver el nuevo tamaño
      },
      error: (err) => console.error('Error al evolucionar:', err)
    });
  }

  canEvolve(xux: Xuxemon): boolean {
    return this.isDiscovered(xux.IDxuxemon) && xux.tamano !== 'Grande';
  }

  tamanoLabel(t: TamanoXuxemon): string {
    if (t === 'Pequeño') return '🥚 Pequeño';
    if (t === 'Mediano') return '🌿 Mediano';
    return '⭐ Grande';
  }

  // ── Nav ──────────────────────────────────────────────────────────────────────
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