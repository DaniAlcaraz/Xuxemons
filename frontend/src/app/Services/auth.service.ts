import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // N1: Endpoints de registre i login del formulari
  registro(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, datos);
  }

  login(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, datos);
  }

  // El interceptor ja afegeix el Bearer token, no cal passar headers manualment
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  // N1: El JWT es guarda a localStorage després del login/registre
  guardarToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  guardarUsuario(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  obtenerToken(): string | null {
    return localStorage.getItem('access_token');
  }

  obtenerUsuario(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // N5: Logout elimina el token i les dades d'usuari de localStorage
  cerrarSesion(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  estaLogueado(): boolean {
    return !!this.obtenerToken();
  }

  // N2: Comprova el rol per protegir la ruta /admin amb AdminGuard
  esAdmin(): boolean {
    const user = this.obtenerUsuario();
    return user?.rol === 'admin';
  }

  // N5: Auto-login — valida el token contra /api/me en lloc de confiar sols en localStorage
  estaLogueadoAsync(): Observable<boolean> {
    if (!this.obtenerToken()) return of(false);
    return this.me().pipe(
      map(() => true),
      catchError(() => {
        this.cerrarSesion();
        return of(false);
      })
    );
  }

  // N1: Editar nom, cognoms, email i contrasenya del perfil
  actualizarPerfil(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuario`, datos);
  }

  // N1: Eliminar compte (crida al backend, confirmació visual al component)
  eliminarCuenta(): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuario/baja`, {});
  }
}