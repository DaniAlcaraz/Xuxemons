import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MochilaService } from '../Services/mochila';
import { AuthService } from '../Services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export type Rareza = 'común' | 'raro' | 'épico' | 'legendario';
export type TipoXuxemon = 'Tierra' | 'Aire' | 'Agua';
export type TamanoXuxemon = 'Pequeño' | 'Mediano' | 'Grande';

export interface ItemAPI { id: number; nombre: string; tipo: string; descripcion: string; rareza: Rareza; }
export interface Usuario { identificador: string; nombre: string; apellidos: string; email: string; rol: string; }

export interface Xuxemon {
  IDxuxemon: number; nombre: string; tipo: TipoXuxemon;
  tamano: TamanoXuxemon; img: string; discovered: boolean;
  enfermo: boolean;        // ← AÑADIDO
  enfermedad: string | null; // ← AÑADIDO
}
interface NavItem { icon: string; label: string; route: string; }

const EMOJIS: Record<string, string> = {
  'Xuxe Roja': '🔴', 'Xuxe Azul': '🔵', 'Xuxe Dorada': '🟡',
  'Chocolatina': '🍫', 'Mermelada de frutas': '🍓', 'Insulina': '💉',
  'Apleki': '🐌', 'Avecrem': '🐔', 'Bambino': '🦌',
  'Beeboo': '🐝', 'Boo-hoot': '🦉', 'Cabrales': '🐐',
  'Catua': '🦜', 'Catyuska': '🕊️', 'Chapapá': '🐸',
  'Chopper': '🐱', 'Cuellilargui': '🦕', 'Deskangoo': '🦘',
  'Doflamingo': '🦩', 'Dolly': '🐑', 'Elconchudo': '🦀',
  'Eldientes': '🦛', 'Elgominas': '🦔', 'Flipper': '🐬',
  'Floppi': '🐒', 'Horseluis': '🦄', 'Krokolisko': '🐊',
  'Kurama': '🦊', 'Ladybug': '🐞', 'Lengualargui': '🦎',
  'Medusation': '🪼', 'Meekmeek': '🐭', 'Megalo': '🦈',
  'Mocha': '🐳', 'Murcimurci': '🦇', 'Nemo': '🐠',
  'Oinkcelot': '🐷', 'Oreo': '🐄', 'Otto': '🦦',
  'Pinchimott': '🦀', 'Pollis': '🐣', 'Posón': '🦋',
  'Quakko': '🦆', 'Rajoy': '🕊️', 'Rawlion': '🦁',
  'Rexxo': '🦖', 'Ron': '🐈', 'Sesssi': '🐍',
  'Shelly': '🐢', 'Sirucco': '🦅', 'Torcas': '🦫',
  'Trompeta': '🐦', 'Trompi': '🐘', 'Tux': '🐧',
};

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit {

  activeTab: 'mochila' | 'xuxemons' = 'mochila';
  private apiUrl = 'http://localhost:8000/api';

  usuarios: Usuario[] = [];
  usuarioSeleccionado = '';

  itemsAPI: ItemAPI[] = [];
  itemsApilablesAPI: ItemAPI[] = [];
  itemsSimplesAPI: ItemAPI[] = [];

  mochilaUsuario: any[] = [];
  userXuxemonIds: number[] = [];
  espaciosUsadosUsuario = 0;
  porcentajeMochilaUsuario = 0;
  mochilaLlenaUsuario = false;

  adminXuxeId = 0;
  adminXuxeQty = 1;
  adminXuxeMsg = '';
  adminVacunaId = 0;
  adminVacunaQty = 1;
  adminVacunaMsg = '';
  adminQuitarItemId = 0;
  adminQuitarQty = 1;
  adminQuitarMsg = '';
  adminXuxesDiariosActivo = true;
  adminXuxesDiariosHora = '09:00';
  adminXuxesDiariosCantidad = 5;
  adminXuxesDiariosMsg = '';

configPequenoMediano = 3;
  configMedianoGrande  = 5;
  adminConfigMsg       = '';

  // ── Enfermar ──
  adminEnfermarXuxId = 0;
  adminEnfermedad    = 'Bajón de azúcar';
  adminEnfermarMsg   = '';

  xuxemons: Xuxemon[] = [];
  adminDescubrirId = 0;
  adminXuxMsg = '';

  constructor(
    private mochilaService: MochilaService,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.obtenerToken()}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  ngOnInit(): void {
    if (!this.authService.obtenerToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarUsuarios();
    this.cargarItems();
    this.cargarXuxemons();
    this.cargarConfigXuxes();
  }

  private manejarUnauthorized(err: any): boolean {
    if (err?.status === 401) {
      this.authService.cerrarSesion();
      this.router.navigate(['/login']);
      return true;
    }
    return false;
  }

  cargarUsuarios(): void {
    this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, { headers: this.headers() }).subscribe({
      next: (data) => {
        this.usuarios = data;
        if (data.length > 0) {
          this.usuarioSeleccionado = data[0].identificador;
          this.onUsuarioChange();
        }
        this.cdr.detectChanges();
      }
      ,
      error: (err) => {
        this.manejarUnauthorized(err);
      }
    });
  }

  cargarItems(): void {
    this.http.get<any[]>(`${this.apiUrl}/items`, { headers: this.headers() }).subscribe({
      next: (data) => {
        this.itemsAPI = data;
        this.itemsApilablesAPI = data.filter(i => i.tipo === 'xuxe');
        this.itemsSimplesAPI   = data.filter(i => i.tipo === 'vacuna');
        if (this.itemsApilablesAPI.length) this.adminXuxeId       = this.itemsApilablesAPI[0].id;
        if (this.itemsSimplesAPI.length)   this.adminVacunaId     = this.itemsSimplesAPI[0].id;
        if (this.itemsAPI.length)          this.adminQuitarItemId = this.itemsAPI[0].id;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (!this.manejarUnauthorized(err)) {
          this.adminXuxeMsg = '⚠️ Error cargando ítems.';
        }
      }
    });
  }

  onUsuarioChange(): void {
    this.cargarConfigXuxesDiarios();
    this.refrescarTodo();
  }

  refrescarTodo(): void {
    this.cargarMochilaUsuario();
    this.cargarXuxemonsUsuario();
  }

  cargarXuxemons(): void {
    this.http.get<any[]>(`${this.apiUrl}/xuxemons`, { headers: this.headers() }).subscribe({
      next: (data) => {
        this.xuxemons = data.map(x => ({
          ...x,
          enfermo:    x.enfermo    ?? false,
          enfermedad: x.enfermedad ?? null,
        }));
        if (data.length > 0) this.adminDescubrirId = data[0].IDxuxemon;
        this.cdr.detectChanges();
      }
      ,
      error: (err) => {
        this.manejarUnauthorized(err);
      }
    });
  }

  cargarXuxemonsUsuario(): void {
    if (!this.usuarioSeleccionado) return;
    const userId = encodeURIComponent(this.usuarioSeleccionado);
    this.http.get<any[]>(`${this.apiUrl}/admin/usuarios/${userId}/xuxemons`, { headers: this.headers() }).subscribe({
      next: (data) => {
        this.userXuxemonIds = data.map(x => Number(x.IDxuxemon));
        if (data.length > 0) this.adminEnfermarXuxId = data[0].IDxuxemon; // ← AÑADIDO
        // Actualizar estado enfermo en la lista
        data.forEach(x => {
          const found = this.xuxemons.find(xux => xux.IDxuxemon === Number(x.IDxuxemon));
          if (found) {
            found.enfermo    = x.pivot?.enfermo    ?? false;
            found.enfermedad = x.pivot?.enfermedad ?? null;
          }
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (!this.manejarUnauthorized(err)) {
          this.adminXuxMsg = '⚠️ Error cargando xuxemons del usuario.';
        }
      }
    });
  }

  cargarMochilaUsuario(): void {
    if (!this.usuarioSeleccionado) return;
    const id = encodeURIComponent(this.usuarioSeleccionado);

    const obsMochila = this.http.get<any[]>(`${this.apiUrl}/admin/mochila?user=${id}`, { headers: this.headers() });
    const obsXuxemons = this.http.get<any[]>(
      `${this.apiUrl}/admin/usuarios/${id}/xuxemons`,
      { headers: this.headers() }
    ).pipe(catchError(() => of([])));

    forkJoin({ items: obsMochila, xuxemons: obsXuxemons }).subscribe({
      next: (res) => {
        const itemEntries = res.items.map(e => ({
          id: e.id,
          cantidad: e.cantidad,
          item: e.item
        }));

        const xuxEntries = res.xuxemons.map((x: any) => ({
          id: x.IDxuxemon,
          cantidad: 1,
          item: {
            id: x.IDxuxemon,
            nombre: x.nombre,
            tipo: 'xuxemon',
            rareza: 'común',
            descripcion: `Xuxemon de tipo ${x.tipo}`
          }
        }));
        this.mochilaUsuario = [...itemEntries, ...xuxEntries];
        this.calcularEspacios(this.mochilaUsuario);
      },
      error: () => {
        this.mochilaUsuario = [];
        this.espaciosUsadosUsuario = 0;
        this.cdr.detectChanges();
      }
    });
  }

  cargarConfigXuxesDiarios(): void {
    if (!this.usuarioSeleccionado) return;
    const userId = encodeURIComponent(this.usuarioSeleccionado);
    this.http.get<any>(`${this.apiUrl}/admin/usuarios/${userId}/xuxes-diarios`, { headers: this.headers() }).subscribe({
      next: (config) => {
        this.adminXuxesDiariosActivo = !!config.activo;
        this.adminXuxesDiariosHora = config.hora || '09:00';
        this.adminXuxesDiariosCantidad = Number(config.cantidad ?? 5);
        this.cdr.detectChanges();
      },
      error: () => {
        this.adminXuxesDiariosMsg = '⚠️ No se pudo cargar la configuración diaria.';
        this.cdr.detectChanges();
      }
    });
  }

  calcularEspacios(mochila: any[]): void {
    const soloItems = mochila.filter(m => m.item.tipo === 'xuxe' || m.item.tipo === 'vacuna');
    this.espaciosUsadosUsuario = soloItems.reduce((total, m) => {
      return total + (m.item.tipo === 'xuxe' ? Math.ceil(m.cantidad / 5) : m.cantidad);
    }, 0);
    this.porcentajeMochilaUsuario = (this.espaciosUsadosUsuario / 20) * 100;
    this.mochilaLlenaUsuario = this.espaciosUsadosUsuario >= 20;
    this.cdr.detectChanges();
  }

  cargarConfigXuxes(): void {
    this.http.get<any>(`${this.apiUrl}/configuracion/xuxes`, { headers: this.headers() }).subscribe({
      next: (data) => {
        this.configPequenoMediano = data.xuxes_pequeno_a_mediano;
        this.configMedianoGrande  = data.xuxes_mediano_a_grande;
        this.cdr.detectChanges();
      }
    });
  }

  guardarConfigXuxes(): void {
    this.adminConfigMsg = '';
    const body = {
      xuxes_pequeno_a_mediano: this.configPequenoMediano,
      xuxes_mediano_a_grande:  this.configMedianoGrande,
    };
    this.http.post<any>(`${this.apiUrl}/configuracion/xuxes`, body, { headers: this.headers() }).subscribe({
      next: (res) => {
        this.adminConfigMsg = '✅ ' + res.message;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.adminConfigMsg = '⚠️ ' + (err.error?.message ?? 'Error al guardar');
        this.cdr.detectChanges();
      }
    });
  }

  get totalXuxemons(): number { return this.xuxemons.length; }
  get descubiertos(): number { return this.userXuxemonIds.length; }
  get noDescubiertos(): number { return this.totalXuxemons - this.descubiertos; }
  get porcentajeDesc(): number { return this.totalXuxemons > 0 ? (this.descubiertos / this.totalXuxemons) * 100 : 0; }

  isDiscovered(idXuxemon: number): boolean {
    return this.userXuxemonIds.includes(Number(idXuxemon));
  }

  getEmoji(nombre: string): string { return EMOJIS[nombre] ?? '📦'; }

  anadirXuxes(): void {
    this.adminXuxeMsg = '';
    this.mochilaService.anadir(this.usuarioSeleccionado, this.adminXuxeId, this.adminXuxeQty).subscribe({
      next: (res) => {
        this.adminXuxeMsg = '✅ ' + res.message;
        this.adminXuxeQty = 1;
        this.cargarMochilaUsuario();
      },
      error: (err) => {
        this.adminXuxeMsg = '⚠️ ' + (err.error?.error ?? 'Error al añadir');
        this.cdr.detectChanges();
      }
    });
  }

  anadirVacuna(): void {
    this.adminVacunaMsg = '';
    this.mochilaService.anadir(this.usuarioSeleccionado, this.adminVacunaId, this.adminVacunaQty).subscribe({
      next: (res) => {
        this.adminVacunaMsg = '✅ ' + res.message;
        this.adminVacunaQty = 1;
        this.cargarMochilaUsuario();
      },
      error: (err) => {
        this.adminVacunaMsg = '⚠️ ' + (err.error?.error ?? 'Error al añadir');
        this.cdr.detectChanges();
      }
    });
  }

  quitarItem(): void {
    this.adminQuitarMsg = '';
    this.mochilaService.quitar(this.usuarioSeleccionado, this.adminQuitarItemId, this.adminQuitarQty).subscribe({
      next: (res) => {
        this.adminQuitarMsg = '✅ ' + res.message;
        this.adminQuitarQty = 1;
        this.cargarMochilaUsuario();
      },
      error: (err) => {
        this.adminQuitarMsg = '⚠️ ' + (err.error?.error ?? 'Error al quitar');
        this.cdr.detectChanges();
      }
    });
  }

  descubrirXuxemon(): void {
    if (!this.usuarioSeleccionado) return;
    this.adminXuxMsg = '⏳ Procesando...';
    const body = { user_identificador: this.usuarioSeleccionado, xuxemon_id: Number(this.adminDescubrirId) };
    this.http.post<any>(`${this.apiUrl}/admin/xuxemons/anadir`, body, { headers: this.headers() }).subscribe({
      next: (res) => {
        this.adminXuxMsg = '✅ ' + (res.message || 'Xuxemon descubierto');
        this.refrescarTodo();
      },
      error: (err) => this.adminXuxMsg = '⚠️ ' + (err.error?.error || 'Error al descubrir')
    });
  }

  descubrirAleatorio(): void {
    if (!this.usuarioSeleccionado) return;
    this.adminXuxMsg = '⏳ Buscando...';
    const body = { user_identificador: this.usuarioSeleccionado };
    this.http.post<any>(`${this.apiUrl}/admin/xuxemons/aleatorio`, body, { headers: this.headers() }).subscribe({
      next: (res) => {
        this.adminXuxMsg = '🎲 ' + (res.message || '¡Nuevo xuxemon descubierto!');
        this.refrescarTodo();
      },
      error: (err) => this.adminXuxMsg = '⚠️ ' + (err.error?.error || 'Error en aleatorio')
    });
  }

  ocultarXuxemon(): void {
    if (!this.usuarioSeleccionado) return;
    this.adminXuxMsg = '⏳ Procesando...';
    const body = { user_identificador: this.usuarioSeleccionado, xuxemon_id: Number(this.adminDescubrirId) };
    this.http.post<any>(`${this.apiUrl}/admin/xuxemons/quitar`, body, { headers: this.headers() }).subscribe({
      next: (res) => {
        this.adminXuxMsg = '🔒 ' + (res.message || 'Xuxemon ocultado');
        this.refrescarTodo();
      },
      error: (err) => this.adminXuxMsg = '⚠️ ' + (err.error?.error || 'Error al ocultar')
    });
  }

  // ── Enfermar ── ← AÑADIDO
  enfermarXuxemon(): void {
    if (!this.usuarioSeleccionado) return;
    this.adminEnfermarMsg = '';
    const body = {
      user_identificador: this.usuarioSeleccionado,
      xuxemon_id:         Number(this.adminEnfermarXuxId),
      enfermedad:         this.adminEnfermedad,
    };
    this.http.post<any>(`${this.apiUrl}/admin/xuxemons/enfermar`, body, { headers: this.headers() }).subscribe({
      next: (res) => {
        this.adminEnfermarMsg = '✅ ' + res.message;
        this.refrescarTodo();
      },
      error: (err) => {
        this.adminEnfermarMsg = '⚠️ ' + (err.error?.error || 'Error al enfermar');
        this.cdr.detectChanges();
      }
    });
  }

  guardarXuxesDiarios(): void {
    if (!this.usuarioSeleccionado) return;
    this.adminXuxesDiariosMsg = '⏳ Guardando...';
    const userId = encodeURIComponent(this.usuarioSeleccionado);
    const body = {
      activo: this.adminXuxesDiariosActivo,
      hora: this.adminXuxesDiariosHora,
      cantidad: Number(this.adminXuxesDiariosCantidad),
    };
    this.http.put<any>(`${this.apiUrl}/admin/usuarios/${userId}/xuxes-diarios`, body, { headers: this.headers() }).subscribe({
      next: (res) => {
        this.adminXuxesDiariosMsg = '✅ ' + (res.message || 'Configuración guardada.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.adminXuxesDiariosMsg = '⚠️ ' + (err.error?.message || 'No se pudo guardar la configuración.');
        this.cdr.detectChanges();
      }
    });
  }

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