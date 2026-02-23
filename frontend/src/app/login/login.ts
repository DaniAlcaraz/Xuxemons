import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  correo = signal('');
  contrasena = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  errorMsg = signal('');

  constructor(private router: Router) {}

  onSubmit() {
    if (!this.correo() || !this.contrasena()) {
      this.errorMsg.set('Por favor, completa todos los campos.');
      return;
    }
    this.errorMsg.set('');
    this.isLoading.set(true);

    // TODO: reemplazar con llamada real al servicio de auth
    setTimeout(() => {
      this.isLoading.set(false);
      this.router.navigate(['/dashboard']);
    }, 1500);
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }
}
