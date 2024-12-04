import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class PatientService {
    private readonly baseUrl = 'https://srfm-back-end.onrender.com/patient';

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

    getDataPatient(id: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/user/${id}`, {
            headers: this.getHeaders()
        });
    }
}