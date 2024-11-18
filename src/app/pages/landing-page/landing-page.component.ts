// src/app/pages/landing-page/landing-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  features = [
    {
      icon: '/images/icons/calendar-icon.png',
      title: 'Agenda Fácil',
      description: 'Programa tus citas médicas en minutos, 24/7'
    },
    {
      icon: '/images/icons/doctor-icon.png',
      title: 'Doctores Expertos',
      description: 'Accede a los mejores especialistas'
    },
    {
      icon: '/images/icons/security-icon.png',
      title: 'Seguro y Confiable',
      description: 'Tu información está protegida con nosotros'
    }
  ];

  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToSignup() {
    this.router.navigate(['/auth/signup']);
  }
}
