// src/app/core/services/appointments.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

import { AppointmentStatus, Appointment } from '../interfaces/appointment.interface';

//export type AppointmentStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'reprogramada';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private readonly baseUrl = 'https://srfm-back-end.onrender.com';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Métodos generales
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => console.log('All appointments:', response)),
      catchError(this.handleError)
    );
  }

  // Métodos para pacientes
  getPatientAppointments(patientId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/patient/${patientId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(appointments => console.log('Patient appointments:', appointments)),
      catchError(this.handleError)
    );
  }

  // Métodos específicos para doctores
  getDoctorAppointments(doctorId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/doctor/${doctorId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(appointments => console.log('Doctor appointments:', appointments)),
      catchError(this.handleError)
    );
  }

  getDoctorAppointmentsByDate(doctorId: string, date: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/doctor/${doctorId}/date/${date}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(appointments => console.log('Doctor appointments by date:', appointments)),
      catchError(this.handleError)
    );
  }

  getDoctorUpcomingAppointments(doctorId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/doctor/${doctorId}/upcoming`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(appointments => console.log('Doctor upcoming appointments:', appointments)),
      catchError(this.handleError)
    );
  }

  getDoctorTodayAppointments(doctorId: string): Observable<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/doctor/${doctorId}/date/${today}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(appointments => console.log('Doctor today appointments:', appointments)),
      catchError(this.handleError)
    );
  }

  // Métodos de búsqueda y filtrado
  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/${date}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => console.log('Appointments by date:', response)),
      catchError(this.handleError)
    );
  }

  getAppointmentsByDateRange(startDate: string, endDate: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${this.baseUrl}/appointments/range/${startDate}/${endDate}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(appointments => console.log('Appointments in range:', appointments)),
      catchError(this.handleError)
    );
  }

  // Métodos de gestión de citas
  updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/appointments/${appointmentId}`, // Removemos '/status' de la URL
      { status },
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => console.log('Status update response:', response)),
      catchError(this.handleError)
    );
  }

  addAppointmentNotes(appointmentId: string, notes: string): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.baseUrl}/appointments/${appointmentId}/notes`,
      { notes },
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(appointment => console.log('Updated appointment notes:', appointment)),
      catchError(this.handleError)
    );
  }

  rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string
  ): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.baseUrl}/appointments/${appointmentId}/reschedule`,
      { date: newDate, time: newTime },
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(appointment => console.log('Rescheduled appointment:', appointment)),
      catchError(this.handleError)
    );
  }

  // Método de manejo de errores mejorado
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error en el servicio de citas';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Datos de la cita inválidos';
          break;
        case 401:
          errorMessage = 'No autorizado para realizar esta operación';
          break;
        case 403:
          errorMessage = 'No tiene permisos para acceder a estas citas';
          break;
        case 404:
          errorMessage = 'Cita no encontrada';
          break;
        case 409:
          errorMessage = 'Conflicto con el horario de la cita';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.error.message}`;
      }
    }

    console.error('Error en AppointmentsService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
