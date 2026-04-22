import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // estaLogueadoAsync() llama a /api/me con el token guardado en localStorage.
    // Si el token sigue válido (dentro de las 2h) → devuelve true → acceso permitido (auto-login).
    // Si el token expiró o no existe → devuelve false → redirige a /login.
    return this.auth.estaLogueadoAsync().pipe(
      tap(logueado => {
        if (!logueado) this.router.navigate(['/login'], { replaceUrl: true });
      })
    );
  }
}