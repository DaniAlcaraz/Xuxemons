import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class MochilaService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.auth.obtenerToken()}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  getMochila(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mochila`, { headers: this.headers() });
  }

  getItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/items`, { headers: this.headers() });
  }

  anadir(user_identificador: string, item_id: number, cantidad: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/mochila/anadir`, { user_identificador, item_id, cantidad }, { headers: this.headers() });
  }

  quitar(user_identificador: string, item_id: number, cantidad: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/mochila/quitar`, { user_identificador, item_id, cantidad }, { headers: this.headers() });
  }

  
}