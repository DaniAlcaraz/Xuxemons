import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  form: FormGroup;
  mostrarPassword = false;
  formSubmitted = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      id: ['', Validators.required],
      contrasena: ['', Validators.required]
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
      console.log('Login form data:', this.form.value);
      // Aquí iría tu lógica de conexión con el backend
    }
  }
}