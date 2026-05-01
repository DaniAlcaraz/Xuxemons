import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/* @Injectable hace que este servicio esté disponible en toda la aplicación
 * sin necesidad de declararlo en cada componente
 */
@Injectable({ providedIn: 'root' })
export class MochilaService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  /* Genera las cabeceras HTTP con el token JWT del usuario
   * Se usa en todas las peticiones para que Laravel pueda autenticar al usuario
   */
  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.auth.obtenerToken()}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  // Obtiene los items que tiene el usuario en su mochila
  getMochila(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mochila`, { headers: this.headers() });
  }

  // Obtiene el catálogo completo de items disponibles en el juego
  getItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/items`, { headers: this.headers() });
  }

  // Añade una cantidad de un item a la mochila de un usuario
  // Lo usa el admin desde el panel de administración
  anadir(user_identificador: string, item_id: number, cantidad: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/mochila/anadir`, { user_identificador, item_id, cantidad }, { headers: this.headers() });
  }

  // Quita una cantidad de un item de la mochila de un usuario
  // Lo usa el admin desde el panel de administración
  quitar(user_identificador: string, item_id: number, cantidad: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/mochila/quitar`, { user_identificador, item_id, cantidad }, { headers: this.headers() });
  }

  
}