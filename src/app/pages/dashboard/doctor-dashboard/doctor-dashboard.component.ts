import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
interface User {
  firstName: string;
  lastName: string;
  profileImage: string;
  specialty?: string;
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.css'
})
export class DoctorDashboardComponent {
  sidebarOpen = true;
  user: User = {
    firstName: 'Juan',
    lastName: 'Pérez',
    profileImage: '/images/avatar.png',
    specialty: 'Cardiología'
  };

  constructor(private router: Router, private authService: AuthService) {
    // Verificar autenticación
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    // Cerrar el sidebar en móvil cuando se navega
    this.router.events.subscribe(() => {
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
    // Por ahora solo navegamos a la página principal
    this.router.navigate(['/']);
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
