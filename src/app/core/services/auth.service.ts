// src/app/core/services/auth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject as injectPlatform } from '@angular/core';
import {
  User,
  LoginResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  UserRole
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://srfm-back-end.onrender.com';
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = injectPlatform(PLATFORM_ID);

  private currentUserSubject: BehaviorSubject<User | null>;
  currentUser$: Observable<User | null>;

  constructor() {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  private getUserFromStorage(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (!userStr) {
        return null;
      }
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing stored user:', e);
      return null;
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('Enviando request de login:', credentials);
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('Respuesta del servidor:', response);
          this.handleAuthentication(response);
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => new Error(error.error?.message || 'Error durante el inicio de sesión'));
        })
      );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(response => {
          console.log('Registro exitoso:', response);
        }),
        catchError(error => {
          console.error('Error durante el registro:', error);
          return throwError(() => new Error(error.error?.message || 'Error durante el registro'));
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    console.log('Verificando login:', { token: !!token, user: !!user });
    return !!token && !!user;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  handleAuthentication(response: LoginResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      console.log('Token guardado:', response.token);
      console.log('Usuario guardado:', response.user);
      this.currentUserSubject.next(response.user);
    }
  }
}
