import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs/operators';
import {
  AmigosService,
  Amigo,
  SolicitudRecibida,
  UsuarioBusqueda
} from '../Services/amigos.service';

type Tab = 'amigos' | 'solicitudes' | 'buscar';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-amigos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './amigos.html',
  styleUrls: ['./amigos.css']
})
export class Amigos implements OnInit, OnDestroy {

  // ── Estado ────────────────────────────────────────────────────────────────
  tabActiva: Tab = 'amigos';

  amigos: Amigo[] = [];
  solicitudesRecibidas: SolicitudRecibida[] = [];
  resultadosBusqueda: UsuarioBusqueda[] = [];

  textoBusqueda = '';
  cargandoBusqueda = false;
  mensajeExito = '';
  mensajeError = '';

  amigoAEliminar: Amigo | null = null;

  // RxJS
  private busqueda$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  navItems: NavItem[] = [
    { icon: '🏠', label: 'Inicio',    route: '/dashboard' },
    { icon: '📖', label: 'Xuxemons', route: '/xuxemons' },
    { icon: '🎒', label: 'Mochila',   route: '/mochila' },
    { icon: '👥', label: 'Amigos',    route: '/amigos' },
    { icon: '⚔️', label: 'Batallas',  route: '/batallas' },
    { icon: '💬', label: 'Chat',      route: '/chat' },
    { icon: '👤', label: 'Perfil',    route: '/perfil' },
    { icon: '🛡️', label: 'Admin',     route: '/admin' },
  ];

  constructor(
    private amigosService: AmigosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarAmigos();
    this.cargarSolicitudes();
    this.configurarBusqueda();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Carga inicial 
  cargarAmigos(): void {
    this.amigosService.getAmigos().subscribe({
      next: (data) => {
        this.amigos = data;
        this.cdr.detectChanges();
      },
      error: () => this.mostrarError('No se pudieron cargar los amigos.')
    });
  }

  cargarSolicitudes(): void {
    this.amigosService.getSolicitudesRecibidas().subscribe({
      next: (data) => {
        this.solicitudesRecibidas = data;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  // ── Búsqueda con debounce 
  configurarBusqueda(): void {
    this.busqueda$
      .pipe(
        debounceTime(300), // Deb
        distinctUntilChanged(),
        filter((q) => q.length >= 3),
        switchMap((q) => {
          this.cargandoBusqueda = true;
          return this.amigosService.buscarUsuarios(q);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.resultadosBusqueda = res;
          this.cargandoBusqueda = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cargandoBusqueda = false;
        }
      });
  }

  onInputBusqueda(): void {
    if (this.textoBusqueda.length < 3) {
      this.resultadosBusqueda = [];
    }
    this.busqueda$.next(this.textoBusqueda);
  }

  // ── Solicitudes 
  enviarSolicitud(identificador: string): void {
    this.amigosService.enviarSolicitud(identificador).subscribe({
      next: () => {
        this.mostrarExito('¡Solicitud enviada!');
        // Ocultamos ese resultado para que no se vuelva a pulsar
        this.resultadosBusqueda = this.resultadosBusqueda.filter(
          (u) => u.identificador !== identificador
        );
      },
      error: (err) => this.mostrarError(err.error?.message || 'Error al enviar la solicitud.')
    });
  }

  aceptarSolicitud(solicitud: SolicitudRecibida): void {
    this.amigosService.aceptarSolicitud(solicitud.id).subscribe({
      next: () => {
        this.mostrarExito('¡Amistad aceptada!');
        this.solicitudesRecibidas = this.solicitudesRecibidas.filter((s) => s.id !== solicitud.id);
        this.cargarAmigos();
      },
      error: () => this.mostrarError('Error al aceptar la solicitud.')
    });
  }

  rechazarSolicitud(solicitud: SolicitudRecibida): void {
    this.amigosService.rechazarSolicitud(solicitud.id).subscribe({
      next: () => {
        this.mostrarExito('Solicitud rechazada.');
        this.solicitudesRecibidas = this.solicitudesRecibidas.filter((s) => s.id !== solicitud.id);
      },
      error: () => this.mostrarError('Error al rechazar la solicitud.')
    });
  }

  // ── Eliminar amigo 
  confirmarEliminar(amigo: Amigo): void {
    this.amigoAEliminar = amigo;
  }

  cancelarEliminar(): void {
    this.amigoAEliminar = null;
  }

  eliminarAmigo(): void {
    if (!this.amigoAEliminar) return;
    this.amigosService.eliminarAmigo(this.amigoAEliminar.amistad_id).subscribe({
      next: () => {
        this.mostrarExito('Amigo eliminado.');
        this.amigos = this.amigos.filter(
          (a) => a.amistad_id !== this.amigoAEliminar!.amistad_id
        );
        this.amigoAEliminar = null;
      },
      error: () => this.mostrarError('Error al eliminar el amigo.')
    });
  }

  // ── Tabs 
  cambiarTab(tab: Tab): void {
    this.tabActiva = tab;
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  // ── Utilidades 
  private mostrarExito(msg: string): void {
    this.mensajeExito = msg;
    this.mensajeError = '';
    setTimeout(() => (this.mensajeExito = ''), 3000);
  }

  private mostrarError(msg: string): void {
    this.mensajeError = msg;
    this.mensajeExito = '';
    setTimeout(() => (this.mensajeError = ''), 4000);
  }

  get numSolicitudesPendientes(): number {
    return this.solicitudesRecibidas.length;
  }
}