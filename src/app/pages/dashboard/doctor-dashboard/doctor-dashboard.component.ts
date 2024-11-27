// src/app/pages/dashboard/doctor-dashboard/doctor-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { UserRole } from '../../../core/interfaces/auth.interface';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  sidebarOpen = true;
  isLoading = true;
  error: string | null = null;
  doctorInfo: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private doctorService: DoctorService
  ) {
    const currentUser = this.authService.getCurrentUser();
    if (!this.authService.isLoggedIn() || currentUser?.role !== UserRole.DOCTOR) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.doctorInfo = {
      user: {
        name: '',
        lastName: ''
      }
    };
  }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.email) {
      this.doctorService.getDoctorByEmail(currentUser.email).subscribe({
        next: (data) => {
          console.log('Doctor data:', data);
          this.doctorInfo = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading doctor info:', err);
          this.error = 'Error al cargar la información';
          this.isLoading = false;
        }
      });
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleProfileMenu(): void {
    console.log('Toggle profile menu');
  }

  logout(): void {
    this.authService.logout();
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
