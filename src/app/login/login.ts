import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private router: Router) {}

  async entrarAlDashboard(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.loading = true;

    try {
      if (!this.email) {
        this.errorMessage = 'Ingresa un usuario';
        this.loading = false;
        return;
      }

      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: this.email }),
      });

      const data = await response.json();
      if (!response.ok) {
        this.errorMessage = data.message || 'Error al iniciar sesión';
        return;
      }

      localStorage.setItem('cervixai-token', data.token);
      localStorage.setItem('cervixai-user', JSON.stringify(data.user));
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = 'No se pudo conectar al servidor';
    } finally {
      this.loading = false;
    }
  }
}