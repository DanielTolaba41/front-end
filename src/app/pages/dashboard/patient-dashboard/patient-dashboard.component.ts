// src/app/pages/dashboard/patient-dashboard/patient-dashboard.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

interface User {
  firstName: string;
  lastName: string;
  profileImage: string;
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent {
  sidebarOpen = true;
  user: User = {
    firstName: 'Juan',
    lastName: 'Pérez',
    profileImage: '/images/avatar.png'
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Verificar autenticación
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Suscribirse a los eventos de navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Cerrar el sidebar solo si estamos en vista móvil
      if (window.innerWidth <= 768) {
        this.sidebarOpen = false;
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleProfileMenu(): void {
    console.log('Toggle profile menu');
  }

  logout(): void {
    this.authService.logout(); // Usar el método logout del AuthService
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
