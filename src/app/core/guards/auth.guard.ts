// src/app/core/guards/auth.guard.ts

import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanMatch,
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
export class AuthGuard implements CanActivate, CanMatch {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAccess(route);
  }

  canMatch(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAccess(route);
  }

  private checkAccess(route: Route | ActivatedRouteSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const user = this.authService.getCurrentUser();
    const requiredRole = route.data?.['role'] as UserRole;

    if (requiredRole && user?.role !== requiredRole) {
      const defaultRoute = this.getDefaultRouteForRole(user?.role);
      this.router.navigate([defaultRoute]);
      return false;
    }

    return true;
  }

  private getDefaultRouteForRole(role?: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return '/dashboard/admin';
      case UserRole.DOCTOR:
        return '/dashboard/doctor';
      case UserRole.PATIENT:
        return '/dashboard/patient';
      default:
        return '/auth/login';
    }
  }
}
