import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

export type TipoXuxemon = 'Tierra' | 'Aire' | 'Agua';
export type TamanoXuxemon = 'Pequeño' | 'Mediano' | 'Grande';

export interface Xuxemon {
  id: number;
  nombre: string;
  tipo: TipoXuxemon;
  tamano: TamanoXuxemon;
  img: string;
  discovered: boolean;
}

interface NavItem { icon: string; label: string; route: string; }

@Component({
  selector: 'app-xuxemons',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './xuxemons.html',
  styleUrls: ['./xuxemons.css']
})
export class Xuxemons {

  searchQuery = '';
  filterTipo: string = 'Todos';
  filterTamano: string = 'Todos';

  tiposFiltro = ['Todos', 'Tierra', 'Aire', 'Agua'];
  tamanosFiltro = ['Todos', 'Pequeño', 'Mediano', 'Grande'];

  xuxemons: Xuxemon[] = [
    { id: 1, nombre: 'Apleki', tipo: 'Tierra', tamano: 'Pequeño', img: '🐌', discovered: true },
    { id: 2, nombre: 'Avecrem', tipo: 'Aire', tamano: 'Pequeño', img: '🐔', discovered: true },
    { id: 3, nombre: 'Bambino', tipo: 'Tierra', tamano: 'Pequeño', img: '🦌', discovered: false },
    { id: 4, nombre: 'Beeboo', tipo: 'Aire', tamano: 'Pequeño', img: '🐝', discovered: true },
    { id: 5, nombre: 'Boo-hoot', tipo: 'Aire', tamano: 'Mediano', img: '🦉', discovered: true },
    { id: 6, nombre: 'Cabrales', tipo: 'Tierra', tamano: 'Mediano', img: '🐐', discovered: true },
    { id: 7, nombre: 'Catua', tipo: 'Aire', tamano: 'Pequeño', img: '🦜', discovered: true },
    { id: 8, nombre: 'Catyuska', tipo: 'Aire', tamano: 'Grande', img: '🕊️', discovered: true },
    { id: 9, nombre: 'Chapapá', tipo: 'Agua', tamano: 'Pequeño', img: '🐸', discovered: true },
    { id: 10, nombre: 'Chopper', tipo: 'Tierra', tamano: 'Grande', img: '🐱', discovered: true },
    { id: 11, nombre: 'Cuellilargui', tipo: 'Tierra', tamano: 'Grande', img: '🦕', discovered: false },
    { id: 12, nombre: 'Deskangoo', tipo: 'Tierra', tamano: 'Mediano', img: '🦘', discovered: false },
    { id: 13, nombre: 'Doflamingo', tipo: 'Aire', tamano: 'Grande', img: '🦩', discovered: false },
    { id: 14, nombre: 'Dolly', tipo: 'Tierra', tamano: 'Pequeño', img: '🐑', discovered: false },
    { id: 15, nombre: 'Elconchudo', tipo: 'Agua', tamano: 'Mediano', img: '🦀', discovered: false },
    { id: 16, nombre: 'Eldientes', tipo: 'Agua', tamano: 'Grande', img: '🦛', discovered: false },
    { id: 17, nombre: 'Elgominas', tipo: 'Tierra', tamano: 'Pequeño', img: '🦔', discovered: false },
    { id: 18, nombre: 'Flipper', tipo: 'Agua', tamano: 'Mediano', img: '🐬', discovered: false },
    { id: 19, nombre: 'Floppi', tipo: 'Tierra', tamano: 'Pequeño', img: '🐒', discovered: false },
    { id: 20, nombre: 'Horseluis', tipo: 'Agua', tamano: 'Grande', img: '🦄', discovered: false },
    { id: 21, nombre: 'Krokolisko', tipo: 'Agua', tamano: 'Grande', img: '🐊', discovered: false },
    { id: 22, nombre: 'Kurama', tipo: 'Tierra', tamano: 'Mediano', img: '🦊', discovered: false },
    { id: 23, nombre: 'Ladybug', tipo: 'Aire', tamano: 'Pequeño', img: '🐞', discovered: false },
    { id: 24, nombre: 'Lengualargui', tipo: 'Tierra', tamano: 'Mediano', img: '🦎', discovered: false },
    { id: 25, nombre: 'Medusation', tipo: 'Agua', tamano: 'Mediano', img: '🪼', discovered: false },
    { id: 26, nombre: 'Meekmeek', tipo: 'Tierra', tamano: 'Pequeño', img: '🐭', discovered: false },
    { id: 27, nombre: 'Megalo', tipo: 'Agua', tamano: 'Grande', img: '🦈', discovered: false },
    { id: 28, nombre: 'Mocha', tipo: 'Agua', tamano: 'Grande', img: '🐳', discovered: false },
    { id: 29, nombre: 'Murcimurci', tipo: 'Aire', tamano: 'Pequeño', img: '🦇', discovered: false },
    { id: 30, nombre: 'Nemo', tipo: 'Agua', tamano: 'Pequeño', img: '🐠', discovered: false },
    { id: 31, nombre: 'Oinkcelot', tipo: 'Tierra', tamano: 'Mediano', img: '🐷', discovered: false },
    { id: 32, nombre: 'Oreo', tipo: 'Tierra', tamano: 'Grande', img: '🐄', discovered: false },
    { id: 33, nombre: 'Otto', tipo: 'Tierra', tamano: 'Pequeño', img: '🦦', discovered: false },
    { id: 34, nombre: 'Pinchimott', tipo: 'Agua', tamano: 'Pequeño', img: '🦀', discovered: false },
    { id: 35, nombre: 'Pollis', tipo: 'Aire', tamano: 'Pequeño', img: '🐣', discovered: false },
    { id: 36, nombre: 'Posón', tipo: 'Aire', tamano: 'Mediano', img: '🦋', discovered: false },
    { id: 37, nombre: 'Quakko', tipo: 'Agua', tamano: 'Pequeño', img: '🦆', discovered: false },
    { id: 38, nombre: 'Rajoy', tipo: 'Aire', tamano: 'Mediano', img: '🕊️', discovered: false },
    { id: 39, nombre: 'Rawlion', tipo: 'Tierra', tamano: 'Grande', img: '🦁', discovered: false },
    { id: 40, nombre: 'Rexxo', tipo: 'Tierra', tamano: 'Grande', img: '🦖', discovered: false },
    { id: 41, nombre: 'Ron', tipo: 'Tierra', tamano: 'Pequeño', img: '🐈', discovered: false },
    { id: 42, nombre: 'Sesssi', tipo: 'Tierra', tamano: 'Mediano', img: '🐍', discovered: false },
    { id: 43, nombre: 'Shelly', tipo: 'Agua', tamano: 'Pequeño', img: '🐢', discovered: false },
    { id: 44, nombre: 'Sirucco', tipo: 'Aire', tamano: 'Grande', img: '🦄', discovered: false },
    { id: 45, nombre: 'Torcas', tipo: 'Agua', tamano: 'Mediano', img: '🦫', discovered: false },
    { id: 46, nombre: 'Trompeta', tipo: 'Aire', tamano: 'Pequeño', img: '🐦', discovered: false },
    { id: 47, nombre: 'Trompi', tipo: 'Tierra', tamano: 'Grande', img: '🐘', discovered: false },
    { id: 48, nombre: 'Tux', tipo: 'Agua', tamano: 'Mediano', img: '🐧', discovered: false },
  ];

  // ── Computed ─────────────────────────────────────────────────────────────────
  get totalXuxemons(): number { return this.xuxemons.length; }
  get descubiertos(): number { return this.xuxemons.filter(x => x.discovered).length; }

  get filteredXuxemons(): Xuxemon[] {
    let list = this.xuxemons;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(x => x.discovered && x.nombre.toLowerCase().includes(q));
    }
    if (this.filterTipo !== 'Todos') list = list.filter(x => x.tipo === this.filterTipo);
    if (this.filterTamano !== 'Todos') list = list.filter(x => x.tamano === this.filterTamano);
    return list;
  }

  // ── Evolución ────────────────────────────────────────────────────────────────
  nextTamano(t: TamanoXuxemon): TamanoXuxemon | null {
    if (t === 'Pequeño') return 'Mediano';
    if (t === 'Mediano') return 'Grande';
    return null;
  }

  evolucionar(xux: Xuxemon): void {
    const next = this.nextTamano(xux.tamano);
    if (next) xux.tamano = next;
  }

  canEvolve(xux: Xuxemon): boolean {
    return xux.discovered && xux.tamano !== 'Grande';
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