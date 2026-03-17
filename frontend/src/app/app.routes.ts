import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { Perfil } from './perfil/perfil';
import { Registro } from './registro/registro';
import { Dashboard } from './dashboard/dashboard';
import { Xuxemons } from './xuxemons/xuxemons';
import { Mochila } from './mochila/mochila';
import { Admin } from './admin/admin';

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
  },
  {
    path: 'xuxemons',
    component: Xuxemons,
  },
  {
    path: 'mochila',
    component: Mochila,
  },
  {
    path: 'admin',
    component: Admin,
  }
];




