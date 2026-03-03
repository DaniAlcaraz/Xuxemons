import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

export type TipoXuxemon = 'Tierra' | 'Aire' | 'Agua';

export interface Xuxemon {
  id: number;
  nombre: string;
  tipo: TipoXuxemon;
  img: string;
  discovered: boolean;
}

export interface Trainer {
  id: number;
  name: string;
  xuxemons: Xuxemon[];
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-xuxemons',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './xuxemons.html',
  styleUrls: ['./xuxemons.css']
})
export class Xuxemons {

  searchQuery = '';
  isAdminOpen = false;
  adminMsg = '';

  xuxemons: Xuxemon[] = [
    { id: 1, nombre: 'Apleki', tipo: 'Tierra', img: '🐌', discovered: true },
    { id: 2, nombre: 'Avecrem', tipo: 'Aire', img: '🐔', discovered: true },
    { id: 3, nombre: 'Bambino', tipo: 'Tierra', img: '🦌', discovered: false },
    { id: 4, nombre: 'Beeboo', tipo: 'Aire', img: '🐝', discovered: true },
    { id: 5, nombre: 'Boo-hoot', tipo: 'Aire', img: '🦉', discovered: true },
    { id: 6, nombre: 'Cabrales', tipo: 'Tierra', img: '🐐', discovered: true },
    { id: 7, nombre: 'Catua', tipo: 'Aire', img: '🦜', discovered: true },
    { id: 8, nombre: 'Catyuska', tipo: 'Aire', img: '🕊️', discovered: true },
    { id: 9, nombre: 'Chapapá', tipo: 'Agua', img: '🐸', discovered: true },
    { id: 10, nombre: 'Chopper', tipo: 'Tierra', img: '🐱', discovered: true },
    { id: 11, nombre: 'Cuellilargui', tipo: 'Tierra', img: '🦕', discovered: false },
    { id: 12, nombre: 'Deskangoo', tipo: 'Tierra', img: '🦘', discovered: false },
    { id: 13, nombre: 'Doflamingo', tipo: 'Aire', img: '🦩', discovered: false },
    { id: 14, nombre: 'Dolly', tipo: 'Tierra', img: '🐑', discovered: false },
    { id: 15, nombre: 'Elconchudo', tipo: 'Agua', img: '🦀', discovered: false },
    { id: 16, nombre: 'Eldientes', tipo: 'Agua', img: '🦛', discovered: false },
    { id: 17, nombre: 'Elgominas', tipo: 'Tierra', img: '🦔', discovered: false },
    { id: 18, nombre: 'Flipper', tipo: 'Agua', img: '🐬', discovered: false },
    { id: 19, nombre: 'Floppi', tipo: 'Tierra', img: '🐒', discovered: false },
    { id: 20, nombre: 'Horseluis', tipo: 'Agua', img: '🦄', discovered: false },
    { id: 21, nombre: 'Krokolisko', tipo: 'Agua', img: '🐊', discovered: false },
    { id: 22, nombre: 'Kurama', tipo: 'Tierra', img: '🦊', discovered: false },
    { id: 23, nombre: 'Ladybug', tipo: 'Aire', img: '🐞', discovered: false },
    { id: 24, nombre: 'Lengualargui', tipo: 'Tierra', img: '🦎', discovered: false },
    { id: 25, nombre: 'Medusation', tipo: 'Agua', img: '🪼', discovered: false },
    { id: 26, nombre: 'Meekmeek', tipo: 'Tierra', img: '🐭', discovered: false },
    { id: 27, nombre: 'Megalo', tipo: 'Agua', img: '🦈', discovered: false },
    { id: 28, nombre: 'Mocha', tipo: 'Agua', img: '🐳', discovered: false },
    { id: 29, nombre: 'Murcimurci', tipo: 'Aire', img: '🦇', discovered: false },
    { id: 30, nombre: 'Nemo', tipo: 'Agua', img: '🐠', discovered: false },
    { id: 31, nombre: 'Oinkcelot', tipo: 'Tierra', img: '🐷', discovered: false },
    { id: 32, nombre: 'Oreo', tipo: 'Tierra', img: '🐄', discovered: false },
    { id: 33, nombre: 'Otto', tipo: 'Tierra', img: '🦦', discovered: false },
    { id: 34, nombre: 'Pinchimott', tipo: 'Agua', img: '🦀', discovered: false },
    { id: 35, nombre: 'Pollis', tipo: 'Aire', img: '🐣', discovered: false },
    { id: 36, nombre: 'Posón', tipo: 'Aire', img: '🦋', discovered: false },
    { id: 37, nombre: 'Quakko', tipo: 'Agua', img: '🦆', discovered: false },
    { id: 38, nombre: 'Rajoy', tipo: 'Aire', img: '🕊️', discovered: false },
    { id: 39, nombre: 'Rawlion', tipo: 'Tierra', img: '🦁', discovered: false },
    { id: 40, nombre: 'Rexxo', tipo: 'Tierra', img: '🦖', discovered: false },
    { id: 41, nombre: 'Ron', tipo: 'Tierra', img: '🐈', discovered: false },
    { id: 42, nombre: 'Sesssi', tipo: 'Tierra', img: '🐍', discovered: false },
    { id: 43, nombre: 'Shelly', tipo: 'Agua', img: '🐢', discovered: false },
    { id: 44, nombre: 'Sirucco', tipo: 'Aire', img: '🦄', discovered: false },
    { id: 45, nombre: 'Torcas', tipo: 'Agua', img: '🦫', discovered: false },
    { id: 46, nombre: 'Trompeta', tipo: 'Aire', img: '🐦', discovered: false },
    { id: 47, nombre: 'Trompi', tipo: 'Tierra', img: '🐘', discovered: false },
    { id: 48, nombre: 'Tux', tipo: 'Agua', img: '🐧', discovered: false },
  ];

  trainers: Trainer[] = [
    { id: 1, name: 'Entrenador Rojo', xuxemons: [] },
    { id: 2, name: 'Entrenadora Azul', xuxemons: [] },
    { id: 3, name: 'Entrenador Verde', xuxemons: [] },
  ];

  //Computed

  get totalXuxemons(): number {
    return this.xuxemons.length;
  }

  get descubiertos(): number {
    return this.xuxemons.filter(x => x.discovered).length;
  }

  get filteredXuxemons(): Xuxemon[] {
    if (!this.searchQuery.trim()) return this.xuxemons;
    const q = this.searchQuery.toLowerCase();
    return this.xuxemons.filter(x =>
      x.discovered && x.nombre.toLowerCase().includes(q)
    );
  }

  //Admin

  addRandomXuxemon(trainer: Trainer): void {
    this.adminMsg = '';
    const pool = this.xuxemons.filter(x => x.discovered);
    if (pool.length === 0) {
      this.adminMsg = '⚠️ No hay xuxemons descubiertos para asignar.';
      return;
    }
    const random = pool[Math.floor(Math.random() * pool.length)];
    trainer.xuxemons = [...trainer.xuxemons, { ...random }];
    this.adminMsg = `✅ Añadido ${random.img} ${random.nombre} a ${trainer.name}.`;
  }

  // Nav 

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