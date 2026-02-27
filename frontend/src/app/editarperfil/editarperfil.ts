// editarperfil.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-editarperfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './editarperfil.html',
  styleUrls: ['./editarperfil.css']
})
export class Editarperfil {

  mostrarPassword = false;

  formData = {
    nombre: '',
    apellidos: '',
    usuario: '',
    correo: '',
    contrasena: ''
  };

  navItems = [
    { icon: '🏠', label: 'Inicio',    route: '/dashboard' },
    { icon: '📋', label: 'Xuxemons', route: '/xuxemons' },
    { icon: '🎒', label: 'Mochila',  route: '/mochila' },
    { icon: '👥', label: 'Amigos',   route: '/amigos' },
    { icon: '⚔️', label: 'Batalla',  route: '/batalla' },
    { icon: '💬', label: 'Chat',     route: '/chat' },
    { icon: '👤', label: 'Perfil',   route: '/perfil' },
  ];

  constructor(private router: Router) {}

  guardarCambios() {
    // Aquí conectarás con tu servicio/API
    console.log('Guardando cambios:', this.formData);
    // Tras guardar, volver al perfil
    this.router.navigate(['/perfil']);
  }

  cerrarSesion() {
    // Aquí conectarás con tu servicio de autenticación
    console.log('Cerrando sesión...');
    this.router.navigate(['/login']);
  }

  eliminarCuenta() {
    // Aquí mostrarías un modal de confirmación
    const confirmar = confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.');
    if (confirmar) {
      console.log('Eliminando cuenta...');
      this.router.navigate(['/login']);
    }
  }
}