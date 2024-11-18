// src/app/core/services/auth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import {
  User,
  LoginResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  UserRole
} from '../interfaces/auth.interface';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject as injectPlatform } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://srfm-back-end.onrender.com';
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = injectPlatform(PLATFORM_ID);

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('Enviando request de login:', credentials);
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('Respuesta del servidor:', response);

          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
          }

          this.currentUserSubject.next(response.user);
        }),
        catchError(error => {
          console.error('Error detallado:', error);
          return throwError(() => new Error(error.error?.message || 'Error durante el inicio de sesión'));
        })
      );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(response => {
          console.log('Registro exitoso:', response.message);
        }),
        catchError(error => {
          console.error('Error durante el registro:', error);
          return throwError(() => new Error(
            error.error?.message ||
            'Error durante el registro'
          ));
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private getUserFromStorage(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  getCurrentUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }
}
