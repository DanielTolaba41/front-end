// src/app/core/guards/public.guard.ts

import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Si el usuario está logueado, redirige según su rol
    const user = authService.getCurrentUser();
    if (user) {
      const role = user.role.toLowerCase();
      router.navigate([`/dashboard/${role}`]);
      return false;
    }
  }

  return true;
};
