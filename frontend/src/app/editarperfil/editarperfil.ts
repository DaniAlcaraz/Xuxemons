import { Component } from '@angular/core';
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
  imports: [NgFor, RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './editarperfil.html',
  styleUrls: ['./editarperfil.css']
})
export class Editarperfil {
  form: FormGroup;
  mostrarPassword = false;
  formSubmitted = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      nombre:    ['Daniel', Validators.required],
      apellidos: ['García', Validators.required],
      usuario:   ['daniel_entrenador', Validators.required],
      correo:    ['daniel@xuxemons.com', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.minLength(6)]]
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && (control?.touched || this.formSubmitted));
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.form.markAllAsTouched();
    if (this.form.valid) {
      // lógica guardar cambios
    }
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
      },
      error: () => {
        // Aunque falle la llamada al backend, limpiamos el token igualmente
        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
      }
    });
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