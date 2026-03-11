import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MochilaService } from '../Services/mochila';
import { AuthService } from '../Services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export type Rareza = 'común' | 'raro' | 'épico' | 'legendario';
export type TipoXuxemon = 'Tierra' | 'Aire' | 'Agua';
export type TamanoXuxemon = 'Pequeño' | 'Mediano' | 'Grande';

export interface ItemAPI { id: number; nombre: string; tipo: string; descripcion: string; rareza: Rareza; }
export interface Usuario { identificador: string; nombre: string; apellidos: string; email: string; rol: string; }

export interface Xuxemon {
  id: number; nombre: string; tipo: TipoXuxemon;
  tamano: TamanoXuxemon; img: string; discovered: boolean;
}
interface NavItem { icon: string; label: string; route: string; }

const EMOJIS: Record<string, string> = {
  'Xuxe Roja': '🔴', 'Xuxe Azul': '🔵', 'Xuxe Dorada': '🟡',
  'Chocolatina': '🍫', 'Mermelada de frutas': '🍓', 'Insulina': '💉',
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

  // ── USUARIOS ─────────────────────────────────────────────────────────────────
  usuarios: Usuario[] = [];
  usuarioSeleccionado = '';

  // ── ITEMS API ────────────────────────────────────────────────────────────────
  itemsAPI: ItemAPI[] = [];
  itemsApilablesAPI: ItemAPI[] = [];
  itemsSimplesAPI: ItemAPI[] = [];

  // ── MOCHILA USUARIO SELECCIONADO ─────────────────────────────────────────────
  mochilaUsuario: any[] = [];
  espaciosUsadosUsuario = 0;
  porcentajeMochilaUsuario = 0;
  mochilaLlenaUsuario = false;

  // ── FORM AÑADIR/QUITAR ITEMS ─────────────────────────────────────────────────
  adminXuxeId = 0;
  adminXuxeQty = 1;
  adminXuxeMsg = '';
  adminVacunaId = 0;
  adminVacunaQty = 1;
  adminVacunaMsg = '';
  adminQuitarItemId = 0;
  adminQuitarQty = 1;
  adminQuitarMsg = '';

  // ── XUXEMONS (dinámico desde DB) ─────────────────────────────────────────────
  xuxemons: any[] = [];
  userXuxemonIds: number[] = []; 
  adminDescubrirId = 0;
  adminXuxMsg = '';

  constructor(private mochilaService: MochilaService, private authService: AuthService, private http: HttpClient) {}

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
      }
    });
  }
    cargarItems(): void {
      this.http.get<any[]>(`${this.apiUrl}/items`, { headers: this.headers() }).subscribe({
        next: (data) => {
          console.log('Items recibidos:', data);
          this.itemsAPI = data;
          this.itemsApilablesAPI = data.filter(i => i.tipo === 'xuxe');
          this.itemsSimplesAPI   = data.filter(i => i.tipo === 'vacuna');
          if (this.itemsApilablesAPI.length) this.adminXuxeId      = this.itemsApilablesAPI[0].id;
          if (this.itemsSimplesAPI.length)   this.adminVacunaId    = this.itemsSimplesAPI[0].id;
          if (this.itemsAPI.length)          this.adminQuitarItemId = this.itemsAPI[0].id;
        },
        error: (err) => console.error('Error cargando items:', err)
      });
    }

  onUsuarioChange(): void {
    this.cargarMochilaUsuario();
    this.cargarXuxemonsUsuario();
  }

  cargarXuxemons(): void {
    this.http.get<any[]>(`${this.apiUrl}/xuxemons`, { headers: this.headers() }).subscribe({
      next: (data) => {
        this.xuxemons = data;
        if (data.length > 0) this.adminDescubrirId = data[0].IDxuxemon;
      }
    });
  }

  cargarXuxemonsUsuario(): void {
    if (!this.usuarioSeleccionado) return;
    this.http.get<any[]>(`${this.apiUrl}/admin/usuarios/${this.usuarioSeleccionado}/xuxemons`, { headers: this.headers() }).subscribe({
      next: (data) => {
        this.userXuxemonIds = data.map(x => x.IDxuxemon);
      }
    });
  }

  cargarMochilaUsuario(): void {
    if (!this.usuarioSeleccionado) return;
    this.http.get<any[]>(`${this.apiUrl}/admin/mochila?user=${this.usuarioSeleccionado}`, { headers: this.headers() }).subscribe({
      next: (data) => {
        this.mochilaUsuario = data;
        this.calcularEspacios(data);
      },
      error: () => { this.mochilaUsuario = []; this.espaciosUsadosUsuario = 0; }
    });
  }

  calcularEspacios(mochila: any[]): void {
    this.espaciosUsadosUsuario = mochila.reduce((total, m) => {
      return total + (m.item.tipo === 'xuxe' ? Math.ceil(m.cantidad / 5) : m.cantidad);
    }, 0);
    this.porcentajeMochilaUsuario = (this.espaciosUsadosUsuario / 20) * 100;
    this.mochilaLlenaUsuario = this.espaciosUsadosUsuario >= 20;
  }

  getEmoji(nombre: string): string { 
    // Mapeo dinámico o emojis fijos para xuxemons
    const emojisXux: Record<string, string> = {
      'Apleki': '🐌', 'Avecrem': '🐔', 'Bambino': '🦌', 'Beeboo': '🐝', 'Boo-hoot': '🦉',
    };
    return emojisXux[nombre] ?? (EMOJIS[nombre] ?? '📦'); 
  }

  // Helper para el HTML
  isDiscovered(idXuxemon: number): boolean {
    return this.userXuxemonIds.includes(idXuxemon);
  }

  get totalXuxemons()  { return this.xuxemons.length; }
  get descubiertos()   { return this.userXuxemonIds.length; }
  get noDescubiertos() { return this.totalXuxemons - this.descubiertos; }
  get porcentajeDesc() { return this.totalXuxemons > 0 ? (this.descubiertos / this.totalXuxemons) * 100 : 0; }
  

  anadirXuxes(): void {
    this.adminXuxeMsg = '';
    this.mochilaService.anadir(this.usuarioSeleccionado, this.adminXuxeId, this.adminXuxeQty).subscribe({
      next: (res) => { this.adminXuxeMsg = '✅ ' + res.message; this.adminXuxeQty = 1; this.cargarMochilaUsuario(); },
      error: (err) => { this.adminXuxeMsg = '⚠️ ' + (err.error?.error ?? 'Error al añadir'); }
    });
  }

  anadirVacuna(): void {
    this.adminVacunaMsg = '';
    this.mochilaService.anadir(this.usuarioSeleccionado, this.adminVacunaId, this.adminVacunaQty).subscribe({
      next: (res) => { this.adminVacunaMsg = '✅ ' + res.message; this.adminVacunaQty = 1; this.cargarMochilaUsuario(); },
      error: (err) => { this.adminVacunaMsg = '⚠️ ' + (err.error?.error ?? 'Error al añadir'); }
    });
  }

  quitarItem(): void {
    this.adminQuitarMsg = '';
    this.mochilaService.quitar(this.usuarioSeleccionado, this.adminQuitarItemId, this.adminQuitarQty).subscribe({
      next: (res) => { this.adminQuitarMsg = '✅ ' + res.message; this.adminQuitarQty = 1; this.cargarMochilaUsuario(); },
      error: (err) => { this.adminQuitarMsg = '⚠️ ' + (err.error?.error ?? 'Error al quitar'); }
    });
  }

  descubrirXuxemon(): void {
    const body = { user_identificador: this.usuarioSeleccionado, xuxemon_id: Number(this.adminDescubrirId) };
    this.http.post<any>(`${this.apiUrl}/admin/xuxemons/anadir`, body, { headers: this.headers() }).subscribe({
      next: (res) => {
        this.adminXuxMsg = `✅ ` + res.message;
        this.cargarXuxemonsUsuario();
      },
      error: (err) => this.adminXuxMsg = `⚠️ Error: ${err.error?.message || 'Fallo'}`
    });
  }

  descubrirAleatorio(): void {
    const body = { user_identificador: this.usuarioSeleccionado };
    this.http.post<any>(`${this.apiUrl}/admin/xuxemons/aleatorio`, body, { headers: this.headers() }).subscribe({
      next: (res) => {
        this.adminXuxMsg = `✅ ` + res.message;
        this.cargarXuxemonsUsuario();
      },
      error: (err) => this.adminXuxMsg = `⚠️ Error: ${err.error?.error || 'Fallo'}`
    });
  }

  ocultarXuxemon(): void {
    const body = { user_identificador: this.usuarioSeleccionado, xuxemon_id: Number(this.adminDescubrirId) };
    this.http.post<any>(`${this.apiUrl}/admin/xuxemons/quitar`, body, { headers: this.headers() }).subscribe({
      next: (res) => {
        this.adminXuxMsg = `🔒 ` + res.message;
        this.cargarXuxemonsUsuario();
      },
      error: (err) => this.adminXuxMsg = `⚠️ Error: ${err.error?.message || 'Fallo'}`
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