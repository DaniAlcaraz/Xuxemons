import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./perfil/perfil.component').then(m => m.PerfilComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
