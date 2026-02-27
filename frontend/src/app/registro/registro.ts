import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}[A-Za-z]$|^[XYZxyz][0-9]{7}[A-Za-z]$/)]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
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
    if (control?.hasError('pattern')) return 'El formato del DNI/NIE no es válido (ej: 12345678A)';
    if (control?.hasError('minlength')) return 'La contraseña debe tener al menos 6 caracteres';
    if (field === 'repetirContrasena' && this.form.hasError('noCoinciden') && (control?.touched || this.formSubmitted))
      return 'Las contraseñas no coinciden';
    return null;
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.form.markAllAsTouched();
    if (this.form.valid) {
      // lógica de registro
    }
  }
}
