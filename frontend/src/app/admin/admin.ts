//Decoradores y utilidades
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // ngModel para formularios
import { CommonModule } from '@angular/common';  // Directivas comunes (@for, @if ...)

//Servicios
import { MochilaService } from '../Services/mochila'; //Importancion y gestion de mochila
import { AuthService } from '../Services/auth.service'; // Autenticacion y token JWT

// Cliente HTTP para peticiones a la API
import { HttpClient, HttpHeaders } from '@angular/common/http';

// Utilidades RxJS para combinar observables
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Tipos de rareza disponibles para los items */
export type Rareza = 'común' | 'raro' | 'épico' | 'legendario';

/** Tipos elementales de los Xuxemons */
export type TipoXuxemon = 'Tierra' | 'Aire' | 'Agua';

/** Tamaños posibles de los Xuxemons */
export type TamanoXuxemon = 'Pequeño' | 'Mediano' | 'Grande';

/** Estructura de un item devuelto por la API */
export interface ItemAPI { id: number; nombre: string; tipo: string; descripcion: string; rareza: Rareza; }

/** Estructura de un usuario devuelto por la API */
export interface Usuario { identificador: string; nombre: string; apellidos: string; email: string; rol: string; }

/** Estructura de un Xuxemon en el panel de administración */
export interface Xuxemon {
  IDxuxemon: number; nombre: string; tipo: TipoXuxemon;
  tamano: TamanoXuxemon; img: string; discovered: boolean;
  enfermo: boolean;        
  enfermedad: string | null;
}

/** Estructura de los elementos de navegación de la barra inferior */
interface NavItem { icon: string; label: string; route: string; }

/**
 * Asigna un emoji a cada item y xuxemon según su nombre
 * Se usa para mostrar imágenes visuales en lugar de URLs de imágenes
 */
const EMOJIS: Record<string, string> = {
  'Xuxe Roja': '🔴', 'Xuxe Azul': '🔵', 'Xuxe Dorada': '🟡',
  'Chocolatina': '🍫', 'Mermelada de frutas': '🍓', 'Insulina': '💉',

  'Apleki': '🐌', 'Avecrem': '🐔', 'Bambino': '🦌',
  'Beeboo': '🐝', 'Boo-hoot': '🦉', 'Cabrales': '🐐',
  'Catua': '🦜', 'Catyuska': '🦢', 'Chapapá': '🐸',
  'Chopper': '🐱', 'Cuellilargui': '🦕', 'Deskangoo': '🦘',
  'Doflamingo': '🦩', 'Dolly': '🐑', 'Elconchudo': '🦀',
  'Eldientes': '🦛', 'Elgominas': '🦔', 'Flipper': '🐬',
  'Floppi': '🐒', 'Horseluis': '🦄', 'Krokolisko': '🐊',
  'Kurama': '🦊', 'Ladybug': '🐞', 'Lengualargui': '🦎',
  'Medusation': '🐟', 'Meekmeek': '🐭', 'Megalo': '🦈',
  'Mocha': '🐳', 'Murcimurci': '🦇', 'Nemo': '🐠',
  'Oinkcelot': '🐷', 'Oreo': '🐄', 'Otto': '🦦',
  'Pinchimott': '🦀', 'Pollis': '🐣', 'Posón': '🦋',
  'Quakko': '🦆', 'Rajoy': '🕊️', 'Rawlion': '🦁',
  'Rexxo': '🦖', 'Ron': '🐈', 'Sesssi': '🐍',
  'Shelly': '🐢', 'Sirucco': '🦅', 'Torcas': '🦒',
  'Trompeta': '🐦', 'Trompi': '🐘', 'Tux': '🐧',
};

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})

  // ──────────────────────────────────────────────────────────────────────────
  // ESTADO DE LA INTERFAZ
  // ──────────────────────────────────────────────────────────────────────────

export class Admin implements OnInit {

  //Pestaña activa en el panel: 'mochila' (gestión de items) o 'xuxemons' (gestión de criaturas)
  activeTab: 'mochila' | 'xuxemons' = 'mochila';

  //URL base del backend/API
  private apiUrl = 'http://localhost:8000/api';

  // ──────────────────────────────────────────────────────────────────────────
  // DATOS DE USUARIOS
  // ──────────────────────────────────────────────────────────────────────────

  // Lista de todos los usuarios del sistema
  usuarios: Usuario[] = [];

  // Identificador del usuario actualmente seleccionado en el desplegable
  usuarioSeleccionado = '';

  // ──────────────────────────────────────────────────────────────────────────
  // DATOS DE ITEMS
  // ──────────────────────────────────────────────────────────────────────────

  //Lista completa de items disponibles en el sistema
  itemsAPI: ItemAPI[] = [];

  // Items de tipo xuxe (apilables) filtrados de itemsAPI
  itemsApilablesAPI: ItemAPI[] = [];

  // Items de tipo vacuna (simples) filtrados de itemsAPI
  itemsSimplesAPI: ItemAPI[] = [];

  // ──────────────────────────────────────────────────────────────────────────
  // ESTADO DE LA MOCHILA DEL USUARIO SELECCIONADO
  // ──────────────────────────────────────────────────────────────────────────

  // Contenido actual de la mochila del usuario (items + xuxemons)
  mochilaUsuario: any[] = [];

  // IDs de los Xuxemons que posee el usuario seleccionado
  userXuxemonIds: number[] = [];

  // Espacios usados en la mochila del usuario
  espaciosUsadosUsuario = 0;

  //Porcentaje de llenado de la mochila (0-100)
  porcentajeMochilaUsuario = 0;

  //Indica si la mochila del usuario está completamente llena
  mochilaLlenaUsuario = false;

  // ──────────────────────────────────────────────────────────────────────────
  // FORMULARIOS DE GESTIÓN DE ITEMS
  // ──────────────────────────────────────────────────────────────────────────

  //Añadir Xuxes (items apilables)
  adminXuxeId = 0; // ID del item Xuxe a añadir
  adminXuxeQty = 1; // Cantidad a añadir
  adminXuxeMsg = ''; // Mensaje de feedback (éxito/error)

  //Añadir Vacunas (items simples)
  adminVacunaId = 0; // ID del item vacuna a añadir
  adminVacunaQty = 1; // Cantidad a añadir
  adminVacunaMsg = ''; // Mensaje de feedback

  //Quitar items
  adminQuitarItemId = 0; // ID del item a quitar
  adminQuitarQty = 1; // Cantidad a quitar
  adminQuitarMsg = ''; // Mensaje de feedback

  // ──────────────────────────────────────────────────────────────────────────
  // CONFIGURACIÓN DE XUXES DIARIOS
  // ──────────────────────────────────────────────────────────────────────────

  /** Si el reparto automático de Xuxes diarios está activo */
  adminXuxesDiariosActivo = true;
  
  /** Hora programada para el reparto diario (formato HH:MM) */
  adminXuxesDiariosHora = '09:00';

    /** Cantidad de Xuxes a repartir diariamente */
  adminXuxesDiariosCantidad = 5;

  /** Cantidad de Xuxes a repartir diariamente */
  adminXuxesDiariosMsg = '';

  // ──────────────────────────────────────────────────────────────────────────
  // CONFIGURACIÓN DE XUXEMONS DIARIOS
  // ──────────────────────────────────────────────────────────────────────────

  /** Mensaje de feedback al guardar configuración */
  adminXuxemonsDiariosActivo = true;

  /** Hora programada para el descubrimiento diario */
  adminXuxemonsDiariosHora = '09:00';

  /** Mensaje de feedback al guardar configuración */
  adminXuxemonsDiariosMsg = '';


  // ──────────────────────────────────────────────────────────────────────────
  // CONFIGURACIÓN GLOBAL DE EVOLUCIÓN
  // ──────────────────────────────────────────────────────────────────────────

  /** Puntos/Xuxes necesarios para evolucionar de Pequeño a Mediano */
  configPequenoMediano = 3;

  /** Puntos/Xuxes necesarios para evolucionar de Mediano a Grande */
  configMedianoGrande  = 5;

  /** Mensaje de feedback al guardar configuración */
  adminConfigMsg       = '';

  // ──────────────────────────────────────────────────────────────────────────
  // ENFERMEDADES
  // ──────────────────────────────────────────────────────────────────────────

  /** ID del Xuxemon a enfermar */
  adminEnfermarXuxId = 0;

  /** Tipo de enfermedad a aplicar (ej: "Bajón de azúcar") */
  adminEnfermedad    = 'Bajón de azúcar';

  /** Mensaje de feedback al enfermar/curar */
  adminEnfermarMsg   = '';

  // ──────────────────────────────────────────────────────────────────────────
  // GESTIÓN DE XUXEMONS (DESCUBRIR/OCULTAR)
  // ──────────────────────────────────────────────────────────────────────────
  
  /** Lista completa de todos los Xuxemons existentes en el sistema */
  xuxemons: Xuxemon[] = [];

  /** ID del Xuxemon seleccionado para descubrir/ocultar */
  adminDescubrirId = 0;

  /** Mensaje de feedback para operaciones de Xuxemons */
  adminXuxMsg = '';

  // ========================================================================
  // CONSTRUCTOR
  // ========================================================================

  /**
   * Inyecta los servicios necesarios para el panel de administración
   * 
   * @param mochilaService - Servicio para operaciones CRUD de mochila
   * @param authService - Servicio de autenticación (token, sesión)
   * @param http - Cliente HTTP para peticiones directas a la API
   * @param cdr - Detector de cambios manual para actualizar la vista
   * @param router - Router para navegación y redirecciones
   */
  constructor(
    private mochilaService: MochilaService,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  // ========================================================================
  // MÉTODOS DE UTILIDAD
  // ========================================================================

  /**
   * Genera las cabeceras HTTP estándar para todas las peticiones
   * Incluye el token JWT de autorización y los tipos de contenido aceptados
   * 
   * @returns HttpHeaders configuradas con autenticación
   */
  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.obtenerToken()}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  // ========================================================================
  // CICLO DE VIDA, TOKEN
  // ========================================================================
  
  /**
   * Inicialización del componente
   * - Verifica que el usuario esté autenticado
   * - Carga los datos iniciales (usuarios, items, xuxemons, configuración)
   */
  ngOnInit(): void {
    // Si no hay token, redirige al login (seguridad)
    if (!this.authService.obtenerToken()) {
      this.router.navigate(['/login']);
      return;
    }
     // Carga inicial de datos
    this.cargarUsuarios();
    this.cargarItems();
    this.cargarXuxemons();
    this.cargarConfigXuxes();
  }

  /**
   * Maneja errores de autorización 401
   * Si el token expiró o es invalido, cierra sesión y redirige al login
   * 
   * @param err - Objeto de error de la petición HTTP
   * @returns true si se manejó un error 401, false en otro caso
   */
  private manejarUnauthorized(err: any): boolean {
    if (err?.status === 401) {
      this.authService.cerrarSesion(); // Limpia datos de sesión
      this.router.navigate(['/login']); // Redirige al login
      return true; // Indica que se manejó el error
    }
    return false; // No era error 401
  }

  // ========================================================================
  // CARGA DE DATOS
  // ========================================================================

  /**
   * Obtiene la lista de todos los usuarios del sistema
   * Al cargar, selecciona automáticamente el primer usuario
   */
  cargarUsuarios(): void {
    this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, // Endpoint: GET /api/usuarios
      { headers: this.headers() } // Cabeceras con autenticación
    ).subscribe({
      next: (data) => {
        this.usuarios = data; // Almacena la lista
        // Selecciona automáticamente el primer usuario si hay datos
        if (data.length > 0) {
          this.usuarioSeleccionado = data[0].identificador;
          this.onUsuarioChange(); // Carga sus datos asociados
        }

        this.cdr.detectChanges(); // Actualiza la vista
      }
      ,
      error: (err) => {
        this.manejarUnauthorized(err); // Maneja posible 401
      }
    });
  }

  /**
   * Obtiene todos los items disponibles en el sistema
   * Los clasifica en apilables (xuxes) y simples (vacunas)
   */
  cargarItems(): void {
    this.http.get<any[]>(`${this.apiUrl}/items`, // Endpoint: GET /api/items
      { headers: this.headers() }).subscribe({
      next: (data) => {
        this.itemsAPI = data; // Todos los items

        // Filtra por tipo para los formularios
        this.itemsApilablesAPI = data.filter(i => i.tipo === 'xuxe'); // Items apilables
        this.itemsSimplesAPI   = data.filter(i => i.tipo === 'vacuna'); // Items simples

        // Inicializa los selectores con el primer item de cada tipo
        if (this.itemsApilablesAPI.length) this.adminXuxeId       = this.itemsApilablesAPI[0].id;
        if (this.itemsSimplesAPI.length)   this.adminVacunaId     = this.itemsSimplesAPI[0].id;
        if (this.itemsAPI.length)          this.adminQuitarItemId = this.itemsAPI[0].id;

        this.cdr.detectChanges();
      },
      error: (err) => {
        if (!this.manejarUnauthorized(err)) {
          this.adminXuxeMsg = '⚠️ Error cargando ítems.'; // Mensaje de error no 401
        }
      }
    });
  }

  /**
   * Manejador del evento de cambio de usuario en el desplegable
   * Recarga las configuraciones y datos del nuevo usuario seleccionado
   */
  onUsuarioChange(): void {
    this.cargarConfigXuxesDiarios(); // Configuración de Xuxes diarios
    this.cargarConfigXuxemonsDiarios(); // Configuración de Xuxemons diarios
    this.refrescarTodo();  // Mochila + Xuxemons del usuario
  }

  /**
   * Refresca todos los datos del usuario seleccionado
   * Carga mochila y Xuxemons en paralelo
   */
  refrescarTodo(): void {
    this.cargarMochilaUsuario(); // Items en mochila
    this.cargarXuxemonsUsuario(); // Xuxemons descubiertos
  }

  /**
   * Obtiene la lista completa de Xuxemons del sistema
   * Mapea los datos incluyendo el estado de enfermedad
   */
  cargarXuxemons(): void {
    this.http.get<any[]>(`${this.apiUrl}/xuxemons`, // Endpoint: GET /api/xuxemons
      { headers: this.headers() }
    ).subscribe({
      next: (data) => {
        // Mapea los Xuxemons incluyendo campos de enfermedad
        this.xuxemons = data.map(x => ({
          ...x,
          enfermo:    x.enfermo    ?? false, // false por defecto
          enfermedad: x.enfermedad ?? null, // null por defecto
        }));

        // Inicializa el selector con el primer Xuxemon
        if (data.length > 0) this.adminDescubrirId = data[0].IDxuxemon;

        this.cdr.detectChanges();
      }
      ,
      error: (err) => {
        this.manejarUnauthorized(err);
      }
    });
  }

  /**
   * Obtiene los Xuxemons que posee el usuario seleccionado
   * Actualiza la lista de IDs y el estado de enfermedad de cada uno
   */
  cargarXuxemonsUsuario(): void {
    if (!this.usuarioSeleccionado) return; // No hay usuario seleccionado
    const userId = encodeURIComponent(this.usuarioSeleccionado); // Codifica para URL
    
    this.http.get<any[]>(`${this.apiUrl}/admin/usuarios/${userId}/xuxemons`, // Endpoint específico del usuario
      { headers: this.headers() }).subscribe({
      next: (data) => {
        // Extrae los IDs de los Xuxemons del usuario
        this.userXuxemonIds = data.map(x => Number(x.IDxuxemon));

        // Inicializa el selector de enfermar con el primer Xuxemon
        if (data.length > 0) this.adminEnfermarXuxId = data[0].IDxuxemon;
        
        // Actualiza el estado de enfermedad en la lista global
        data.forEach(x => {
          const found = this.xuxemons.find(xux => xux.IDxuxemon === Number(x.IDxuxemon));
          if (found) {
            found.enfermo    = x.pivot?.enfermo    ?? false; // Estado de enfermedad
            found.enfermedad = x.pivot?.enfermedad ?? null; // Tipo de enfermedad
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

  /**
   * Carga la mochila del usuario seleccionado
   * Combina items normales + Xuxemons en una sola vista
   * Usa forkJoin para hacer las peticiones en paralelo
   */
  cargarMochilaUsuario(): void {
    if (!this.usuarioSeleccionado) return;
    const id = encodeURIComponent(this.usuarioSeleccionado);

    // Petición 1: Items de la mochila
    const obsMochila = this.http.get<any[]>(`${this.apiUrl}/admin/mochila?user=${id}`, { headers: this.headers() });
    
    // Petición 2: Xuxemons del usuario (con manejo de error para no bloquear)
    const obsXuxemons = this.http.get<any[]>(
      `${this.apiUrl}/admin/usuarios/${id}/xuxemons`,
      { headers: this.headers() }
    ).pipe(catchError(() => of([]))); // Si falla, devuelve array vacío

    // Ejecuta ambas peticiones en paralelo
    forkJoin({ items: obsMochila, xuxemons: obsXuxemons }).subscribe({
      next: (res) => {
        // Mapea items normales al formato unificado
        const itemEntries = res.items.map(e => ({
          id: e.id,
          cantidad: e.cantidad,
          item: e.item
        }));

        // Mapea Xuxemons al mismo formato para mostrarlos juntos
        const xuxEntries = res.xuxemons.map((x: any) => ({
          id: x.IDxuxemon,
          cantidad: 1, // Cada Xuxemon ocupa 1 espacio
          item: {
            id: x.IDxuxemon,
            nombre: x.nombre,
            tipo: 'xuxemon', // Tipo especial para distinguirlos
            rareza: 'común',
            descripcion: `Xuxemon de tipo ${x.tipo}`
          }
        }));
        this.mochilaUsuario = [...itemEntries, ...xuxEntries]; // Combina items + xuxemons en la vista de mochila
        this.calcularEspacios(this.mochilaUsuario); // Calcula espacios usados
      },
      error: () => {
        // En caso de error, resetea la mochila
        this.mochilaUsuario = [];
        this.espaciosUsadosUsuario = 0;
        this.cdr.detectChanges();
      }
    });
  }

  //Carga la configuración de Xuxes diarios del usuario seleccionado
  cargarConfigXuxesDiarios(): void {
    if (!this.usuarioSeleccionado) return;

    const userId = encodeURIComponent(this.usuarioSeleccionado);

    this.http.get<any>(`${this.apiUrl}/admin/usuarios/${userId}/xuxes-diarios`, { headers: this.headers() }).subscribe({
      next: (config) => {
        this.adminXuxesDiariosActivo = !!config.activo; // Convierte a booleano
        this.adminXuxesDiariosHora = config.hora || '09:00'; // Hora por defecto
        this.adminXuxesDiariosCantidad = Number(config.cantidad ?? 5); // Cantidad por defecto
        this.cdr.detectChanges();
      },
      error: () => {
        this.adminXuxesDiariosMsg = '⚠️ No se pudo cargar la configuración diaria.';
        this.cdr.detectChanges();
      }
    });
  }

  cargarConfigXuxemonsDiarios(): void {
    if (!this.usuarioSeleccionado) return;
    const userId = encodeURIComponent(this.usuarioSeleccionado);
    this.http.get<any>(`${this.apiUrl}/admin/usuarios/${userId}/xuxemons-diarios`, { headers: this.headers() }).subscribe({
      next: (config) => {
        this.adminXuxemonsDiariosActivo = !!config.activo;
        this.adminXuxemonsDiariosHora = config.hora || '09:00';
        this.cdr.detectChanges();
      },
      error: () => {
        this.adminXuxemonsDiariosMsg = '⚠️ No se pudo cargar la configuración diaria.';
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Calcula los espacios usados en la mochila del usuario
   * Solo considera items (xuxes y vacunas), no Xuxemons
   * 
   * Reglas:
   * - Items apilables (xuxes): cada 5 unidades ocupan 1 espacio
   * - Items simples (vacunas): cada unidad ocupa 1 espacio
   * - Maximo de espacios: 20
   * 
   * @param mochila - Array con el contenido de la mochila
   */
  calcularEspacios(mochila: any[]): void {

    // Filtra solo items (excluye Xuxemons)
    const soloItems = mochila.filter(m => m.item.tipo === 'xuxe' || m.item.tipo === 'vacuna');
    
    // Calcula espacios según el tipo de item
    this.espaciosUsadosUsuario = soloItems.reduce((total, m) => {
      return total + (m.item.tipo === 'xuxe' 
        ? Math.ceil(m.cantidad / 5) // Xuxes: 5 por stack, redondea arriba
        : m.cantidad);  // Vacunas: 1 espacio cada una
    }, 0);

    // Calcula métricas derivadas
    this.porcentajeMochilaUsuario = (this.espaciosUsadosUsuario / 20) * 100;
    this.mochilaLlenaUsuario = this.espaciosUsadosUsuario >= 20;
    this.cdr.detectChanges();
  }

  /**
   * Carga la configuración global de evolución de Xuxemons
   * Define cuántos puntos/Xuxes se necesitan para evolucionar entre tamaños
   */
  cargarConfigXuxes(): void {
    this.http.get<any>(`${this.apiUrl}/configuracion/xuxes`, { headers: this.headers() }).subscribe({
      next: (data) => {
        this.configPequenoMediano = data.xuxes_pequeno_a_mediano;
        this.configMedianoGrande  = data.xuxes_mediano_a_grande;
        this.cdr.detectChanges();
      }
    });
  }

  // ========================================================================
  // OPERACIONES DE CONFIGURACIÓN
  // ========================================================================

  /**
   * Guarda la configuración global de evolución
   * Establece los puntos necesarios para cada tipo de evolución
   */
  guardarConfigXuxes(): void {
    this.adminConfigMsg = ''; // Limpia mensaje anterior
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

  // ========================================================================
  // GETTERS PARA LA VISTA
  // ========================================================================

  /** Número total de Xuxemons existentes en el sistema */
  get totalXuxemons(): number { return this.xuxemons.length; }

  /** Número de Xuxemons descubiertos por el usuario seleccionado */
  get descubiertos(): number { return this.userXuxemonIds.length; }

  /** Número de Xuxemons que el usuario aún no ha descubierto */
  get noDescubiertos(): number { return this.totalXuxemons - this.descubiertos; }

  /** Porcentaje de Xuxedex completado por el usuario */
  get porcentajeDesc(): number { return this.totalXuxemons > 0 ? (this.descubiertos / this.totalXuxemons) * 100 : 0; }

  // ========================================================================
  // METODOS AUXILIARES
  // ========================================================================

  /**
   * Verifica si un Xuxemon específico ha sido descubierto por el usuario
   * 
   * @param idXuxemon - ID del Xuxemon a verificar
   * @returns true si el Xuxemon está en la colección del usuario
   */
  isDiscovered(idXuxemon: number): boolean {
    return this.userXuxemonIds.includes(Number(idXuxemon));
  }

  /**
   * Obtiene el emoji correspondiente a un nombre de item o xuxemon
   * Si no encuentra coincidencia, devuelve 📦
   * 
   * @param nombre - Nombre del item/Xuxemon
   * @returns Emoji representativo
   */
  getEmoji(nombre: string): string { return EMOJIS[nombre] ?? '📦'; }

  // ========================================================================
  // OPERACIONES DE MOCHILA (ITEMS)
  // ========================================================================

  /**
   * Añade Xuxes (items apilables) a la mochila del usuario seleccionado
   * Usa el servicio MochilaService para la operación
   */
  anadirXuxes(): void {
    this.adminXuxeMsg = ''; // Limpia mensaje anterior
    this.mochilaService.anadir(this.usuarioSeleccionado, this.adminXuxeId, this.adminXuxeQty).subscribe({ //Usuario destino, ID xuxe y cantidad a añadir
      next: (res) => {
        this.adminXuxeMsg = '✅ ' + res.message;
        this.adminXuxeQty = 1; // Resetea cantidad a 1
        this.cargarMochilaUsuario(); //Recaraga vista
      },
      error: (err) => {
        this.adminXuxeMsg = '⚠️ ' + (err.error?.error ?? 'Error al añadir');
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Añade Vacunas (items simples) a la mochila del usuario seleccionado
   */
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

  /**
   * Quita items de la mochila del usuario seleccionado
   * Puede ser cualquier tipo de item (xuxe o vacuna)
   */
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

  // ========================================================================
  // OPERACIONES DE XUXEMONS
  // ========================================================================

  /**
   * Descubre un xuxemon específico para el usuario seleccionado
   * Lo añade a su colección/Xuxedex
   */
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

  /**
   * Descubre un Xuxemon aleatorio para el usuario seleccionado
   * El servidor elige uno que el usuario aún no tenga
   */
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

  /**
   * Oculta/quita un Xuxemon de la colección del usuario seleccionado
   * Lo elimina de su Xuxedex
   */
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

  // ========================================================================
  // GESTIÓN DE ENFERMEDADES ← SECCIÓN AÑADIDA
  // =======================================================================

  /**
   * Aplica una enfermedad a un Xuxemon del usuario seleccionado
   * Útil para testing o para simular eventos del juego
   */
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
        this.refrescarTodo(); // Actualiza para reflejar el cambio
      },
      error: (err) => {
        this.adminEnfermarMsg = '⚠️ ' + (err.error?.error || 'Error al enfermar');
        this.cdr.detectChanges();
      }
    });
  }

  // ========================================================================
  // CONFIGURACIONES DIARIAS
  // ========================================================================

  /**
   * Guarda la configuración de reparto diario de Xuxes para el usuario
   * Controla si está activo, a qué hora y qué cantidad se reparte
   */
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

  /**
   * Guarda la configuración de descubrimiento diario de Xuxemons
   * Controla si está activo y a qué hora se realiza
   */
  guardarXuxemonsDiarios(): void {
    if (!this.usuarioSeleccionado) return;
    this.adminXuxemonsDiariosMsg = '⏳ Guardando...';
    const userId = encodeURIComponent(this.usuarioSeleccionado);
    const body = {
      activo: this.adminXuxemonsDiariosActivo,
      hora: this.adminXuxemonsDiariosHora,
    };
    this.http.put<any>(`${this.apiUrl}/admin/usuarios/${userId}/xuxemons-diarios`, body, { headers: this.headers() }).subscribe({
      next: (res) => {
        this.adminXuxemonsDiariosMsg = '✅ ' + (res.message || 'Configuración guardada.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.adminXuxemonsDiariosMsg = '⚠️ ' + (err.error?.message || 'No se pudo guardar la configuración.');
        this.cdr.detectChanges();
      }
    });
  }

  // ========================================================================
  // ELEMENTOS DE NAVEGACIÓN
  // ========================================================================

  /**
   * Array de elementos para la barra de navegación inferior
   * Define los botones con sus iconos, etiquetas y rutas
   */
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