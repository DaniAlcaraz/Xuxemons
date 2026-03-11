import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MochilaService } from '../Services/mochila';
import { AuthService } from '../Services/auth.service';

export type Rareza = 'común' | 'raro' | 'épico' | 'legendario';

export interface ItemApilable {
  id: number; name: string; kind: 'apilable';
  quantity: number; img: string; description: string; rareza: Rareza;
}
export interface ItemSimple {
  id: number; name: string; kind: 'simple';
  quantity: number; img: string; description: string; rareza: Rareza;
}
export type Item = ItemApilable | ItemSimple;
interface NavItem { icon: string; label: string; route: string; }

const MAX_ESPACIOS = 20;
const TAM_STACK = 5;

const EMOJIS: Record<string, string> = {
  'Xuxe Roja':           '🔴',
  'Xuxe Azul':           '🔵',
  'Xuxe Dorada':         '🟡',
  'Chocolatina':         '🍫',
  'Mermelada de frutas': '🍓',
  'Insulina':            '💉',
};

@Component({
  selector: 'app-mochila',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './mochila.html',
  styleUrls: ['./mochila.css']
})
export class Mochila implements OnInit {

  items: Item[] = [];
  cargando = true;
  searchQuery = '';
  filterTipo = 'Todos';

  constructor(
    private mochilaService: MochilaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarMochila();
  }

  cargarMochila(): void {
    this.cargando = true;
    this.mochilaService.getMochila().subscribe({
      next: (datos) => {
        this.items = datos.map(entry => ({
          id: entry.item.id,
          name: entry.item.nombre,
          kind: entry.item.tipo === 'xuxe' ? 'apilable' : 'simple',
          quantity: entry.cantidad,
          img: EMOJIS[entry.item.nombre] ?? '📦',
          description: entry.item.descripcion,
          rareza: entry.item.rareza as Rareza,
        }));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  espaciosDe(item: Item): number {
    return item.kind === 'apilable' ? Math.ceil(item.quantity / TAM_STACK) : item.quantity;
  }

  get espaciosUsados(): number {
    return this.items.reduce((total, item) => total + this.espaciosDe(item), 0);
  }
  get espaciosLibres(): number { return MAX_ESPACIOS - this.espaciosUsados; }
  get mochilaLlena(): boolean { return this.espaciosUsados >= MAX_ESPACIOS; }

  get slotsRellenos(): { item: Item; cantidad: number; stackIndex: number }[] {
    const slots: { item: Item; cantidad: number; stackIndex: number }[] = [];
    for (const item of this.items) {
      if (item.kind === 'apilable') {
        const completos = Math.floor(item.quantity / TAM_STACK);
        const resto = item.quantity % TAM_STACK;
        for (let i = 0; i < completos; i++) slots.push({ item, cantidad: TAM_STACK, stackIndex: i });
        if (resto > 0) slots.push({ item, cantidad: resto, stackIndex: completos });
      } else {
        for (let i = 0; i < item.quantity; i++) slots.push({ item, cantidad: 1, stackIndex: i });
      }
    }
    return slots;
  }

  get displaySlots() {
    let rellenos = this.slotsRellenos;
    if (this.searchQuery)
      rellenos = rellenos.filter(s => s.item.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    if (this.selectedFilter === 'Xuxes') rellenos = rellenos.filter(s => s.item.kind === 'apilable');
    if (this.selectedFilter === 'Vacunas') rellenos = rellenos.filter(s => s.item.kind === 'simple');
    const vacios = Array(Math.max(0, MAX_ESPACIOS - rellenos.length)).fill(null);
    return [...rellenos, ...vacios];
  }

  get itemsApilables(): ItemApilable[] {
    return this.items.filter((i): i is ItemApilable => i.kind === 'apilable');
  }

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

  constructor(private xuxemonService: XuxemonService) {}

  ngOnInit(): void {
    this.cargarColeccion();
  }

  cargarColeccion(): void {
    this.cargando = true;
    this.xuxemonService.getColeccion().subscribe({
      next: (res) => {
        this.coleccion = res.coleccion;
        this.total = res.total;
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'Error al cargar la colección.';
        this.cargando = false;
      }
    });
  }

  anadirAleatorio(): void {
    this.anadiendo = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.xuxemonService.anadirAleatorio().subscribe({
      next: (res) => {
        this.mensajeExito = `¡${res.xuxemon.nombre} añadido a tu colección!`;
        this.anadiendo = false;
        this.cargarColeccion(); // Recargamos la lista
      },
      error: () => {
        this.mensajeError = 'Error al añadir el xuxemon.';
        this.anadiendo = false;
      }
    });
  }

  get coleccionFiltrada(): EntradaColeccion[] {
    let lista = this.coleccion;

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      lista = lista.filter(e => e.xuxemon.nombre.toLowerCase().includes(q));
    }

    if (this.filterTipo !== 'Todos') {
      lista = lista.filter(e => e.xuxemon.tipo === this.filterTipo);
    }

    return lista;
  }

  tipoEmoji(tipo: string): string {
    if (tipo === 'Tierra') return '🌿';
    if (tipo === 'Aire') return '💨';
    if (tipo === 'Agua') return '💧';
    return '🌐';
  }

  tamanoEmoji(tamano: string): string {
    if (tamano === 'Pequeño') return '🥚';
    if (tamano === 'Mediano') return '🌿';
    return '⭐';
  }
}