// src/app/app.routes.ts

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/landing-page/landing-page.component')
        .then(m => m.LandingPageComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login/login.component')
            .then(m => m.LoginComponent)
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./pages/auth/signup/signup.component')
            .then(m => m.SignupComponent)
      }
    ]
  },
  {
    path: 'dashboard/patient',
    loadComponent: () =>
      import('./pages/dashboard/patient-dashboard/patient-dashboard.component')
        .then(m => m.PatientDashboardComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'appointments'
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./pages/dashboard/patient-dashboard/appointments/appointments.component')
            .then(m => m.AppointmentsComponent)
      },
      {
        path: 'new-appointment',
        loadComponent: () =>
          import('./pages/dashboard/patient-dashboard/new-appointment/new-appointment.component')
            .then(m => m.NewAppointmentComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/dashboard/patient-dashboard/profile/profile.component')
            .then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: 'dashboard/doctor',
    loadComponent: () =>
      import('./pages/dashboard/doctor-dashboard/doctor-dashboard.component')
        .then(m => m.DoctorDashboardComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'appointments'
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./pages/dashboard/doctor-dashboard/appointments/appointments.component')
            .then(m => m.AppointmentsComponent)
      },
      {
        path: 'appointments-control',
        loadComponent: () =>
          import('./pages/dashboard/doctor-dashboard/appointments-control/appointments-control.component')
            .then(m => m.AppointmentsControlComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/dashboard/doctor-dashboard/profile/profile.component')
            .then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

export default routes;
