import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Xuxemon, ColeccionResponse } from '../interfaces/xuxemon';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class XuxemonService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.auth.obtenerToken()}`
    });
  }

  // Catálogo global de todos los xuxemons
  getTodos(): Observable<Xuxemon[]> {
    return this.http.get<Xuxemon[]>(`${this.apiUrl}/xuxemons`);
  }

  getXuxemon(id: number): Observable<Xuxemon> {
    return this.http.get<Xuxemon>(`${this.apiUrl}/xuxemons/${id}`);
  }

  // Colección del usuario autenticado
  getColeccion(): Observable<ColeccionResponse> {
    return this.http.get<ColeccionResponse>(`${this.apiUrl}/coleccion`, {
      headers: this.getHeaders()
    });
  }

  // Añadir un xuxemon aleatorio a la colección del usuario
  anadirAleatorio(): Observable<any> {
    return this.http.post(`${this.apiUrl}/coleccion/anadir-aleatorio`, {}, {
      headers: this.getHeaders()
    });
  }
}