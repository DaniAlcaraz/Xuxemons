import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// ── Types ──────────────────────────────────────────────────────────────────────
export type Rareza           = 'común' | 'raro' | 'épico' | 'legendario';
export type TipoXuxemon      = 'Tierra' | 'Aire' | 'Agua';
export type TamanoXuxemon = 'Pequeño' | 'Mediano' | 'Grande';

export interface ItemApilable {
  id: number; name: string; kind: 'apilable';
  quantity: number; img: string; description: string; rareza: Rareza;
}
export interface ItemSimple {
  id: number; name: string; kind: 'simple';
  quantity: number; img: string; description: string; rareza: Rareza;
}
export type Item = ItemApilable | ItemSimple;

export interface Xuxemon {
  id: number; nombre: string; tipo: TipoXuxemon;
  tamano: TamanoXuxemon; img: string; discovered: boolean;
}
export interface Trainer {
  id: number; name: string; xuxemons: Xuxemon[];
}
interface NavItem { icon: string; label: string; route: string; }

const MAX_ESPACIOS = 20;
const TAM_STACK    = 5;

// ── Component ──────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin {

  activeTab: 'mochila' | 'xuxemons' = 'mochila';

  // ── MOCHILA DATA ─────────────────────────────────────────────────────────────
  items: Item[] = [
    { id: 1, name: 'Xuxe Roja',      kind: 'apilable', quantity: 7, img: '🔴', description: 'Xuxe básica de fuego',   rareza: 'común'      },
    { id: 2, name: 'Xuxe Azul',      kind: 'apilable', quantity: 3, img: '🔵', description: 'Xuxe básica de agua',    rareza: 'raro'       },
    { id: 3, name: 'Xuxe Dorada',    kind: 'apilable', quantity: 6, img: '🟡', description: 'Xuxe especial rara',     rareza: 'épico'      },
    { id: 4, name: 'Vacuna Fuerza',  kind: 'simple',   quantity: 1, img: '💉', description: '+10 Ataque permanente',  rareza: 'raro'       },
    { id: 5, name: 'Vacuna Defensa', kind: 'simple',   quantity: 1, img: '🛡️', description: '+10 Defensa permanente', rareza: 'raro'       },
    { id: 6, name: 'Vacuna Mágica',  kind: 'simple',   quantity: 1, img: '✨', description: '+10 Magia permanente',   rareza: 'épico'      },
    { id: 7, name: 'Vacuna Maestra', kind: 'simple',   quantity: 1, img: '👑', description: '+20 a todo permanente',  rareza: 'legendario' },
  ];

  adminXuxeId    = 1;  adminXuxeQty    = 1;  adminXuxeMsg    = '';
  adminVacunaId  = 4;  adminVacunaQty  = 1;  adminVacunaMsg  = '';
  adminQuitarId  = 1;  adminQuitarQty  = 1;  adminQuitarMsg  = '';

  // ── MOCHILA COMPUTED ─────────────────────────────────────────────────────────
  espaciosDe(item: Item): number {
    return item.kind === 'apilable' ? Math.ceil(item.quantity / TAM_STACK) : item.quantity;
  }
  get espaciosUsados():    number { return this.items.reduce((t, i) => t + this.espaciosDe(i), 0); }
  get espaciosLibres():    number { return MAX_ESPACIOS - this.espaciosUsados; }
  get mochilaLlena():     boolean { return this.espaciosUsados >= MAX_ESPACIOS; }
  get porcentajeMochila(): number { return (this.espaciosUsados / MAX_ESPACIOS) * 100; }
  get itemsApilables(): ItemApilable[] { return this.items.filter((i): i is ItemApilable => i.kind === 'apilable'); }
  get itemsSimples():   ItemSimple[]   { return this.items.filter((i): i is ItemSimple   => i.kind === 'simple');   }

  // ── MOCHILA ACTIONS ──────────────────────────────────────────────────────────
  anadirXuxes(): void {
    this.adminXuxeMsg = '';
    if (this.adminXuxeQty <= 0) { this.adminXuxeMsg = '⚠️ La cantidad debe ser mayor que 0.'; return; }
    const item = this.items.find(i => i.id === Number(this.adminXuxeId)) as ItemApilable | undefined;
    if (!item) { this.adminXuxeMsg = '⚠️ Ítem no encontrado.'; return; }
    const hueco = item.quantity % TAM_STACK === 0 ? 0 : TAM_STACK - (item.quantity % TAM_STACK);
    const caben = hueco + this.espaciosLibres * TAM_STACK;
    if (caben <= 0) { this.adminXuxeMsg = '⚠️ ¡Mochila llena!'; return; }
    const añadidos = Math.min(this.adminXuxeQty, caben);
    const descartados = this.adminXuxeQty - añadidos;
    item.quantity += añadidos;
    this.adminXuxeMsg = descartados > 0
      ? `⚠️ Añadidas ${añadidos}, descartadas ${descartados}.`
      : `✅ Añadidas ${añadidos} ${item.name}.`;
    this.adminXuxeQty = 1;
  }

  anadirVacuna(): void {
    this.adminVacunaMsg = '';
    if (this.adminVacunaQty <= 0) { this.adminVacunaMsg = '⚠️ La cantidad debe ser mayor que 0.'; return; }
    const item = this.items.find(i => i.id === Number(this.adminVacunaId)) as ItemSimple | undefined;
    if (!item) { this.adminVacunaMsg = '⚠️ Vacuna no encontrada.'; return; }
    if (this.espaciosLibres <= 0) { this.adminVacunaMsg = '⚠️ ¡Mochila llena!'; return; }
    const añadidos = Math.min(this.adminVacunaQty, this.espaciosLibres);
    const descartados = this.adminVacunaQty - añadidos;
    item.quantity += añadidos;
    this.adminVacunaMsg = descartados > 0
      ? `⚠️ Añadidas ${añadidos}, descartadas ${descartados}.`
      : `✅ Añadidas ${añadidos} ${item.name}.`;
    this.adminVacunaQty = 1;
  }

  quitarItem(): void {
    this.adminQuitarMsg = '';
    if (this.adminQuitarQty <= 0) { this.adminQuitarMsg = '⚠️ La cantidad debe ser mayor que 0.'; return; }
    const item = this.items.find(i => i.id === Number(this.adminQuitarId));
    if (!item)              { this.adminQuitarMsg = '⚠️ Ítem no encontrado.'; return; }
    if (item.quantity <= 0) { this.adminQuitarMsg = '⚠️ El ítem ya tiene cantidad 0.'; return; }
    const quitados = Math.min(this.adminQuitarQty, item.quantity);
    item.quantity -= quitados;
    this.adminQuitarMsg = `✅ Quitadas ${quitados} uds. de ${item.name}.`;
    this.adminQuitarQty = 1;
  }

  // ── XUXEMONS DATA ────────────────────────────────────────────────────────────
  xuxemons: Xuxemon[] = [
    { id: 1,  nombre: 'Apleki',       tipo: 'Tierra', tamano: 'Pequeño', img: '🐌', discovered: true  },
    { id: 2,  nombre: 'Avecrem',      tipo: 'Aire',   tamano: 'Pequeño', img: '🐔', discovered: true  },
    { id: 3,  nombre: 'Bambino',      tipo: 'Tierra', tamano: 'Pequeño', img: '🦌', discovered: false },
    { id: 4,  nombre: 'Beeboo',       tipo: 'Aire',   tamano: 'Pequeño', img: '🐝', discovered: true  },
    { id: 5,  nombre: 'Boo-hoot',     tipo: 'Aire',   tamano: 'Mediano', img: '🦉', discovered: true  },
    { id: 6,  nombre: 'Cabrales',     tipo: 'Tierra', tamano: 'Mediano', img: '🐐', discovered: true  },
    { id: 7,  nombre: 'Catua',        tipo: 'Aire',   tamano: 'Pequeño', img: '🦜', discovered: true  },
    { id: 8,  nombre: 'Catyuska',     tipo: 'Aire',   tamano: 'Grande',  img: '🕊️', discovered: true  },
    { id: 9,  nombre: 'Chapapá',      tipo: 'Agua',   tamano: 'Pequeño', img: '🐸', discovered: true  },
    { id: 10, nombre: 'Chopper',      tipo: 'Tierra', tamano: 'Grande',  img: '🐱', discovered: true  },
    { id: 11, nombre: 'Cuellilargui', tipo: 'Tierra', tamano: 'Grande',  img: '🦕', discovered: false },
    { id: 12, nombre: 'Deskangoo',    tipo: 'Tierra', tamano: 'Mediano', img: '🦘', discovered: false },
    { id: 13, nombre: 'Doflamingo',   tipo: 'Aire',   tamano: 'Grande',  img: '🦩', discovered: false },
    { id: 14, nombre: 'Dolly',        tipo: 'Tierra', tamano: 'Pequeño', img: '🐑', discovered: false },
    { id: 15, nombre: 'Elconchudo',   tipo: 'Agua',   tamano: 'Mediano', img: '🦀', discovered: false },
    { id: 16, nombre: 'Eldientes',    tipo: 'Agua',   tamano: 'Grande',  img: '🦛', discovered: false },
    { id: 17, nombre: 'Elgominas',    tipo: 'Tierra', tamano: 'Pequeño', img: '🦔', discovered: false },
    { id: 18, nombre: 'Flipper',      tipo: 'Agua',   tamano: 'Mediano', img: '🐬', discovered: false },
    { id: 19, nombre: 'Floppi',       tipo: 'Tierra', tamano: 'Pequeño', img: '🐒', discovered: false },
    { id: 20, nombre: 'Horseluis',    tipo: 'Agua',   tamano: 'Grande',  img: '🦄', discovered: false },
    { id: 21, nombre: 'Krokolisko',   tipo: 'Agua',   tamano: 'Grande',  img: '🐊', discovered: false },
    { id: 22, nombre: 'Kurama',       tipo: 'Tierra', tamano: 'Mediano', img: '🦊', discovered: false },
    { id: 23, nombre: 'Ladybug',      tipo: 'Aire',   tamano: 'Pequeño', img: '🐞', discovered: false },
    { id: 24, nombre: 'Lengualargui', tipo: 'Tierra', tamano: 'Mediano', img: '🦎', discovered: false },
    { id: 25, nombre: 'Medusation',   tipo: 'Agua',   tamano: 'Mediano', img: '🪼', discovered: false },
    { id: 26, nombre: 'Meekmeek',     tipo: 'Tierra', tamano: 'Pequeño', img: '🐭', discovered: false },
    { id: 27, nombre: 'Megalo',       tipo: 'Agua',   tamano: 'Grande',  img: '🦈', discovered: false },
    { id: 28, nombre: 'Mocha',        tipo: 'Agua',   tamano: 'Grande',  img: '🐳', discovered: false },
    { id: 29, nombre: 'Murcimurci',   tipo: 'Aire',   tamano: 'Pequeño', img: '🦇', discovered: false },
    { id: 30, nombre: 'Nemo',         tipo: 'Agua',   tamano: 'Pequeño', img: '🐠', discovered: false },
    { id: 31, nombre: 'Oinkcelot',    tipo: 'Tierra', tamano: 'Mediano', img: '🐷', discovered: false },
    { id: 32, nombre: 'Oreo',         tipo: 'Tierra', tamano: 'Grande',  img: '🐄', discovered: false },
    { id: 33, nombre: 'Otto',         tipo: 'Tierra', tamano: 'Pequeño', img: '🦦', discovered: false },
    { id: 34, nombre: 'Pinchimott',   tipo: 'Agua',   tamano: 'Pequeño', img: '🦀', discovered: false },
    { id: 35, nombre: 'Pollis',       tipo: 'Aire',   tamano: 'Pequeño', img: '🐣', discovered: false },
    { id: 36, nombre: 'Posón',        tipo: 'Aire',   tamano: 'Mediano', img: '🦋', discovered: false },
    { id: 37, nombre: 'Quakko',       tipo: 'Agua',   tamano: 'Pequeño', img: '🦆', discovered: false },
    { id: 38, nombre: 'Rajoy',        tipo: 'Aire',   tamano: 'Mediano', img: '🕊️', discovered: false },
    { id: 39, nombre: 'Rawlion',      tipo: 'Tierra', tamano: 'Grande',  img: '🦁', discovered: false },
    { id: 40, nombre: 'Rexxo',        tipo: 'Tierra', tamano: 'Grande',  img: '🦖', discovered: false },
    { id: 41, nombre: 'Ron',          tipo: 'Tierra', tamano: 'Pequeño', img: '🐈', discovered: false },
    { id: 42, nombre: 'Sesssi',       tipo: 'Tierra', tamano: 'Mediano', img: '🐍', discovered: false },
    { id: 43, nombre: 'Shelly',       tipo: 'Agua',   tamano: 'Pequeño', img: '🐢', discovered: false },
    { id: 44, nombre: 'Sirucco',      tipo: 'Aire',   tamano: 'Grande',  img: '🦄', discovered: false },
    { id: 45, nombre: 'Torcas',       tipo: 'Agua',   tamano: 'Mediano', img: '🦫', discovered: false },
    { id: 46, nombre: 'Trompeta',     tipo: 'Aire',   tamano: 'Pequeño', img: '🐦', discovered: false },
    { id: 47, nombre: 'Trompi',       tipo: 'Tierra', tamano: 'Grande',  img: '🐘', discovered: false },
    { id: 48, nombre: 'Tux',          tipo: 'Agua',   tamano: 'Mediano', img: '🐧', discovered: false },
  ];

  trainers: Trainer[] = [
    { id: 1, name: 'Entrenador Rojo',  xuxemons: [] },
    { id: 2, name: 'Entrenadora Azul', xuxemons: [] },
    { id: 3, name: 'Entrenador Verde', xuxemons: [] },
  ];

  adminDescubrirId        = 3;
  adminAsignarXuxId       = 1;
  adminAsignarTrainerId   = 1;
  adminQuitarXuxTrainerId = 1;
  adminQuitarXuxIdx       = 0;
  adminQuitarXuxMsg       = '';
  adminXuxMsg             = '';

  // ── XUXEMONS COMPUTED ────────────────────────────────────────────────────────
  get totalXuxemons():  number     { return this.xuxemons.length; }
  get descubiertos():   number     { return this.xuxemons.filter(x =>  x.discovered).length; }
  get noDescubiertos(): number     { return this.xuxemons.filter(x => !x.discovered).length; }
  get porcentajeDesc(): number     { return (this.descubiertos / this.totalXuxemons) * 100; }
  get xuxDescubiertos(): Xuxemon[] { return this.xuxemons.filter(x =>  x.discovered); }
  get xuxOcultos():      Xuxemon[] { return this.xuxemons.filter(x => !x.discovered); }

  getTrainerXuxOptions(trainerId: number): { idx: number; label: string }[] {
    const t = this.trainers.find(t => t.id === Number(trainerId));
    return t ? t.xuxemons.map((x, i) => ({ idx: i, label: `${x.img} ${x.nombre} (${x.tamano})` })) : [];
  }

  tamanoLabel(g: TamanoXuxemon): string {
    return g === 'Pequeño' ? '🥚 Pequeño' : g === 'Mediano' ? '🌿 Mediano' : '⭐ Grande';
  }

  // ── XUXEMONS ACTIONS ─────────────────────────────────────────────────────────
  descubrirXuxemon(): void {
    this.adminXuxMsg = '';
    const x = this.xuxemons.find(x => x.id === Number(this.adminDescubrirId));
    if (!x)           { this.adminXuxMsg = '⚠️ No encontrado.'; return; }
    if (x.discovered) { this.adminXuxMsg = `⚠️ ${x.nombre} ya descubierto.`; return; }
    x.discovered = true;
    this.adminXuxMsg = `✅ ¡${x.img} ${x.nombre} descubierto!`;
    const sig = this.xuxemons.find(x => !x.discovered);
    if (sig) this.adminDescubrirId = sig.id;
  }

  descubrirAleatorio(): void {
    this.adminXuxMsg = '';
    const pool = this.xuxOcultos;
    if (!pool.length) { this.adminXuxMsg = '⚠️ ¡Todos descubiertos!'; return; }
    const r = pool[Math.floor(Math.random() * pool.length)];
    r.discovered = true;
    this.adminXuxMsg = `✅ ¡${r.img} ${r.nombre} descubierto!`;
    const sig = this.xuxemons.find(x => !x.discovered);
    if (sig) this.adminDescubrirId = sig.id;
  }

  ocultarXuxemon(): void {
    this.adminXuxMsg = '';
    const x = this.xuxemons.find(x => x.id === Number(this.adminDescubrirId));
    if (!x)            { this.adminXuxMsg = '⚠️ No encontrado.'; return; }
    if (!x.discovered) { this.adminXuxMsg = `⚠️ ${x.nombre} ya estaba oculto.`; return; }
    x.discovered = false;
    this.adminXuxMsg = `🔒 ${x.img} ${x.nombre} ocultado.`;
  }

  asignarXuxemon(): void {
    this.adminXuxMsg = '';
    const x = this.xuxemons.find(x => x.id === Number(this.adminAsignarXuxId));
    const t = this.trainers.find(t => t.id === Number(this.adminAsignarTrainerId));
    if (!x || !t)      { this.adminXuxMsg = '⚠️ No encontrado.'; return; }
    if (!x.discovered) { this.adminXuxMsg = `⚠️ ${x.nombre} no está descubierto.`; return; }
    t.xuxemons = [...t.xuxemons, { ...x }];
    this.adminXuxMsg = `✅ ${x.img} ${x.nombre} → ${t.name}.`;
  }

  addRandomXuxemon(trainer: Trainer): void {
    this.adminXuxMsg = '';
    const pool = this.xuxDescubiertos;
    if (!pool.length) { this.adminXuxMsg = '⚠️ No hay xuxemons descubiertos.'; return; }
    const r = pool[Math.floor(Math.random() * pool.length)];
    trainer.xuxemons = [...trainer.xuxemons, { ...r }];
    this.adminXuxMsg = `✅ ${r.img} ${r.nombre} → ${trainer.name}.`;
  }

  quitarDeEntrenador(): void {
    this.adminQuitarXuxMsg = '';
    const t = this.trainers.find(t => t.id === Number(this.adminQuitarXuxTrainerId));
    if (!t) { this.adminQuitarXuxMsg = '⚠️ Entrenador no encontrado.'; return; }
    const idx = Number(this.adminQuitarXuxIdx);
    if (idx < 0 || idx >= t.xuxemons.length) { this.adminQuitarXuxMsg = '⚠️ Selección no válida.'; return; }
    const removed = t.xuxemons[idx];
    t.xuxemons = t.xuxemons.filter((_, i) => i !== idx);
    this.adminQuitarXuxMsg = `✅ ${removed.img} ${removed.nombre} eliminado de ${t.name}.`;
    this.adminQuitarXuxIdx = 0;
  }

  // ── NAV ──────────────────────────────────────────────────────────────────────
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