// src/app/core/guards/auth.guard.ts

import { Injectable } from '@angular/core';
import {
  CanActivate,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Si no está logueado, redirigir a login
    if (!this.authService.isLoggedIn()) {
      console.log('Usuario no logueado, redirigiendo a login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    const user = this.authService.getCurrentUser();
    const requiredRole = route.data?.['role'] as UserRole;

    // Si no hay rol requerido o el usuario no tiene rol, permitir acceso
    if (!requiredRole || !user?.role) {
      return true;
    }

    // Comparar roles ignorando mayúsculas/minúsculas
    const userRoleUpper = user.role.toUpperCase();
    const requiredRoleUpper = requiredRole.toUpperCase();

    if (userRoleUpper !== requiredRoleUpper) {
      console.log('Rol no coincide, redirigiendo al dashboard correspondiente');
      this.router.navigate([`/dashboard/${user.role.toLowerCase()}`]);
      return false;
    }

    return true;
  }
}
