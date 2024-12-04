// src/app/core/services/doctor.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly baseUrl = 'https://srfm-back-end.onrender.com/doctor';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getDoctorByEmail(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/email/${email}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error al obtener doctor:', error);
        return throwError(() => new Error('Error al cargar la información del doctor'));
      })
    );
  }


  getAllDoctors(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, {
      headers: this.getHeaders()
    });
  }

  getDoctorById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  getDoctorsBySpecialty(specialtyId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/specialty/${specialtyId}`, {
      headers: this.getHeaders()
    });
  }

  getDoctorsBySpecialtyName(specialtyName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/specialty-name/${specialtyName}`, {
      headers: this.getHeaders()
    });
  }
}
