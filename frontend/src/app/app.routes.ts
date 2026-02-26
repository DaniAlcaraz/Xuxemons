import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { Perfil } from './perfil/perfil';
import { Registro } from './registro/registro';
import { Dashboard } from './dashboard/dashboard';
import { Editarperfil } from './editarperfil/editarperfil';

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
    path: 'editar/perfil',
    component: Editarperfil,
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




