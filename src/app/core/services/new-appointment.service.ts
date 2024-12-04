// src/app/core/services/new-appointment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  AppointmentRequest,
  AppointmentResponse,
  TimeSlot,
} from '../interfaces/appointment.interface';
import { Doctor } from '../interfaces/doctor.interface';
import { Specialty } from '../interfaces/specialty.interface';

export interface ConcurrencyError {
  code: 'CONCURRENT_BOOKING';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly baseUrl = 'https://srfm-back-end.onrender.com';

  constructor(private http: HttpClient) {}

  getSpecialties(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(`${this.baseUrl}/specialties`);
  }

  getDoctorsBySpecialty(specialtyId: string): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/doctor/doctors/specialty/${specialtyId}`);
  }

  getDoctorsBySpecialtyName(specialtyName: string): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/doctor/specialty-name/${specialtyName}`);
  }

  getAvailableTimeSlots(doctorId: string, date: string): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${this.baseUrl}/appointments/available-slots`, {
      params: { doctorId, date }
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching time slots:', error);
        return throwError(() => new Error('Error al obtener horarios disponibles'));
      })
    );
  }

  createAppointment(appointmentRequest: AppointmentRequest): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(
      `${this.baseUrl}/appointments`,
      appointmentRequest
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 409) {
          // Error de concurrencia
          const concurrencyError: ConcurrencyError = {
            code: 'CONCURRENT_BOOKING',
            message: 'El horario seleccionado ya no está disponible'
          };
          return throwError(() => concurrencyError);
        }
        // Otros errores
        return throwError(() => new Error(error.error?.message || 'Error al crear la cita'));
      })
    );
  }

  // Método para manejar la reprogramación
  rescheduleAppointment(appointmentRequest: AppointmentRequest): Observable<AppointmentResponse> {
    return this.createAppointment(appointmentRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 409) {
          return throwError(() => ({
            code: 'CONCURRENT_BOOKING',
            message: 'El nuevo horario seleccionado ya no está disponible'
          }));
        }
        return throwError(() => error);
      })
    );
  }
}
