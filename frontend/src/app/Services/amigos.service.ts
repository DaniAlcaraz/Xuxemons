import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../Services/auth.service';
export interface UsuarioBusqueda {
  identificador: string;
  nombre: string;
  apellidos: string;
}

export interface SolicitudRecibida {
  id: number;
  solicitante_id: string;
  solicitante: UsuarioBusqueda;
  created_at: string;
}

export interface Amigo {
  amistad_id: number;
  identificador: string;
  nombre: string;
  apellidos: string;
}

@Injectable({ providedIn: 'root' })
export class AmigosService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.obtenerToken()}` });
  }

  buscarUsuarios(q: string): Observable<UsuarioBusqueda[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<UsuarioBusqueda[]>(`${this.apiUrl}/amigos/buscar`, {
      headers: this.headers(), params
    });
  }

  enviarSolicitud(receptorId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/amigos/solicitud`, { receptor_id: receptorId }, {
      headers: this.headers()
    });
  }

  getSolicitudesRecibidas(): Observable<SolicitudRecibida[]> {
    return this.http.get<SolicitudRecibida[]>(`${this.apiUrl}/amigos/solicitudes`, {
      headers: this.headers()
    });
  }

  aceptarSolicitud(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/amigos/solicitud/${id}/aceptar`, {}, {
      headers: this.headers()
    });
  }

  rechazarSolicitud(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/amigos/solicitud/${id}/rechazar`, {}, {
      headers: this.headers()
    });
  }

  getAmigos(): Observable<Amigo[]> {
    return this.http.get<Amigo[]>(`${this.apiUrl}/amigos`, { headers: this.headers() });
  }

  eliminarAmigo(amistadId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/amigos/${amistadId}`, { headers: this.headers() });
  }
}