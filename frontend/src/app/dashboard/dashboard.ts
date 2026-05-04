// Importación del decorador Component para definir el componente
import { Component } from '@angular/core'; 

// Importación de RouterModule para usar directivas de enrutamiento como routerLink
import { RouterModule } from '@angular/router';

//Interfaz que define la estructura de un elemento de navegación. Se usa para tipar los botones de la barra de navegación inferior.
interface NavItem {
  //Emoji que sirve como icono visual del botón de navegación
  icon: string;

  //Texto descriptivo que aparece debajo del icono
  label: string;

  //Ruta de Angular a la que redirige al hacer clic en el botón
  route: string;
}

// Define la configuracion del componente
@Component({
  // Selector HTML para insertar este componente: <app-dashboard></app-dashboard>
  selector: 'app-dashboard',

  // Indica que es un componente standalone (Angular 14+), no necesita un módulo
  standalone: true,

  //Importa RouterModule para poder usar routerLink y routerLinkActive en la plantilla
  imports: [RouterModule],

  //Ruta al archivo de plantilla HTML asociado
  templateUrl: './dashboard.html',

  // Ruta al archivo de estilos CSS asociado
  styleUrls: ['./dashboard.css']
})
export class Dashboard {

  //Array de elementos de navegación para la barra inferior. Cada objeto define un botón con su icono, etiqueta y ruta de destino. Se itera en la plantilla con @for para renderizar la barra completa
  navItems: NavItem[] = [
    { icon: '🏠', label: 'Inicio', route: '/dashboard' },
    { icon: '📖', label: 'Xuxemons', route: '/xuxemons' },
    { icon: '🎒', label: 'Mochila', route: '/mochila' },
    { icon: '👥', label: 'Amigos',   route: '/amigos' },
    { icon: '⚔️', label: 'Batallas', route: '/batallas' },
    { icon: '💬', label: 'Chat',     route: '/chat' },
    { icon: '👤', label: 'Perfil', route: '/perfil' },
    { icon: '🛡️', label: 'Admin', route: '/admin' },
  ];
}