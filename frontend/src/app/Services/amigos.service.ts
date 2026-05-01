// Importación del decorador Injectable para marcar la clase como un servicio inyectable en Angular
import { Injectable } from '@angular/core';
// Importación de HttpClient para realizar peticiones HTTP, HttpHeaders para las cabeceras y HttpParams para parámetros de consulta
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
// Para manejar respuestas asincronas
import { Observable } from 'rxjs';
// Servicio de autenticación personalizado para obtener el token JWT
import { AuthService } from '../Services/auth.service';
export interface UsuarioBusqueda {
  identificador: string;
  nombre: string;
  apellidos: string;
}

// Interfaz que define la estructura de una solicitud de amistad recibida
export interface SolicitudRecibida {
  id: number;
  solicitante_id: string;
  solicitante: UsuarioBusqueda;
  created_at: string;
}

// Interfaz que define la estructura de un amigo confirmado
export interface Amigo {
  amistad_id: number;
  identificador: string;
  nombre: string;
  apellidos: string;
}

// Decorador que hace que este servicio esté disponible en toda la aplicación como singleton
@Injectable({ providedIn: 'root' })
export class AmigosService {
  // URL base de la API del backend
  private apiUrl = 'http://localhost:8000/api';

  // Inyecta HttpClient para peticiones HTTP y AuthService para autenticación
  constructor(private http: HttpClient, private auth: AuthService) {}

  /*
   * Método privado auxiliar que genera las cabeceras HTTP con el token de autenticación
   * @returns HttpHeaders con la autorización Bearer
   */
  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.obtenerToken()}` });
  }

  /*
   * Busca usuarios por un término de búsqueda
   * @param q - Término de búsqueda (nombre, apellido o identificador)
   * @returns Observable que emite un array de usuarios encontrados
   */
  buscarUsuarios(q: string): Observable<UsuarioBusqueda[]> {
    const params = new HttpParams().set('q', q); // Crea los parámetros de consulta con el término de búsqueda
    return this.http.get<UsuarioBusqueda[]>(`${this.apiUrl}/amigos/buscar`, { // Realiza petición GET a /api/amigos/buscar?q=...
      headers: this.headers(), // Incluye token de autenticación
      params // Incluye el parámetro de búsqueda
    });
  }

  /*
   * Envía una solicitud de amistad a un usuario
   * @param receptorId - Identificador del usuario que recibirá la solicitud
   * @returns Observable con la respuesta del servidor
   */
  enviarSolicitud(receptorId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/amigos/solicitud`, { receptor_id: receptorId }, { // Realiza petición POST a /api/amigos/solicitud enviando el ID del receptor en el cuerpo
      headers: this.headers() // Incluye token de autenticación
    });
  }

  /*
   * Obtiene todas las solicitudes de amistad pendientes recibidas por el usuario actual
   * @returns Observable que emite un array de solicitudes recibidas
   */
  getSolicitudesRecibidas(): Observable<SolicitudRecibida[]> {
    return this.http.get<SolicitudRecibida[]>(`${this.apiUrl}/amigos/solicitudes`, {
      headers: this.headers()
    });
  }

  /*
   * Acepta una solicitud de amistad específica
   * @param id - ID de la solicitud a aceptar
   * @returns Observable con la respuesta del servidor
   */
  aceptarSolicitud(id: number): Observable<any> {  // Realiza petición POST a /api/amigos/solicitud/{id}/aceptar
    return this.http.post(`${this.apiUrl}/amigos/solicitud/${id}/aceptar`, 
      {}, // Cuerpo vacío
      { headers: this.headers() // Incluye token de autenticación
    });
  }

  /*
   * Rechaza una solicitud de amistad específica
   * @param id - ID de la solicitud a rechazar
   * @returns Observable con la respuesta del servidor
   */
  rechazarSolicitud(id: number): Observable<any> { // Realiza petición POST a /api/amigos/solicitud/{id}/rechazar
    return this.http.post(`${this.apiUrl}/amigos/solicitud/${id}/rechazar`, {}, {
      headers: this.headers() // Incluye token de autenticación
    });
  }

  /*
   * Obtiene la lista de amigos del usuario actual
   * @returns Observable que emite un array de amigos
   */
  getAmigos(): Observable<Amigo[]> {
    return this.http.get<Amigo[]>(`${this.apiUrl}/amigos`, // Realiza petición GET a /api/amigos
      { headers: this.headers() }); // Incluye token de autenticación
  }

  /* 
   * Elimina un amigo de la lista del usuario actual
   * @param amistadId - ID de la relación de amistad a eliminar
   * @returns Observable con la respuesta del servidor
   */
  eliminarAmigo(amistadId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/amigos/${amistadId}`, // Realiza petición DELETE a /api/amigos/{amistadId}
      { headers: this.headers() }); 
  }
}