import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.auth.estaLogueado()) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return false;
    }

    if (!this.auth.esAdmin()) {
      this.router.navigate(['/no-autorizado'], { replaceUrl: true });
      return false;
    }

    return true;
  }
}