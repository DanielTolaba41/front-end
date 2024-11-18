// src/app/core/services/appointments.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Appointment } from '../../pages/dashboard/interfaces/dashboard-interfaces';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private readonly baseUrl = 'https://srfm-back-end.onrender.com'; // Asegúrate de que la URL base sea correcta

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => console.log('API Response:', response))
    );
  }

  getPatientAppointments(patientId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/patient/${patientId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getDoctorAppointments(doctorId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/doctor/${doctorId}`, {
      headers: this.getAuthHeaders()
    });
  }

   // Para obtener citas por fecha específica
  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/${date}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        console.log('API Response:', response);
      })
    );
  }
}
