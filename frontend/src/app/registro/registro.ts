import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../Services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class Registro {
  // --- Propiedades del Componente ---
  form: FormGroup;                 // Grupo de controles del formulario
  mostrarPassword = false;         // Control visual para ver/ocultar contraseña
  mostrarRepetirPassword = false;  // Control visual para ver/ocultar repetición
  formSubmitted = false;           // Bandera para saber si el usuario intentó enviar el form
  isSubmitting = false;            // Bandera de carga (loading) durante la petición
  identificadorGenerado: string | null = null; // Almacena el ID retornado por el servidor tras el éxito
  errorRegistro: string | null = null; // Mensaje de error del servidor (usuario duplicado, etc.)

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    public router: Router, 
    private cdr: ChangeDetectorRef
  ) {
    // Inicialización del formulario con validaciones síncronas
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      repetirContrasena: ['', Validators.required]
    }, { 
      // Validador personalizado para comparar campos entre sí
      validators: this.passwordsMatch 
    });
  }

  /**
   * Validador personalizado: Comprueba que las dos contraseñas sean idénticas.
   * Se aplica a nivel de FormGroup.
   */
  passwordsMatch(group: AbstractControl) {
    const pass = group.get('contrasena')?.value;
    const repeat = group.get('repetirContrasena')?.value;
    return pass === repeat ? null : { noCoinciden: true };
  }

  /**
   * Gestión de mensajes de error para la vista.
   * Retorna el texto del error según la validación que falle.
   */
  getError(field: string): string | null {
    const control = this.form.get(field);
    
    // Si el usuario no ha tocado el campo y no ha dado a "enviar", no mostramos error aún
    if (!control?.touched && !this.formSubmitted) return null;

    if (control?.hasError('required')) return 'Este campo es obligatorio';
    if (control?.hasError('email')) return 'El formato del correo no es válido';
    if (control?.hasError('minlength')) return 'La contraseña debe tener al menos 6 caracteres';
    
    // Error especial para la coincidencia de contraseñas
    if (field === 'repetirContrasena' && this.form.hasError('noCoinciden') && (control?.touched || this.formSubmitted))
      return 'Las contraseñas no coinciden';
    
    return null;
  }

  /**
   * Método principal de envío del formulario.
   */
  onSubmit(): void {
    this.formSubmitted = true;
    this.form.markAllAsTouched(); // Fuerza que se marquen todos para mostrar errores visuales

    if (this.form.valid) {
      this.isSubmitting = true;
      this.errorRegistro = null; // Limpiamos errores previos
      this.cdr.detectChanges(); // Forzamos detección de cambios para mostrar estados de carga

      // Mapeo de los nombres de campos del formulario a los que espera la API de Laravel
      const datos = {
        nombre: this.form.value.nombre,
        apellidos: this.form.value.apellidos,
        email: this.form.value.correo,
        password: this.form.value.contrasena,
        password_confirmation: this.form.value.repetirContrasena
      };

      // Llamada al servicio de autenticación
      this.authService.registro(datos).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.errorRegistro = null;
          // Guardamos el identificador único que genera el backend (importante para tu lógica)
          this.identificadorGenerado = res.user.identificador;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error registro:', err);

          // Manejar errores de validación del backend (422)
          if (err.status === 422 && err.error?.errors) {
            const errores = err.error.errors;
            if (errores.email) {
              this.errorRegistro = 'Este correo electrónico ya está registrado. Prueba con otro o inicia sesión.';
            } else {
              // Mostrar el primer error de validación disponible
              const primerCampo = Object.keys(errores)[0];
              this.errorRegistro = errores[primerCampo][0];
            }
          } else if (err.status === 409) {
            this.errorRegistro = 'Este usuario ya está registrado. Prueba a iniciar sesión.';
          } else {
            this.errorRegistro = 'Ha ocurrido un error al crear la cuenta. Inténtalo de nuevo.';
          }

          this.cdr.detectChanges();
        }
      });
    }
  }
}