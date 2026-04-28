import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, throwError } from 'rxjs';
import { AuthService } from '../Services/auth.service';
import { LoadingService } from '../Services/loading.service';

// N1/N5: Interceptor funcional — s'executa en cada petició HTTP de l'aplicació
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService    = inject(AuthService);
  const router         = inject(Router);
  const loadingService = inject(LoadingService);

  const token = authService.obtenerToken();

  // N1/N5: Afegeix el Bearer token automàticament a totes les peticions
  const reqConToken = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // N5: Activa l'indicador de càrrega global mentre la petició és en curs
  loadingService.start();

  return next(reqConToken).pipe(
    // N5: Gestió centralitzada d'errors — 401, 403 i 500 es capturen aquí per a tota l'app
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirat (2h) → tanca sessió i redirigeix al login
        authService.cerrarSesion();
        router.navigate(['/login']);
      } else if (error.status === 403 && token) {
        // Autenticat però sense permisos → pàgina no autoritzada
        router.navigate(['/no-autorizado']);
      } else if (error.status === 500) {
        console.error('Error del servidor (500):', error.message);
      }
      return throwError(() => error);
    }),
    finalize(() => loadingService.stop())
  );
};