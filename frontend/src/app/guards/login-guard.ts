import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  // Evita que un usuari ja autenticat torni a la pàgina de login
  canActivate(): boolean {
    if (this.auth.estaLogueado()) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
      return false;
    }
    return true;
  }
}