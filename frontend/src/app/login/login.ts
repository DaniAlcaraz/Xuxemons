import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../Services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  // Formulario reactivo que agrupa los campos de login
  form: FormGroup;

  // Controla si se muestra u oculta la contraseña en el input
  mostrarPassword = false;

  // Se activa cuando el usuario intenta enviar el formulario,
  // para mostrar errores de validación aunque no haya tocado los campos
  formSubmitted = false;

  // Errores que se muestran como mensajes en la vista (@if en el HTML)
  errorCredenciales = false;
  errorCuentaBaja = false;

  // Evita que el usuario pulse "Iniciar sesión" varias veces mientras se procesa
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,           // Servicio de Angular para crear formularios reactivos
    private authService: AuthService,  // Servicio propio que gestiona login, token y usuario
    private router: Router,            // Para redirigir al dashboard tras el login
    private cdr: ChangeDetectorRef     // Fuerza la actualización de la vista manualmente
  ) {
    // Definimos el formulario con sus campos y validadores (required)
    // Nivel 1 requiere: Formulari login amb ID + Password i validadors required
    this.form = this.fb.group({
      id:        ['', Validators.required],
      contrasena: ['', Validators.required]
    });
  }

  // Comprueba si un campo tiene errores y ha sido tocado o se intentó enviar
  // Usado en el HTML con @if (isInvalid('campo')) para mostrar mensajes de error
  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && (control?.touched || this.formSubmitted));
  }

  onSubmit(): void {
    // Marcamos que se intentó enviar el formulario (activa validaciones visuales)
    this.formSubmitted = true;
    this.errorCredenciales = false;
    this.errorCuentaBaja = false;

    // Marca todos los campos como tocados para que aparezcan los errores
    this.form.markAllAsTouched();

    if (this.form.valid) {
      this.isSubmitting = true;

      // Forzamos la actualización de la vista para mostrar el estado "Iniciando sesión..."
      // antes de que llegue la respuesta del servidor
      this.cdr.detectChanges();

      const datos = {
        identificador: this.form.value.id,
        password:      this.form.value.contrasena
      };

      // Llamada al AuthService que hace POST /api/login
      this.authService.login(datos).subscribe({
        next: (res) => {
          this.isSubmitting = false;

          // Guardamos el token JWT en localStorage para usarlo en futuras peticiones
          // Nivel 1: Login/Registre guarda token JWT a localStorage
          this.authService.guardarToken(res.access_token);

          // Guardamos los datos del usuario en localStorage para acceder desde cualquier componente
          this.authService.guardarUsuario(res.user);

          // Redirigimos al dashboard tras el login exitoso
          // Nivel 1: Rutes /login → /home (dashboard)
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isSubmitting = false;

          // Distinguimos entre cuenta dada de baja (403) y credenciales incorrectas
          if (err.status === 403) {
            this.errorCuentaBaja = true;
          } else {
            this.errorCredenciales = true;
          }

          // Forzamos actualización de vista para mostrar el mensaje de error
          this.cdr.detectChanges();
        }
      });
    }
  }
}