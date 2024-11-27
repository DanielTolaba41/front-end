// src/app/pages/auth/login/login.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/interfaces/auth.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  loginError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.loginError = '';

      const { email, password } = this.loginForm.value;
      const credentials: LoginRequest = { email, password };

      console.log('Intentando login con:', credentials);

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);

          const userRole = response.user.role.toLowerCase();
          const dashboardRoute = `/dashboard/${userRole}`;

          console.log('Navegando a:', dashboardRoute);

          // Pequeño delay para asegurar que el localStorage se actualice
          setTimeout(() => {
            this.router.navigate([dashboardRoute])
              .then(success => {
                console.log('Navegación exitosa:', success);
                if (!success) {
                  console.error('La navegación no fue exitosa');
                  this.loginError = 'Error en la redirección';
                }
              })
              .catch(error => {
                console.error('Error en la navegación:', error);
                this.loginError = 'Error en la redirección';
              })
              .finally(() => {
                this.isLoading = false;
              });
          }, 100);
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.loginError = error.message || 'Error durante el inicio de sesión';
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
