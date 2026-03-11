import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { XuxemonService } from '../Services/xuxemon.service';
import { EntradaColeccion } from '../models/xuxemon';

interface NavItem { icon: string; label: string; route: string; }

@Component({
  selector: 'app-mochila',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './mochila.html',
  styleUrls: ['./mochila.css']
})
export class Mochila implements OnInit {

  coleccion: EntradaColeccion[] = [];
  total = 0;
  cargando = false;
  anadiendo = false;
  mensajeExito = '';
  mensajeError = '';
  searchQuery = '';
  filterTipo = 'Todos';

  tiposFiltro = ['Todos', 'Tierra', 'Aire', 'Agua'];

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