import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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