// src/app/core/interceptors/auth.interceptor.ts

import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Verificar si la ruta es pública (login/registro)
  const isPublicRoute = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  if (token && !isPublicRoute) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.log('Token expirado o inválido');
        authService.logout();
        router.navigate(['/auth/login']);
      }
      // Manejar otros errores de autenticación
      if (error.status === 403) {
        console.log('Acceso prohibido');
        router.navigate(['/dashboard']);
      }
      return throwError(() => error);
    })
  );
};
