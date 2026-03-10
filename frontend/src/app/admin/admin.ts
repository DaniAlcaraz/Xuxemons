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

  // ── FORM AÑADIR/QUITAR ───────────────────────────────────────────────────────
  adminXuxeId = 0;
  adminXuxeQty = 1;
  adminXuxeMsg = '';
  adminVacunaId = 0;
  adminVacunaQty = 1;
  adminVacunaMsg = '';
  adminQuitarItemId = 0;
  adminQuitarQty = 1;
  adminQuitarMsg = '';

  // ── XUXEMONS (hardcoded por ahora) ───────────────────────────────────────────
  xuxemons: Xuxemon[] = [
    { id: 1,  nombre: 'Apleki',       tipo: 'Tierra', tamano: 'Pequeño', img: '🐌', discovered: true  },
    { id: 2,  nombre: 'Avecrem',      tipo: 'Aire',   tamano: 'Pequeño', img: '🐔', discovered: true  },
    { id: 3,  nombre: 'Bambino',      tipo: 'Tierra', tamano: 'Pequeño', img: '🦌', discovered: false },
    { id: 4,  nombre: 'Beeboo',       tipo: 'Aire',   tamano: 'Pequeño', img: '🐝', discovered: true  },
    { id: 5,  nombre: 'Boo-hoot',     tipo: 'Aire',   tamano: 'Mediano', img: '🦉', discovered: true  },
    { id: 6,  nombre: 'Cabrales',     tipo: 'Tierra', tamano: 'Mediano', img: '🐐', discovered: true  },
    { id: 7,  nombre: 'Catua',        tipo: 'Aire',   tamano: 'Pequeño', img: '🦜', discovered: true  },
    { id: 8,  nombre: 'Catyuska',     tipo: 'Aire',   tamano: 'Grande',  img: '🕊️', discovered: true  },
    { id: 9,  nombre: 'Chapapá',      tipo: 'Agua',   tamano: 'Pequeño', img: '🐸', discovered: true  },
    { id: 10, nombre: 'Chopper',      tipo: 'Tierra', tamano: 'Grande',  img: '🐱', discovered: true  },
    { id: 11, nombre: 'Cuellilargui', tipo: 'Tierra', tamano: 'Grande',  img: '🦕', discovered: false },
    { id: 12, nombre: 'Deskangoo',    tipo: 'Tierra', tamano: 'Mediano', img: '🦘', discovered: false },
    { id: 13, nombre: 'Doflamingo',   tipo: 'Aire',   tamano: 'Grande',  img: '🦩', discovered: false },
    { id: 14, nombre: 'Dolly',        tipo: 'Tierra', tamano: 'Pequeño', img: '🐑', discovered: false },
    { id: 15, nombre: 'Elconchudo',   tipo: 'Agua',   tamano: 'Mediano', img: '🦀', discovered: false },
    { id: 16, nombre: 'Eldientes',    tipo: 'Agua',   tamano: 'Grande',  img: '🦛', discovered: false },
    { id: 17, nombre: 'Elgominas',    tipo: 'Tierra', tamano: 'Pequeño', img: '🦔', discovered: false },
    { id: 18, nombre: 'Flipper',      tipo: 'Agua',   tamano: 'Mediano', img: '🐬', discovered: false },
    { id: 19, nombre: 'Floppi',       tipo: 'Tierra', tamano: 'Pequeño', img: '🐒', discovered: false },
    { id: 20, nombre: 'Horseluis',    tipo: 'Agua',   tamano: 'Grande',  img: '🦄', discovered: false },
    { id: 21, nombre: 'Krokolisko',   tipo: 'Agua',   tamano: 'Grande',  img: '🐊', discovered: false },
    { id: 22, nombre: 'Kurama',       tipo: 'Tierra', tamano: 'Mediano', img: '🦊', discovered: false },
    { id: 23, nombre: 'Ladybug',      tipo: 'Aire',   tamano: 'Pequeño', img: '🐞', discovered: false },
    { id: 24, nombre: 'Lengualargui', tipo: 'Tierra', tamano: 'Mediano', img: '🦎', discovered: false },
    { id: 25, nombre: 'Medusation',   tipo: 'Agua',   tamano: 'Mediano', img: '🪼', discovered: false },
    { id: 26, nombre: 'Meekmeek',     tipo: 'Tierra', tamano: 'Pequeño', img: '🐭', discovered: false },
    { id: 27, nombre: 'Megalo',       tipo: 'Agua',   tamano: 'Grande',  img: '🦈', discovered: false },
    { id: 28, nombre: 'Mocha',        tipo: 'Agua',   tamano: 'Grande',  img: '🐳', discovered: false },
    { id: 29, nombre: 'Murcimurci',   tipo: 'Aire',   tamano: 'Pequeño', img: '🦇', discovered: false },
    { id: 30, nombre: 'Nemo',         tipo: 'Agua',   tamano: 'Pequeño', img: '🐠', discovered: false },
    { id: 31, nombre: 'Oinkcelot',    tipo: 'Tierra', tamano: 'Mediano', img: '🐷', discovered: false },
    { id: 32, nombre: 'Oreo',         tipo: 'Tierra', tamano: 'Grande',  img: '🐄', discovered: false },
    { id: 33, nombre: 'Otto',         tipo: 'Tierra', tamano: 'Pequeño', img: '🦦', discovered: false },
    { id: 34, nombre: 'Pinchimott',   tipo: 'Agua',   tamano: 'Pequeño', img: '🦀', discovered: false },
    { id: 35, nombre: 'Pollis',       tipo: 'Aire',   tamano: 'Pequeño', img: '🐣', discovered: false },
    { id: 36, nombre: 'Posón',        tipo: 'Aire',   tamano: 'Mediano', img: '🦋', discovered: false },
    { id: 37, nombre: 'Quakko',       tipo: 'Agua',   tamano: 'Pequeño', img: '🦆', discovered: false },
    { id: 38, nombre: 'Rajoy',        tipo: 'Aire',   tamano: 'Mediano', img: '🕊️', discovered: false },
    { id: 39, nombre: 'Rawlion',      tipo: 'Tierra', tamano: 'Grande',  img: '🦁', discovered: false },
    { id: 40, nombre: 'Rexxo',        tipo: 'Tierra', tamano: 'Grande',  img: '🦖', discovered: false },
    { id: 41, nombre: 'Ron',          tipo: 'Tierra', tamano: 'Pequeño', img: '🐈', discovered: false },
    { id: 42, nombre: 'Sesssi',       tipo: 'Tierra', tamano: 'Mediano', img: '🐍', discovered: false },
    { id: 43, nombre: 'Shelly',       tipo: 'Agua',   tamano: 'Pequeño', img: '🐢', discovered: false },
    { id: 44, nombre: 'Sirucco',      tipo: 'Aire',   tamano: 'Grande',  img: '🦄', discovered: false },
    { id: 45, nombre: 'Torcas',       tipo: 'Agua',   tamano: 'Mediano', img: '🦫', discovered: false },
    { id: 46, nombre: 'Trompeta',     tipo: 'Aire',   tamano: 'Pequeño', img: '🐦', discovered: false },
    { id: 47, nombre: 'Trompi',       tipo: 'Tierra', tamano: 'Grande',  img: '🐘', discovered: false },
    { id: 48, nombre: 'Tux',          tipo: 'Agua',   tamano: 'Mediano', img: '🐧', discovered: false },
  ];

  adminDescubrirId = 3;
  adminXuxMsg = '';
  get totalXuxemons()  { return this.xuxemons.length; }
  get descubiertos()   { return this.xuxemons.filter(x => x.discovered).length; }
  get noDescubiertos() { return this.xuxemons.filter(x => !x.discovered).length; }
  get porcentajeDesc() { return (this.descubiertos / this.totalXuxemons) * 100; }
  get xuxDescubiertos(){ return this.xuxemons.filter(x => x.discovered); }
  get xuxOcultos()     { return this.xuxemons.filter(x => !x.discovered); }

  constructor(private mochilaService: MochilaService, private authService: AuthService, private http: HttpClient) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.obtenerToken()}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

    ngOnInit(): void {
      console.log('TOKEN:', this.authService.obtenerToken());
      this.cargarUsuarios();
      this.cargarItems();
    }
    
  cargarUsuarios(): void {
    this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, { headers: this.headers() }).subscribe({
      next: (data) => {
        this.usuarios = data;
        if (data.length > 0) {
          this.usuarioSeleccionado = data[0].identificador;
          this.cargarMochilaUsuario();
        }
      }
    });
  }
    cargarItems(): void {
      this.http.get<any[]>(`${this.apiUrl}/items`, { headers: this.headers() }).subscribe({
        next: (data) => {
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
  }

  cargarMochilaUsuario(): void {
    if (!this.usuarioSeleccionado) return;
    this.http.get<any[]>(`${this.apiUrl}/admin/mochila/${this.usuarioSeleccionado}`, { headers: this.headers() }).subscribe({
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

  getEmoji(nombre: string): string { return EMOJIS[nombre] ?? '📦'; }

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
    const x = this.xuxemons.find(x => x.id === Number(this.adminDescubrirId));
    if (!x || x.discovered) { this.adminXuxMsg = x ? `⚠️ ${x.nombre} ya descubierto.` : '⚠️ No encontrado.'; return; }
    x.discovered = true;
    this.adminXuxMsg = `✅ ¡${x.img} ${x.nombre} descubierto!`;
  }

  descubrirAleatorio(): void {
    const pool = this.xuxOcultos;
    if (!pool.length) { this.adminXuxMsg = '⚠️ ¡Todos descubiertos!'; return; }
    const r = pool[Math.floor(Math.random() * pool.length)];
    r.discovered = true;
    this.adminXuxMsg = `✅ ¡${r.img} ${r.nombre} descubierto!`;
  }

  ocultarXuxemon(): void {
    const x = this.xuxemons.find(x => x.id === Number(this.adminDescubrirId));
    if (!x || !x.discovered) { this.adminXuxMsg = x ? `⚠️ ${x.nombre} ya oculto.` : '⚠️ No encontrado.'; return; }
    x.discovered = false;
    this.adminXuxMsg = `🔒 ${x.img} ${x.nombre} ocultado.`;
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