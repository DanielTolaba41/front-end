// src/app/pages/dashboard/doctor-dashboard/appointments/doctor-appointments.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsService } from '../../../../core/services/appointments.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { Appointment, AppointmentStatus } from '../../interfaces/dashboard-interfaces';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.css']
})
export class DoctorAppointmentsComponent implements OnInit {
  currentMonth: Date = new Date();
  weeks: Date[][] = [];
  selectedDate: Date | null = null;
  appointments: Appointment[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  doctorId: string = '';

  constructor(
    private appointmentsService: AppointmentsService,
    private authService: AuthService,
    private doctorService: DoctorService
  ) {}

  async ngOnInit() {
    this.generateCalendar();
    this.selectedDate = new Date();
    await this.initializeDoctorData();
  }

  private async initializeDoctorData() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.email) {
      this.isLoading = true;
      try {
        const doctorInfo = await firstValueFrom(this.doctorService.getDoctorByEmail(currentUser.email));
        this.doctorId = doctorInfo.id;
        await this.loadAppointments();
      } catch (error) {
        console.error('Error initializing doctor data:', error);
        this.error = 'Error al cargar la información del doctor';
      } finally {
        this.isLoading = false;
      }
    }
  }

  private async loadAppointments() {
    if (!this.doctorId) return;

    this.isLoading = true;
    try {
      const appointments = await firstValueFrom(
        this.appointmentsService.getDoctorAppointments(this.doctorId)
      );
      this.appointments = appointments.filter(app => app.doctor.id === this.doctorId);
    } catch (error) {
      console.error('Error loading appointments:', error);
      this.error = 'Error al cargar las citas';
    } finally {
      this.isLoading = false;
    }
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    this.weeks = [];
    let currentWeek = [];

    const endDay = new Date(lastDay);
    endDay.setDate(endDay.getDate() + (6 - endDay.getDay()));

    let currentDay = new Date(startDate);

    while (currentDay <= endDay) {
      if (currentWeek.length === 7) {
        this.weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const nextDay = new Date(currentDay);
        currentWeek.push(nextDay);
        currentDay.setDate(currentDay.getDate() + 1);
      }
      this.weeks.push(currentWeek);
    }
  }

  previousMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  async selectDate(date: Date) {
    this.selectedDate = new Date(date);
    if (this.doctorId) {
      this.isLoading = true;
      this.error = null;
      try {
        const formattedDate = date.toISOString().split('T')[0];
        const appointments = await firstValueFrom(
          this.appointmentsService.getAppointmentsByDate(formattedDate)
        );
        this.appointments = appointments.filter(app => app.doctor.id === this.doctorId);
      } catch (error) {
        console.error('Error loading appointments for date:', error);
        this.error = 'Error al cargar las citas para la fecha seleccionada';
      } finally {
        this.isLoading = false;
      }
    }
  }
  getAppointmentsForDate(date: Date): Appointment[] {
    return this.appointments.filter(appointment =>
      this.isSameDay(new Date(appointment.date), date)
    );
  }

  getAppointmentsCount(date: Date): number {
    return this.getAppointmentsForDate(date).length;
  }

  hasAppointments(date: Date): boolean {
    return this.getAppointmentsForDate(date).length > 0;
  }

  isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  isSelectedMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth();
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  getPatientFullName(appointment: Appointment): string {
    return `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  }

  async updateAppointmentStatus(appointmentId: string, newStatus: AppointmentStatus) {
    try {
      await firstValueFrom(
        this.appointmentsService.updateAppointmentStatus(appointmentId, newStatus)
      );
      // Recargar las citas después de actualizar el estado
      if (this.selectedDate) {
        await this.selectDate(this.selectedDate);
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      this.error = 'Error al actualizar el estado de la cita';
    }
  }
}
