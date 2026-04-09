import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Component({
  selector: 'app-no-autorizado',
  standalone: true,
  template: `
    <div style="
      display:flex; flex-direction:column; align-items:center;
      justify-content:center; height:100vh; gap:16px; font-family:sans-serif;
      background:#f5f5f5; text-align:center; padding:24px;
    ">
      <span style="font-size:64px">🚫</span>
      <h1 style="font-size:24px; color:#c62828; margin:0">No eres administrador</h1>
      <p style="color:#555; margin:0">No tienes permiso para acceder a esta sección.</p>
      <button (click)="irAlDashboard()" style="
        margin-top:8px; padding:12px 24px; background:#6c47ff;
        color:white; border:none; border-radius:8px;
        font-size:16px; cursor:pointer;
      ">
        Volver al inicio
      </button>
    </div>
  `
})
export class NoAutorizado {
  constructor(private router: Router) {}

  irAlDashboard(): void {
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }
}