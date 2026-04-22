import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../Services/auth.service';
import { Router } from '@angular/router';

interface NavItem { icon: string; label: string; route: string; }

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class Perfil implements OnInit {

  // Formulario reactivo con los campos editables del perfil
  form: FormGroup;

  // Controla la visibilidad de la contraseña en el input
  mostrarPassword = false;

  // Se activa al intentar guardar, para mostrar errores de validación
  formSubmitted = false;

  // Indica que la petición al servidor está en curso
  isSubmitting = false;

  // Flags para mostrar mensajes de éxito o error tras guardar (@if en el HTML)
  guardadoOk = false;
  errorGuardado = false;

  // El identificador del usuario (#NombreXXXX), solo lectura
  identificador = '';

  constructor(
    private fb: FormBuilder,           // Servicio de Angular para crear formularios reactivos
    private authService: AuthService,  // Servicio propio que gestiona el usuario y el token
    private router: Router,            // Para redirigir al cerrar sesión o eliminar cuenta
    private cdr: ChangeDetectorRef     // Fuerza actualización de la vista manualmente
  ) {
    // Definimos el formulario con validadores
    // Nivel 1: Validadors required, email, minLength(6)
    this.form = this.fb.group({
      nombre:     ['', Validators.required],
      apellidos:  ['', Validators.required],
      correo:     ['', [Validators.required, Validators.email]],
      // La contraseña es opcional al editar — solo se valida si se escribe algo
      contrasena: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Cargamos los datos del usuario guardados en localStorage al inicializar el componente
    // Nivel 1: AuthService guarda el usuario y el token en localStorage
    const userData = this.authService.obtenerUsuario();
    if (userData) {
      this.identificador = userData.identificador;

      // Rellenamos el formulario con los datos actuales del usuario (property binding)
      this.form.patchValue({
        nombre:    userData.nombre,
        apellidos: userData.apellidos,
        correo:    userData.email
      });
    }
  }

  // Comprueba si un campo es inválido y ha sido tocado o se intentó enviar
  // Usado en el HTML con @if (isInvalid('campo')) — Nivel 1: @if per mostrar errors
  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && (control?.touched || this.formSubmitted));
  }

  // Copia el identificador al portapapeles al pulsar el botón (event binding)
  copiarIdentificador(): void {
    navigator.clipboard.writeText(this.identificador);
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.guardadoOk = false;
    this.errorGuardado = false;
    this.form.markAllAsTouched();

    if (this.form.valid) {
      this.isSubmitting = true;

      // Forzamos la vista para mostrar "Guardando..." inmediatamente
      this.cdr.detectChanges();

      const datos: any = {
        nombre:    this.form.value.nombre,
        apellidos: this.form.value.apellidos,
        email:     this.form.value.correo,
      };

      // Solo enviamos la contraseña si el usuario ha escrito una nueva
      if (this.form.value.contrasena) {
        datos.password = this.form.value.contrasena;
      }

      // Llamada al AuthService que hace PUT /api/usuario
      this.authService.actualizarPerfil(datos).subscribe({
        next: (res) => {
          this.isSubmitting = false;

          // Actualizamos el usuario en localStorage con los nuevos datos
          this.authService.guardarUsuario(res.user);

          this.guardadoOk = true;
          this.form.patchValue({ contrasena: '' });
          this.formSubmitted = false;

          // Forzamos la vista para mostrar el mensaje de éxito
          this.cdr.detectChanges();
        },
        error: () => {
          this.isSubmitting = false;
          this.errorGuardado = true;
          this.cdr.detectChanges();
        }
      });
    }
  }

  cerrarSesion(): void {
    // Llamamos al backend para invalidar el token Sanctum
    this.authService.logout().subscribe({
      next: () => {
        // Eliminamos token y usuario de localStorage
        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
      },
      error: () => {
        // Aunque falle el backend, limpiamos la sesión local igualmente
        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
      }
    });
  }

  eliminarCuenta(): void {
    // Diálogo de confirmación antes de eliminar
    if (confirm('¿Estás totalmente seguro de que quieres eliminar tu cuenta?')) {
      this.authService.eliminarCuenta().subscribe({
        next: () => {
          alert('Tu cuenta ha sido eliminada correctamente.');
          this.authService.cerrarSesion();
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error al intentar eliminar:', error);
          alert('Hubo un error al procesar tu baja. Inténtalo de nuevo más tarde.');
        }
      });
    }
  }

  navItems: NavItem[] = [
    { icon: '🏠', label: 'Inicio',   route: '/dashboard' },
    { icon: '📖', label: 'Xuxemons', route: '/xuxemons'  },
    { icon: '🎒', label: 'Mochila',  route: '/mochila'   },
    { icon: '👥', label: 'Amigos',   route: '/amigos'    },
    { icon: '⚔️', label: 'Batallas', route: '/batallas'  },
    { icon: '💬', label: 'Chat',     route: '/chat'      },
    { icon: '👤', label: 'Perfil',   route: '/perfil'    },
    { icon: '🛡️', label: 'Admin',    route: '/admin'     },
  ];
}