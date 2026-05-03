import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly mode = signal<'login' | 'register'>('login');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  name = '';
  email = '';
  password = '';

  setMode(mode: 'login' | 'register') {
    this.mode.set(mode);
    this.error.set(null);
  }

  submit() {
    this.error.set(null);
    const email = this.email.trim();
    const password = this.password;
    const name = this.name.trim();

    if (!email || !password || (this.mode() === 'register' && !name)) {
      this.error.set('Preencha os campos para continuar.');
      return;
    }

    this.loading.set(true);
    const request =
      this.mode() === 'register'
        ? this.auth.register({ name, email, password })
        : this.auth.login({ email, password });

    request.subscribe({
      next: () => void this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(err?.error?.message || 'Nao foi possivel autenticar.');
        this.loading.set(false);
      },
    });
  }
}
