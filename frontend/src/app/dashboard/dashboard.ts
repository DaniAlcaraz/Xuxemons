import { Component, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';

// ── Interfaces adaptadas a lo que devuelve el backend real ──

interface XuxemonAPI {
  IDxuxemon: number;
  nombre: string;
  tipo: string;
  tamano: 'Pequeño' | 'Mediano' | 'Grande';
  xuxes_acumuladas: number;
  archivo: string;
  enfermo: boolean;
  enfermedad: string | null;
}

interface XuxemonTotal {
  IDxuxemon: number;
  nombre: string;
}

interface Amigo {
  amistad_id: number;
  identificador: string;
  nombre: string;
  apellidos: string;
}

interface Notificacion {
  titulo: string;
  cuerpo: string;
  tipo: 'azul' | 'rosa';
}

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, NgIf, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  // ── Estado ──
  misXuxemons: XuxemonAPI[] = [];
  numAmigos: number = 0;
  notificaciones: Notificacion[] = [];
  tienesTodos: boolean = false;
  cargando: boolean = true;
  errorCarga: boolean = false;

  navItems: NavItem[] = [
    { icon: '🏠', label: 'Inicio', route: '/dashboard' },
    { icon: '📖', label: 'Xuxemons', route: '/xuxemons' },
    { icon: '🎒', label: 'Mochila', route: '/mochila' },
    { icon: '👥', label: 'Amigos', route: '/amigos' },
    { icon: '💬', label: 'Chat', route: '/chat' },
    { icon: '👤', label: 'Perfil', route: '/perfil' },
    { icon: '🛡️', label: 'Admin', route: '/admin' },
  ];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  // ── Devuelve el token guardado en localStorage ──
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ── Carga en paralelo mis xuxemons, el catálogo total y mis amigos ──
  cargarDatos(): void {
    this.cargando = true;
    this.errorCarga = false;

    const headers = this.getHeaders();

    forkJoin({
      misXuxemons: this.http.get<XuxemonAPI[]>('/api/xuxemons/me', { headers }),
      todosXuxemons: this.http.get<XuxemonTotal[]>('/api/xuxemons', { headers }),
      amigos: this.http.get<Amigo[]>('/api/amigos', { headers }),
    }).subscribe({
      next: ({ misXuxemons, todosXuxemons, amigos }) => {
        this.misXuxemons = misXuxemons;
        this.numAmigos = amigos.length;

        // ¿Tienes todos los xuxemons del catálogo?
        this.tienesTodos = todosXuxemons.length > 0
          && misXuxemons.length >= todosXuxemons.length;

        this.generarNotificaciones(misXuxemons, todosXuxemons);
        this.cargando = false;
      },
      error: () => {
        this.errorCarga = true;
        this.cargando = false;
      }
    });
  }

  // ── Genera notificaciones dinámicas ──
  private generarNotificaciones(
    mis: XuxemonAPI[],
    todos: XuxemonTotal[]
  ): void {
    const notifs: Notificacion[] = [];

    // 1. Xuxemons enfermos → hay que curarlos
    const enfermos = mis.filter(x => x.enfermo);
    for (const x of enfermos) {
      notifs.push({
        titulo: `¡${x.nombre} está enfermo!`,
        cuerpo: `Cura a ${x.nombre} — padece "${x.enfermedad}". Usa una vacuna de tu mochila.`,
        tipo: 'rosa',
      });
    }

    // 2. Xuxemons que pueden evolucionar (no enfermos con Atracón y no son Grande)
    const puedenEvolucionar = mis.filter(
      x => x.tamano !== 'Grande' && !(x.enfermo && x.enfermedad === 'Atracón')
    );
    for (const x of puedenEvolucionar) {
      notifs.push({
        titulo: `¡${x.nombre} puede evolucionar!`,
        cuerpo: `Mejora a ${x.nombre} dándole xuxes desde tu mochila.`,
        tipo: 'azul',
      });
    }

    // 3. Si no hay ninguna notificación útil
    if (notifs.length === 0) {
      notifs.push({
        titulo: 'Todo en orden 🎉',
        cuerpo: 'Todos tus xuxemons están sanos y en su tamaño máximo. ¡Eres un gran entrenador!',
        tipo: 'azul',
      });
    }

    this.notificaciones = notifs;
  }

  // ── Helpers para el template ──

  /** Convierte el campo `archivo` del backend en URL de imagen */
  imagenUrl(archivo: string): string {
    if (!archivo) return '';
    // Si ya es URL completa la devolvemos tal cual
    if (archivo.startsWith('http')) return archivo;
    return `/storage/${archivo}`;
  }

  /** Porcentaje de vida aproximado según tamaño (el backend no guarda HP) */
  vidaPorcentaje(x: XuxemonAPI): number {
    if (x.enfermo) return 40;
    switch (x.tamano) {
      case 'Grande': return 100;
      case 'Mediano': return 65;
      default: return 30;
    }
  }

  /** Color de la barra de vida */
  colorVida(porcentaje: number): string {
    if (porcentaje >= 70) return '#1b7a3e';
    if (porcentaje >= 40) return '#d97706';
    return '#dc2626';
  }

  /** Clase CSS del badge de tipo */
  tipoBadgeClass(tipo: string): string {
    return tipo.toLowerCase();
  }
}