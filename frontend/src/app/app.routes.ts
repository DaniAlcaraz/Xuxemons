import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { Perfil } from './perfil/perfil';
import { Registro } from './registro/registro';
import { Dashboard } from './dashboard/dashboard';
import { Xuxemons } from './xuxemons/xuxemons';
import { Mochila } from './mochila/mochila';
import { Admin } from './admin/admin';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'perfil',
    component: Perfil,
    canActivate: [authGuard]
  },
  {
    path: 'registro',
    component: Registro,
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'xuxemons',
    component: Xuxemons,
    canActivate: [authGuard]
  },
  {
    path: 'mochila',
    component: Mochila,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard]
  }
];




