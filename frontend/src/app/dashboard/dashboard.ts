import { Component } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, NgFor, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  xuxemons: Xuxemon[] = [
    { name: 'Elconchudo', type: 'Agua', level: 15, hp: 100, img: 'https://em-content.zobj.net/source/apple/354/crab_1f980.png' },
    { name: 'Oreo', type: 'Tierra', level: 12, hp: 50, img: 'https://em-content.zobj.net/source/apple/354/cow_1f404.png' },
    { name: 'Beeboo', type: 'Aire', level: 10, hp: 78, img: 'https://em-content.zobj.net/source/apple/354/honeybee_1f41d.png' }
  ];

  navItems: NavItem[] = [
    { icon: '🏠', label: 'Inicio', route: '/dashboard' },
    { icon: '📖', label: 'Xuxemons', route: '/xuxemons' },
    { icon: '🎒', label: 'Mochila', route: '/mochila' },
    { icon: '👥', label: 'Amigos', route: '/amigos' },
    { icon: '⚔️', label: 'Batallas', route: '/batallas' },
    { icon: '💬', label: 'Chat', route: '/chat' },
    { icon: '👤', label: 'Perfil', route: '/perfil' },
    { icon: '🛡️', label: 'Admin', route: '/admin' }
  ];
}
