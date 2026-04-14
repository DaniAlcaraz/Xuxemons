import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { XuxemonService } from '../Services/xuxemon.service';
import { AmigosService, SolicitudRecibida, Amigo } from '../Services/amigos.service';
import { AuthService } from '../Services/auth.service';
import { interval, Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ColeccionResponse, EntradaColeccion } from '../interfaces/xuxemon';

interface XuxemonDash {
  id: number;
  name: string;
  type: string;
  hp: number;
  emoji: string;
  archivo: string;
  tamano: string;
  isNew: boolean;
}

interface Notificacion {
  id: string;
  titulo: string;
  cuerpo: string;
  tipo: 'blue' | 'pink' | 'green' | 'orange';
  timestamp: Date;
  leida: boolean;
  accion?: () => void;
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
export class Dashboard implements OnInit, OnDestroy {

  xuxemons: XuxemonDash[] = [];
  notificaciones: Notificacion[] = [];
  amigos: Amigo[] = [];
  solicitudesPendientes: SolicitudRecibida[] = [];
  usuarioNombre = '';

  totalXuxemons = 0;
  totalAmigos = 0;

  cargando = true;
  error: string | null = null;

  navItems: NavItem[] = [
    { icon: '🏠', label: 'Inicio', route: '/dashboard' },
    { icon: '📖', label: 'Xuxemons', route: '/xuxemons' },
    { icon: '🎒', label: 'Mochila', route: '/mochila' },
    { icon: '👥', label: 'Amigos', route: '/amigos' },
    { icon: '⚔️', label: 'Batallas', route: '/batallas' },
    { icon: '👤', label: 'Perfil', route: '/perfil' },
  ];

  private readonly EMOJI_MAP: Record<string, string> = {
    'agua': '🌊',
    'tierra': '🌿',
    'aire': '💨',
    'fuego': '🔥',
  };

  private pollSub?: Subscription;
  private prevXuxemonIds = new Set<number>();

  constructor(
    private xuxemonService: XuxemonService,
    private amigosService: AmigosService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.obtenerUsuario();
    this.usuarioNombre = user?.nombre ?? 'entrenador';
    this.cargarDatos();
    this.pollSub = interval(30000).subscribe(() => this.cargarSolicitudes());
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  // ── Carga ──────────────────────────────────────────────────────────────────

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    forkJoin({
      coleccion: this.xuxemonService.getColeccion().pipe(
        catchError(() => of({ total: 0, coleccion: [] } as ColeccionResponse))
      ),
      amigos: this.amigosService.getAmigos().pipe(
        catchError(() => of([] as Amigo[]))
      ),
      solicitudes: this.amigosService.getSolicitudesRecibidas().pipe(
        catchError(() => of([] as SolicitudRecibida[]))
      ),
    }).subscribe({
      next: ({ coleccion, amigos, solicitudes }) => {
        this.procesarColeccion(coleccion);
        this.procesarAmigos(amigos);
        this.procesarSolicitudes(solicitudes);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No s\'han pogut carregar les dades. Comprova la connexió.';
        this.cargando = false;
      }
    });
  }

  // ── Procesado ──────────────────────────────────────────────────────────────

  private procesarColeccion(resp: ColeccionResponse): void {
    const lista: XuxemonDash[] = resp.coleccion.map((entrada: EntradaColeccion) => {
      const x = entrada.xuxemon;
      const tipo = (x.tipo ?? '').toLowerCase();
      const isNew = !this.prevXuxemonIds.has(x.IDxuxemon) && this.prevXuxemonIds.size > 0;

      if (isNew) {
        this.agregarNotificacion(
          `🎉 Nou Xuxemon capturat!`,
          `Has capturat ${x.nombre} (${x.tipo}). Benvingut a l'equip!`,
          'green'
        );
      }

      return {
        id: x.IDxuxemon,
        name: x.nombre,
        type: tipo,
        hp: 100,
        emoji: this.EMOJI_MAP[tipo] ?? '✨',
        archivo: x.archivo,
        tamano: x.tamano,
        isNew,
      };
    });

    this.prevXuxemonIds = new Set(lista.map(x => x.id));
    this.xuxemons = lista;
    this.totalXuxemons = resp.total ?? lista.length;
    this.comprobarHitos(this.totalXuxemons);
  }

  private procesarAmigos(amigos: Amigo[]): void {
    const prev = this.totalAmigos;
    this.amigos = amigos;
    this.totalAmigos = amigos.length;
    if (amigos.length > prev && prev > 0) {
      this.agregarNotificacion('👥 Nou amic!', `Ara tens ${amigos.length} amics.`, 'blue');
    }
  }

  private procesarSolicitudes(solicitudes: SolicitudRecibida[]): void {
    const prevCount = this.solicitudesPendientes.length;
    solicitudes.slice(prevCount).forEach(s => {
      this.agregarNotificacion(
        '⚔️ Sol·licitud d\'amistat!',
        `${s.solicitante.nombre} ${s.solicitante.apellidos} vol ser el teu amic.`,
        'pink',
        () => this.aceptarSolicitud(s.id)
      );
    });
    this.solicitudesPendientes = solicitudes;
  }

  private comprobarHitos(total: number): void {
    if ([1, 5, 10, 25, 50, 100].includes(total)) {
      this.agregarNotificacion(
        `🏆 Fita aconseguida!`,
        `Ja tens ${total} Xuxemon${total > 1 ? 's' : ''} a la teva col·lecció!`,
        'green'
      );
    }
  }

  // ── Notificaciones ─────────────────────────────────────────────────────────

  agregarNotificacion(titulo: string, cuerpo: string, tipo: Notificacion['tipo'] = 'blue', accion?: () => void): void {
    this.notificaciones = [{
      id: `${Date.now()}-${Math.random()}`,
      titulo, cuerpo, tipo,
      timestamp: new Date(),
      leida: false,
      accion,
    }, ...this.notificaciones].slice(0, 10);
  }

  marcarLeida(id: string): void {
    this.notificaciones = this.notificaciones.map(n => n.id === id ? { ...n, leida: true } : n);
  }

  descartarNotificacion(id: string): void {
    this.notificaciones = this.notificaciones.filter(n => n.id !== id);
  }

  get notifNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  // ── Acciones ───────────────────────────────────────────────────────────────

  aceptarSolicitud(id: number): void {
    this.amigosService.aceptarSolicitud(id).subscribe({
      next: () => {
        this.solicitudesPendientes = this.solicitudesPendientes.filter(s => s.id !== id);
        this.amigosService.getAmigos().subscribe(a => this.procesarAmigos(a));
        this.agregarNotificacion('✅ Sol·licitud acceptada!', 'Nou amic afegit.', 'green');
      },
      error: () => this.agregarNotificacion('❌ Error', 'No s\'ha pogut acceptar.', 'orange')
    });
  }

  rechazarSolicitud(id: number): void {
    this.amigosService.rechazarSolicitud(id).subscribe({
      next: () => { this.solicitudesPendientes = this.solicitudesPendientes.filter(s => s.id !== id); },
      error: () => this.agregarNotificacion('❌ Error', 'No s\'ha pogut rebutjar.', 'orange')
    });
  }

  recargar(): void { this.cargarDatos(); }

  private cargarSolicitudes(): void {
    this.amigosService.getSolicitudesRecibidas().pipe(catchError(() => of([] as SolicitudRecibida[])))
      .subscribe(s => this.procesarSolicitudes(s));
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  imagenUrl(archivo: string): string {
    if (!archivo) return '';
    if (archivo.startsWith('http')) return archivo;
    return `http://localhost:8000/storage/${archivo}`;
  }

  trackById(_: number, item: XuxemonDash): number { return item.id; }
  trackByNotifId(_: number, item: Notificacion): string { return item.id; }
}