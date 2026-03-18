import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
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
}
interface NavItem { icon: string; label: string; route: string; }

const EMOJIS: Record<string, string> = {
  // Ítems
  'Xuxe Roja': '🔴', 'Xuxe Azul': '🔵', 'Xuxe Dorada': '🟡',
  'Chocolatina': '🍫', 'Mermelada de frutas': '🍓', 'Insulina': '💉',
  // Xuxemons
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

  xuxemons: Xuxemon[] = [
    { IDxuxemon: 1, nombre: 'Apleki', tipo: 'Tierra', tamano: 'Pequeño', img: '🐌', discovered: true },
    { IDxuxemon: 2, nombre: 'Avecrem', tipo: 'Aire', tamano: 'Pequeño', img: '🐔', discovered: true },
    { IDxuxemon: 3, nombre: 'Bambino', tipo: 'Tierra', tamano: 'Pequeño', img: '🦌', discovered: false },
    { IDxuxemon: 4, nombre: 'Beeboo', tipo: 'Aire', tamano: 'Pequeño', img: '🐝', discovered: true },
    { IDxuxemon: 5, nombre: 'Boo-hoot', tipo: 'Aire', tamano: 'Mediano', img: '🦉', discovered: true },
    { IDxuxemon: 6, nombre: 'Cabrales', tipo: 'Tierra', tamano: 'Mediano', img: '🐐', discovered: true },
    { IDxuxemon: 7, nombre: 'Catua', tipo: 'Aire', tamano: 'Pequeño', img: ' Parrot', discovered: true },
    { IDxuxemon: 8, nombre: 'Catyuska', tipo: 'Aire', tamano: 'Grande', img: '🕊️', discovered: true },
    { IDxuxemon: 9, nombre: 'Chapapá', tipo: 'Agua', tamano: 'Pequeño', img: '🐸', discovered: true },
    { IDxuxemon: 10, nombre: 'Chopper', tipo: 'Tierra', tamano: 'Grande', img: '🐱', discovered: true },
    { IDxuxemon: 11, nombre: 'Cuellilargui', tipo: 'Tierra', tamano: 'Grande', img: '🦕', discovered: false },
    { IDxuxemon: 12, nombre: 'Deskangoo', tipo: 'Tierra', tamano: 'Mediano', img: '🦘', discovered: false },
    { IDxuxemon: 13, nombre: 'Doflamingo', tipo: 'Aire', tamano: 'Grande', img: '🦩', discovered: false },
    { IDxuxemon: 14, nombre: 'Dolly', tipo: 'Tierra', tamano: 'Pequeño', img: '🐑', discovered: false },
    { IDxuxemon: 15, nombre: 'Elconchudo', tipo: 'Agua', tamano: 'Mediano', img: '🦀', discovered: false },
    { IDxuxemon: 16, nombre: 'Eldientes', tipo: 'Agua', tamano: 'Grande', img: '🦛', discovered: false },
    { IDxuxemon: 17, nombre: 'Elgominas', tipo: 'Tierra', tamano: 'Pequeño', img: '🦔', discovered: false },
    { IDxuxemon: 18, nombre: 'Flipper', tipo: 'Agua', tamano: 'Mediano', img: '🐬', discovered: false },
    { IDxuxemon: 19, nombre: 'Floppi', tipo: 'Tierra', tamano: 'Pequeño', img: '🐒', discovered: false },
    { IDxuxemon: 20, nombre: 'Horseluis', tipo: 'Agua', tamano: 'Grande', img: '🦄', discovered: false },
    { IDxuxemon: 21, nombre: 'Krokolisko', tipo: 'Agua', tamano: 'Grande', img: '🐊', discovered: false },
    { IDxuxemon: 22, nombre: 'Kurama', tipo: 'Tierra', tamano: 'Mediano', img: 'FOX', discovered: false },
    { IDxuxemon: 23, nombre: 'Ladybug', tipo: 'Aire', tamano: 'Pequeño', img: '🐞', discovered: false },
    { IDxuxemon: 24, nombre: 'Lengualargui', tipo: 'Tierra', tamano: 'Mediano', img: '🦎', discovered: false },
    { IDxuxemon: 25, nombre: 'Medusation', tipo: 'Agua', tamano: 'Mediano', img: '🪼', discovered: false },
    { IDxuxemon: 26, nombre: 'Meekmeek', tipo: 'Tierra', tamano: 'Pequeño', img: '🐭', discovered: false },
    { IDxuxemon: 27, nombre: 'Megalo', tipo: 'Agua', tamano: 'Grande', img: '🦈', discovered: false },
    { IDxuxemon: 28, nombre: 'Mocha', tipo: 'Agua', tamano: 'Grande', img: '🐳', discovered: false },
    { IDxuxemon: 29, nombre: 'Murcimurci', tipo: 'Aire', tamano: 'Pequeño', img: '🦇', discovered: false },
    { IDxuxemon: 30, nombre: 'Nemo', tipo: 'Agua', tamano: 'Pequeño', img: '🐠', discovered: false },
    { IDxuxemon: 31, nombre: 'Oinkcelot', tipo: 'Tierra', tamano: 'Mediano', img: '🐷', discovered: false },
    { IDxuxemon: 32, nombre: 'Oreo', tipo: 'Tierra', tamano: 'Grande', img: '🐄', discovered: false },
    { IDxuxemon: 33, nombre: 'Otto', tipo: 'Tierra', tamano: 'Pequeño', img: '🦦', discovered: false },
    { IDxuxemon: 34, nombre: 'Pinchimott', tipo: 'Agua', tamano: 'Pequeño', img: '🦀', discovered: false },
    { IDxuxemon: 35, nombre: 'Pollis', tipo: 'Aire', tamano: 'Pequeño', img: '🐣', discovered: false },
    { IDxuxemon: 36, nombre: 'Posón', tipo: 'Aire', tamano: 'Mediano', img: '🦋', discovered: false },
    { IDxuxemon: 37, nombre: 'Quakko', tipo: 'Agua', tamano: 'Pequeño', img: '🦆', discovered: false },
    { IDxuxemon: 38, nombre: 'Rajoy', tipo: 'Aire', tamano: 'Mediano', img: '🕊️', discovered: false },
    { IDxuxemon: 39, nombre: 'Rawlion', tipo: 'Tierra', tamano: 'Grande', img: '🦁', discovered: false },
    { IDxuxemon: 40, nombre: 'Rexxo', tipo: 'Tierra', tamano: 'Grande', img: '🦖', discovered: false },
    { IDxuxemon: 41, nombre: 'Ron', tipo: 'Tierra', tamano: 'Pequeño', img: '🐈', discovered: false },
    { IDxuxemon: 42, nombre: 'Sesssi', tipo: 'Tierra', tamano: 'Mediano', img: '🐍', discovered: false },
    { IDxuxemon: 43, nombre: 'Shelly', tipo: 'Agua', tamano: 'Pequeño', img: '🐢', discovered: false },
    { IDxuxemon: 44, nombre: 'Sirucco', tipo: 'Aire', tamano: 'Grande', img: '🦄', discovered: false },
    { IDxuxemon: 45, nombre: 'Torcas', tipo: 'Agua', tamano: 'Mediano', img: '🦫', discovered: false },
    { IDxuxemon: 46, nombre: 'Trompeta', tipo: 'Aire', tamano: 'Pequeño', img: '🐦', discovered: false },
    { IDxuxemon: 47, nombre: 'Trompi', tipo: 'Tierra', tamano: 'Grande', img: '🐘', discovered: false },
    { IDxuxemon: 48, nombre: 'Tux', tipo: 'Agua', tamano: 'Mediano', img: '🐧', discovered: false },
  ];

  adminDescubrirId = 3;
  adminXuxMsg = '';

  constructor(
    private mochilaService: MochilaService,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.obtenerToken()}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarItems();
    this.cargarXuxemons();
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
    });
  }

  cargarItems(): void {
    this.http.get<any[]>(`${this.apiUrl}/items`, { headers: this.headers() }).subscribe({
      next: (data) => {
        this.itemsAPI = data;
        this.itemsApilablesAPI = data.filter(i => i.tipo === 'xuxe');
        this.itemsSimplesAPI = data.filter(i => i.tipo === 'vacuna');
        if (this.itemsApilablesAPI.length) this.adminXuxeId = this.itemsApilablesAPI[0].id;
        if (this.itemsSimplesAPI.length) this.adminVacunaId = this.itemsSimplesAPI[0].id;
        if (this.itemsAPI.length) this.adminQuitarItemId = this.itemsAPI[0].id;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando items:', err)
    });
  }

  onUsuarioChange(): void {
    this.refrescarTodo();
  }

  refrescarTodo(): void {
    this.cargarMochilaUsuario();
    this.cargarXuxemonsUsuario();
  }

  cargarXuxemons(): void {
    this.http.get<any[]>(`${this.apiUrl}/xuxemons`, { headers: this.headers() }).subscribe({
      next: (data) => {
        this.xuxemons = data;
        if (data.length > 0) this.adminDescubrirId = data[0].IDxuxemon;
        this.cdr.detectChanges();
      }
    });
  }

  cargarXuxemonsUsuario(): void {
    if (!this.usuarioSeleccionado) return;
    const userId = encodeURIComponent(this.usuarioSeleccionado);
    this.http.get<any[]>(`${this.apiUrl}/admin/usuarios/${userId}/xuxemons`, { headers: this.headers() }).subscribe({
      next: (data) => {
        this.userXuxemonIds = data.map(x => Number(x.IDxuxemon));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando xuxemons del usuario:', err)
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

        const xuxEntries = res.xuxemons.map(x => ({
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

  calcularEspacios(mochila: any[]): void {
    const soloItems = mochila.filter(m => m.item.tipo === 'xuxe' || m.item.tipo === 'vacuna');
    this.espaciosUsadosUsuario = soloItems.reduce((total, m) => {
      return total + (m.item.tipo === 'xuxe' ? Math.ceil(m.cantidad / 5) : m.cantidad);
    }, 0);
    this.porcentajeMochilaUsuario = (this.espaciosUsadosUsuario / 20) * 100;
    this.mochilaLlenaUsuario = this.espaciosUsadosUsuario >= 20;
    this.cdr.detectChanges();
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
        this.adminXuxMsg = '🎲 ' + (res.message || '¡Nuevos xuxemon descubierto!');
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