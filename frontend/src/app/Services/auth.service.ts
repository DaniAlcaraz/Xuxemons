import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  registro(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, datos);
  }

  login(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, datos);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, {
      headers: this.getAuthHeaders()
    });
  }

  guardarToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  guardarUsuario(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  obtenerUsuario(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  obtenerToken(): string | null {
    return localStorage.getItem('access_token');
  }

  cerrarSesion(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  estaLogueado(): boolean {
    return !!this.obtenerToken();
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.obtenerToken()}`
    });
  }

  actualizarPerfil(datos: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/usuario`, datos, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarCuenta(): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuario/deshabilitar`, {}, {
      headers: this.getAuthHeaders()
    });
  }
}