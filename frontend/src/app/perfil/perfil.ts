import { Component } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';

interface UserProfile {
  name: string;
  since: string;
  location: string;
  level: number;
  xp: number;
  xpMax: number;
}

interface Stat {
  xuxemons: number;
  batallas: number;
  victorias: number;
  derrotas: number;
  amigos: number;
  dias: number;
}

interface Logro {
  icon: string;
  name: string;
  unlocked: boolean;
}

interface Xuxemon {
  name: string;
  type: string;
  level: number;
  hp: number;
  img: string;
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [NgClass, NgFor, RouterModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil {

  user: UserProfile = {
    name: 'Daniel',
    since: 'Febrero 2025',
    location: 'Cataluña, España',
    level: 18,
    xp: 4111,
    xpMax: 5000
  };

  stats: Stat = {
    xuxemons: 5,
    batallas: 15,
    victorias: 12,
    derrotas: 3,
    amigos: 5,
    dias: 40
  };

  logros: Logro[] = [
    { icon: '🦀', name: 'Primer Xuxemon',  unlocked: true  },
    { icon: '⚔️', name: '100 batallas',    unlocked: true  },
    { icon: '🗺️', name: 'Explorador',      unlocked: true  },
    { icon: '👥', name: 'Amigo sociable',  unlocked: false },
    { icon: '🎓', name: 'Maestro',         unlocked: false },
    { icon: '🏆', name: 'Leyenda',         unlocked: false }
  ];

  xuxemons: Xuxemon[] = [
    { name: 'Elconchudo', type: 'Agua',   level: 15, hp: 100, img: 'https://em-content.zobj.net/source/apple/354/crab_1f980.png'    },
    { name: 'Oreo',       type: 'Tierra', level: 12, hp: 50,  img: 'https://em-content.zobj.net/source/apple/354/cow_1f404.png'      },
    { name: 'Beeboo',     type: 'Aire',   level: 10, hp: 78,  img: 'https://em-content.zobj.net/source/apple/354/honeybee_1f41d.png' }
  ];

  navItems: NavItem[] = [
    { icon: '🏠', label: 'Inicio',    route: '/dashboard' },
    { icon: '📖', label: 'Xuxemons', route: '/xuxemons'  },
    { icon: '🎒', label: 'Mochila',  route: '/mochila'   },
    { icon: '👥', label: 'Amigos',   route: '/amigos'    },
    { icon: '⚔️', label: 'Batallas', route: '/batallas'  },
    { icon: '💬', label: 'Chat',     route: '/chat'      },
    { icon: '👤', label: 'Perfil',   route: '/perfil'    },
    { icon: '🛡️', label: 'Admin',   route: '/admin'     }
  ];
}
