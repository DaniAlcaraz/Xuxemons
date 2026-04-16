import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { Perfil } from './perfil/perfil';
import { Registro } from './registro/registro';
import { Dashboard } from './dashboard/dashboard';
import { Xuxemons } from './xuxemons/xuxemons';
import { Mochila } from './mochila/mochila';
import { Admin } from './admin/admin';
import { Amigos } from './amigos/amigos';
import { AuthGuard } from './guards/auth-guard';
import { LoginGuard } from './guards/login-guard';
import { AdminGuard } from './guards/admin-guard';
import { NoAutorizado } from './no-autorizado/no-autorizado';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'registro',
    component: Registro,
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [AuthGuard]
  },
  {
    path: 'perfil',
    component: Perfil,
    canActivate: [AuthGuard]
  },
  {
    path: 'xuxemons',
    component: Xuxemons,
    canActivate: [AuthGuard]
  },
  {
    path: 'mochila',
    component: Mochila,
    canActivate: [AuthGuard]
  },
  {
    path: 'amigos',
    component: Amigos,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    component: Admin,
   canActivate: [AdminGuard]
  },
  {
    path: 'no-autorizado',
    component: NoAutorizado
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];