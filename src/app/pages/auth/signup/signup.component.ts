// src/app/pages/auth/signup/signup.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/interfaces/auth.interface';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  signupForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required]],
    document: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    terms: [false, Validators.requiredTrue]
  });

  showPassword = false;
  showConfirmPassword = false;
  signupError = '';
  isSubmitting = false;

  passwordsMatch(): boolean {
    const password = this.signupForm.get('password')?.value || '';
    const confirmPassword = this.signupForm.get('confirmPassword')?.value || '';
    return password === confirmPassword && password !== '';
  }

  isFormValid(): boolean {
    return this.signupForm.valid && this.passwordsMatch();
  }

  onSubmit() {
    if (this.isFormValid() && !this.isSubmitting) {
      this.isSubmitting = true;
      this.signupError = '';

      const userData: RegisterRequest = {
        name: this.signupForm.get('firstName')?.value || '',
        lastName: this.signupForm.get('lastName')?.value || '',
        phone: this.signupForm.get('phone')?.value || '',
        document: this.signupForm.get('document')?.value || '',
        email: this.signupForm.get('email')?.value || '',
        password: this.signupForm.get('password')?.value || '',
      };

      // Verificación adicional antes de enviar
      if (Object.values(userData).some(value => value === '')) {
        this.signupError = 'Por favor, complete todos los campos';
        this.isSubmitting = false;
        return;
      }

      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.router.navigate(['/auth/login'], {
            queryParams: { registered: 'true' }
          });
        },
        error: (error) => {
          console.error('Error en registro:', error);
          this.signupError = error.message;
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.signupForm);
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}
