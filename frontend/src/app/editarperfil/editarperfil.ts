import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Services/auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-editarperfil',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './editarperfil.html',
  styleUrls: ['./editarperfil.css']
})
export class Editarperfil implements OnInit {
  form: FormGroup;
  mostrarPassword = false;
  formSubmitted = false;
  isSubmitting = false;
  guardadoOk = false;
  errorGuardado = false;
  identificador = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      nombre:    ['', Validators.required],
      apellidos: ['', Validators.required],
      correo:    ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    const userData = this.authService.obtenerUsuario();
    if (userData) {
      this.identificador = userData.identificador;
      this.form.patchValue({
        nombre:    userData.nombre,
        apellidos: userData.apellidos,
        correo:    userData.email
      });
    }
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && (control?.touched || this.formSubmitted));
  }

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
      this.cdr.detectChanges(); // Mostrar estado de carga

      const datos: any = {
        nombre:    this.form.value.nombre,
        apellidos: this.form.value.apellidos,
        email:     this.form.value.correo,
      };
      if (this.form.value.contrasena) {
        datos.password = this.form.value.contrasena;
      }

      this.authService.actualizarPerfil(datos).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.authService.guardarUsuario(res.user);
          this.guardadoOk = true;
          this.form.patchValue({ contrasena: '' });
          this.formSubmitted = false;
          this.cdr.detectChanges(); // Mostrar "Cambios guardados correctamente"
        },
        error: () => {
          this.isSubmitting = false;
          this.errorGuardado = true;
          this.cdr.detectChanges(); // Mostrar error
        }
      });
    }
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
      }
    });
  }

  eliminarCuenta() {
    //Mensaje de confirmacion
    if (confirm('¿Estás totalmente seguro de que quieres eliminar tu cuenta?')) {
      
      //Llama al servicio
      this.authService.eliminarCuenta().subscribe({
        next: (response) => {
          //Si Laravel responde OK (200), hace lo siguiente:
          alert('Tu cuenta ha sido eliminada correctamente.');
          
          //Limpia sesion y redirige
          this.authService.cerrarSesion();
          this.router.navigate(['/login']);
        },
        error: (error) => {
          //Si algo falla en el backend
          console.error('Error al intentar eliminar:', error);
          alert('Hubo un error al procesar tu baja. Inténtalo de nuevo más tarde.');
        }
      });
    }

  }

  navItems: NavItem[] = [
    { icon: '🏠', label: 'Inicio',    route: '/dashboard' },
    { icon: '📖', label: 'Xuxemons', route: '/xuxemons'  },
    { icon: '🎒', label: 'Mochila',  route: '/mochila'   },
    { icon: '👥', label: 'Amigos',   route: '/amigos'    },
    { icon: '⚔️', label: 'Batallas', route: '/batallas'  },
    { icon: '💬', label: 'Chat',     route: '/chat'      },
    { icon: '👤', label: 'Perfil',   route: '/perfil'    },
    { icon: '🛡️', label: 'Admin',   route: '/admin'     }
  ];
}