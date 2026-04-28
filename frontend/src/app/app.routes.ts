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

// N5: data.title i data.description s'usen per actualitzar els meta tags dinàmicament (App component)
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard],
    data: { title: 'Xuxemons - Inici de sessió', description: 'Inicia sessió al teu compte Xuxemons' }
  },
  {
    path: 'registro',
    component: Registro,
    data: { title: 'Xuxemons - Registre', description: 'Crea el teu compte Xuxemons' }
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [AuthGuard],
    data: { title: 'Xuxemons - Dashboard', description: 'El teu panell de control Xuxemons' }
  },
  {
    path: 'perfil',
    component: Perfil,
    canActivate: [AuthGuard],
    data: { title: 'Xuxemons - Perfil', description: 'Gestiona el teu perfil Xuxemons' }
  },
  {
    path: 'xuxemons',
    component: Xuxemons,
    canActivate: [AuthGuard],
    data: { title: 'Xuxemons - Col·lecció', description: 'La teva col·lecció de Xuxemons' }
  },
  {
    path: 'mochila',
    component: Mochila,
    canActivate: [AuthGuard],
    data: { title: 'Xuxemons - Motxilla', description: 'El teu inventari d\'objectes' }
  },
  {
    path: 'amigos',
    component: Amigos,
    canActivate: [AuthGuard],
    data: { title: 'Xuxemons - Amics', description: 'Els teus amics a Xuxemons' }
  },
  {
    path: 'admin',
    component: Admin,
    canActivate: [AdminGuard],
    data: { title: 'Xuxemons - Administració', description: 'Panell d\'administració de Xuxemons' }
  },
  {
    path: 'no-autorizado',
    component: NoAutorizado,
    data: { title: 'Xuxemons - Accés denegat', description: 'No tens permís per accedir a aquesta pàgina' }
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