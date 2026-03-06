import { Component } from '@angular/core';
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
  form: FormGroup;
  mostrarPassword = false;
  formSubmitted = false;
  errorCredenciales = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
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
  this.errorCredenciales = false;
  this.form.markAllAsTouched();
  if (this.form.valid) {
    const datos = {
      identificador: this.form.value.id,
      password: this.form.value.contrasena
    };
    this.authService.login(datos).subscribe({
      next: (res) => {
        this.authService.guardarToken(res.access_token);
        this.authService.guardarUsuario(res.user); // 👈 guarda el usuario
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorCredenciales = true;
      }
    });
  }
}
}