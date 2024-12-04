// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { UserRole } from './core/interfaces/auth.interface';

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
    canActivate: [publicGuard],
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
    path: 'dashboard',
    children: [
      {
        path: 'patient',
        canActivate: [AuthGuard],
        data: { role: UserRole.PATIENT },
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
        path: 'doctor',
        canActivate: [AuthGuard],
        data: { role: UserRole.DOCTOR },
        loadComponent: () =>
          import('./pages/dashboard/doctor-dashboard/doctor-dashboard.component')
            .then(m => m.DoctorDashboardComponent),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'appointments-control'  // Cambiado de 'appointments' a 'appointments-control'
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
 /*     {
        path: 'admin',
        canActivate: [AuthGuard],
        data: { role: UserRole.ADMIN },
        loadComponent: () =>
          import('./pages/dashboard/admin-dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'users'
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./pages/dashboard/admin-dashboard/users/users.component')
                .then(m => m.UsersComponent)
          },
          {
            path: 'specialties',
            loadComponent: () =>
              import('./pages/dashboard/admin-dashboard/specialties/specialties.component')
                .then(m => m.SpecialtiesComponent)
          }
        ]
      }*/
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

export default routes;
