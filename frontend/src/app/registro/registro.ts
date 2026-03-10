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
  form: FormGroup;
  mostrarPassword = false;
  mostrarRepetirPassword = false;
  formSubmitted = false;
  isSubmitting = false;
  identificadorGenerado: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, public router: Router, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      repetirContrasena: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  passwordsMatch(group: AbstractControl) {
    const pass = group.get('contrasena')?.value;
    const repeat = group.get('repetirContrasena')?.value;
    return pass === repeat ? null : { noCoinciden: true };
  }

  getError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.touched && !this.formSubmitted) return null;
    if (control?.hasError('required')) return 'Este campo es obligatorio';
    if (control?.hasError('email')) return 'El formato del correo no es válido';
    if (control?.hasError('minlength')) return 'La contraseña debe tener al menos 8 caracteres';
    if (field === 'repetirContrasena' && this.form.hasError('noCoinciden') && (control?.touched || this.formSubmitted))
      return 'Las contraseñas no coinciden';
    return null;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.isSubmitting = true;
      this.cdr.detectChanges(); // Fuerza la actualización para mostrar "Creando cuenta..."

      const datos = {
        nombre: this.form.value.nombre,
        apellidos: this.form.value.apellidos,
        email: this.form.value.correo,
        password: this.form.value.contrasena,
        password_confirmation: this.form.value.repetirContrasena
      };
      this.authService.registro(datos).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.authService.guardarToken(res.access_token);
          this.identificadorGenerado = res.user.identificador; 
          this.cdr.detectChanges(); // Actualiza para mostrar el cartón verde con el ID
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error registro:', err);
          this.cdr.detectChanges();
        }
      });
    }
  }

}