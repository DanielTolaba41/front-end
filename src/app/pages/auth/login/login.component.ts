// src/app/pages/auth/login/login.component.ts

import { Component, inject } from '@angular/core';
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
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  showPassword = false;
  loginError = '';
  isSubmitting = false;

  onSubmit() {
    if (this.loginForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.loginError = '';

      const email = this.loginForm.get('email')?.value || '';
      const password = this.loginForm.get('password')?.value || '';

      const request: LoginRequest = {
        email,
        password
      };

      console.log('Intentando login con:', request);

      this.authService.login(request).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          if (!response.user || !response.user.role) {
            this.loginError = 'Error: Información de usuario inválida';
            return;
          }

          const role = response.user.role.toLowerCase();
          console.log('Navegando a dashboard/', role);

          // Navegación con promesas
          this.router.navigate([`/dashboard/${role}`], {
            replaceUrl: true // Esto reemplaza la entrada actual en el historial
          }).then(
            (success) => {
              console.log('Navegación exitosa:', success);
              if (!success) {
                console.error('La navegación no fue exitosa');
                this.loginError = 'Error al redireccionar: ruta no encontrada';
              }
            },
            (error) => {
              console.error('Error en navegación:', error);
              this.loginError = 'Error al redireccionar';
            }
          );
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.loginError = error.message || 'Error durante el inicio de sesión';
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToSignup() {
    this.router.navigate(['/auth/signup']);
  }

  navigateToForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }
}
