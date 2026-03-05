import { Component, OnInit } from '@angular/core';
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
export class Editarperfil implements OnInit {
  form: FormGroup;
  mostrarPassword = false;
  formSubmitted = false;
  guardadoOk = false;
  errorGuardado = false;
  identificador = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
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
          this.authService.guardarUsuario(res.user);
          this.guardadoOk = true;
          this.form.patchValue({ contrasena: '' });
          this.formSubmitted = false;
        },
        error: () => {
          this.errorGuardado = true;
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