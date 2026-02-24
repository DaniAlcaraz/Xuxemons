import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { Perfil } from './perfil/perfil';
import { Registro } from './registro/registro';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'perfil',
    component: Perfil,
  },
  {
    path: 'registro',
    component: Registro,
  },
  {
    path: 'dashboard',
    component: Dashboard,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];