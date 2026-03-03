import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

export type Rareza = 'común' | 'raro' | 'épico' | 'legendario';

// Objetos apilables (Xuxes): se agrupan de máximo 5 por espacio
export interface ItemApilable {
  id: number;
  name: string;
  kind: 'apilable';
  quantity: number;
  img: string;
  description: string;
  rareza: Rareza;
}

// Objetos no apilables (Vacunas): cada unidad ocupa 1 espacio
export interface ItemSimple {
  id: number;
  name: string;
  kind: 'simple';
  quantity: number;
  img: string;
  description: string;
  rareza: Rareza;
}

export type Item = ItemApilable | ItemSimple;

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

const MAX_ESPACIOS = 20;
const TAM_STACK = 5;

@Component({
  selector: 'app-mochila',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './mochila.html',
  styleUrls: ['./mochila.css']
})
export class Mochila {

  items: Item[] = [
    { id: 1, name: 'Xuxe Roja', kind: 'apilable', quantity: 7, img: '🔴', description: 'Xuxe básica de fuego', rareza: 'común' },
    { id: 2, name: 'Xuxe Azul', kind: 'apilable', quantity: 3, img: '🔵', description: 'Xuxe básica de agua', rareza: 'raro' },
    { id: 3, name: 'Xuxe Dorada', kind: 'apilable', quantity: 6, img: '🟡', description: 'Xuxe especial rara', rareza: 'épico' },

    { id: 4, name: 'Vacuna Fuerza', kind: 'simple', quantity: 1, img: '💉', description: '+10 Ataque permanente', rareza: 'raro' },
    { id: 5, name: 'Vacuna Defensa', kind: 'simple', quantity: 1, img: '🛡️', description: '+10 Defensa permanente', rareza: 'raro' },
    { id: 6, name: 'Vacuna Mágica', kind: 'simple', quantity: 1, img: '✨', description: '+10 Magia permanente', rareza: 'épico' },
    { id: 7, name: 'Vacuna Maestra', kind: 'simple', quantity: 1, img: '👑', description: '+20 a todo permanente', rareza: 'legendario' },
  ];

  searchQuery = '';
  selectedFilter = 'Todos';
  filters = ['Todos', 'Xuxes', 'Vacunas'];

  isAdminOpen = false;
  adminItemId = 1;
  adminQty = 1;
  adminMsg = '';

  espaciosDe(item: Item): number {
    if (item.kind === 'apilable') return Math.ceil(item.quantity / TAM_STACK);
    return item.quantity;
  }

  get espaciosUsados(): number {
    return this.items.reduce((total, item) => total + this.espaciosDe(item), 0);
  }

  get espaciosLibres(): number {
    return MAX_ESPACIOS - this.espaciosUsados;
  }

  get mochilaLlena(): boolean {
    return this.espaciosUsados >= MAX_ESPACIOS;
  }

  get slotsRellenos(): { item: Item; cantidad: number; stackIndex: number }[] {
    const slots: { item: Item; cantidad: number; stackIndex: number }[] = [];

    for (const item of this.items) {
      if (item.kind === 'apilable') {
        const stacksCompletos = Math.floor(item.quantity / TAM_STACK);
        const resto = item.quantity % TAM_STACK;

        for (let i = 0; i < stacksCompletos; i++) {
          slots.push({ item, cantidad: TAM_STACK, stackIndex: i });
        }
        if (resto > 0) slots.push({ item, cantidad: resto, stackIndex: stacksCompletos });

      } else {
        for (let i = 0; i < item.quantity; i++) {
          slots.push({ item, cantidad: 1, stackIndex: i });
        }
      }
    }
    return slots;
  }

  get displaySlots() {
    let rellenos = this.slotsRellenos;

    if (this.searchQuery) {
      rellenos = rellenos.filter(s =>
        s.item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    if (this.selectedFilter === 'Xuxes') rellenos = rellenos.filter(s => s.item.kind === 'apilable');
    if (this.selectedFilter === 'Vacunas') rellenos = rellenos.filter(s => s.item.kind === 'simple');

    const vacios = Array(Math.max(0, MAX_ESPACIOS - rellenos.length)).fill(null);
    return [...rellenos, ...vacios];
  }

  get itemsApilables(): ItemApilable[] {
    return this.items.filter((i): i is ItemApilable => i.kind === 'apilable');
  }

  // MÉTODO RENOMBRADO
  anadirXuxes(): void {
    this.adminMsg = '';

    if (this.adminQty <= 0) {
      this.adminMsg = 'La cantidad debe ser mayor que 0.';
      return;
    }

    const item = this.items.find(i => i.id === Number(this.adminItemId)) as ItemApilable | undefined;
    if (!item) {
      this.adminMsg = 'Item no encontrado.';
      return;
    }

    const espacioEnStackParcial = item.quantity % TAM_STACK === 0
      ? 0
      : TAM_STACK - (item.quantity % TAM_STACK);

    const puedenEntrar = espacioEnStackParcial + this.espaciosLibres * TAM_STACK;

    if (puedenEntrar <= 0) {
      this.adminMsg = '⚠️ ¡Mochila llena! No se han podido añadir las Xuxes.';
      return;
    }

    const anadidos = Math.min(this.adminQty, puedenEntrar);
    const descartados = this.adminQty - anadidos;

    item.quantity += anadidos;

    this.adminMsg = descartados > 0
      ? `⚠️ Mochila casi llena. Añadidas ${anadidos}, descartadas ${descartados}.`
      : `✅ Añadidas ${anadidos} ${item.name} correctamente.`;

    this.adminQty = 1;
  }

  navItems: NavItem[] = [
    { icon: '🏠', label: 'Inicio', route: '/dashboard' },
    { icon: '📖', label: 'Xuxemons', route: '/Xuxemons' },
    { icon: '🎒', label: 'Mochila', route: '/mochila' },
    { icon: '👥', label: 'Amigos', route: '/amigos' },
    { icon: '⚔️', label: 'Batallas', route: '/batallas' },
    { icon: '💬', label: 'Chat', route: '/chat' },
    { icon: '👤', label: 'Perfil', route: '/perfil' },
    { icon: '🛡️', label: 'Admin', route: '/admin' }
  ];
}
