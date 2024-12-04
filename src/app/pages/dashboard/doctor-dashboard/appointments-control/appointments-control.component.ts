//src/pages/dashboard/doctor
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService } from '../../../../core/services/appointments.service';
import { AppointmentPatient, AppointmentStatus } from '../../../../core/interfaces/appointment.interface';
import { PatientService } from '../../../../core/services/patient.service';
import { Patient } from '../../../../core/interfaces/user.interfaces';
import { interval, startWith, Subscription, switchMap } from 'rxjs';


@Component({
  selector: 'app-appointments-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments-control.component.html',
  styleUrls: ['./appointments-control.component.css']
})
export class AppointmentsControlComponent implements OnInit, OnDestroy {
  selectedDate: Date = new Date();
  filterStatus: string = 'todos';
  weeks: Date[][] = [];
  isLoading: boolean = false;
  error: string | null = null;
  appointments: AppointmentPatient[] = [];
  AppointmentStatus = AppointmentStatus;
  private patientCache = new Map<string, Patient>();

  private pollingSubscription?: Subscription;
  private readonly POLLING_INTERVAL = 30000; 

  constructor(
    private appointmentsService: AppointmentsService,
    private patientService: PatientService
  ) { }

  ngOnInit() {
    this.startPolling();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  private startPolling() {

    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(
        startWith(0), // Comienza inmediatamente
        switchMap(() => {
          console.log('Polling appointments...');
          return new Promise<void>((resolve) => {
            this.loadAppointments(false);
            resolve();
          });
        })
      )
      .subscribe();
  }

  private stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }


  loadAppointments(showLoading: boolean = true) {
    if (showLoading) {
      this.isLoading = true;
    }
    this.error = null;

    this.appointmentsService.getAppointments().subscribe({
      next: async (response: any) => {
        const newAppointments = await this.transformAppointments(response);
        
        if (this.hasAppointmentsChanged(newAppointments)) {
          console.log('Appointments updated!');
          this.appointments = newAppointments;
        }
        
        if (showLoading) {
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.error = 'Error al cargar las citas';
        if (showLoading) {
          this.isLoading = false;
        }
        console.error('Error loading appointments:', error);
      }
    });
  }

  private hasAppointmentsChanged(newAppointments: AppointmentPatient[]): boolean {
    if (this.appointments.length !== newAppointments.length) {
      return true;
    }

    return newAppointments.some(newAppointment => {
      const existingAppointment = this.appointments.find(a => a.id === newAppointment.id);
      if (!existingAppointment) return true;

      return (
        existingAppointment.status !== newAppointment.status ||
        existingAppointment.time !== newAppointment.time ||
        existingAppointment.date !== newAppointment.date ||
        existingAppointment.patientName !== newAppointment.patientName
      );
    });
  }

  private async transformAppointments(appointments: any[]): Promise<AppointmentPatient[]> {
    try {
      const transformedAppointments = await Promise.all(appointments.map(async (apt: any) => {
        try {
          if (!apt.patient?.id) {
            console.error('Invalid patient ID for appointment:', apt);
            return this.getDefaultAppointment();
          }
  
          // Obtener y construir el nombre completo del paciente
          const patientFullName = await this.getPatient(apt.patient.id);
          
          return {
            id: apt.id || '',
            date: apt.appointmentDate || '',
            time: apt.appointmentTime || '',
            patientName: patientFullName,
            description: apt.reason || 'Sin descripción',
            status: apt.status || 'PENDING',
          };
        } catch (error) {
          console.error('Error transforming appointment:', apt, error);
          return this.getDefaultAppointment();
        }
      }));
  
      return transformedAppointments;
    } catch (error) {
      console.error('Error in transformAppointments:', error);
      return [];
    }
  }
    

  changeStatus(appointment: AppointmentPatient, newStatus: AppointmentStatus ): void {
    appointment.status = newStatus;
  }

  getFilteredAppointments(): AppointmentPatient[] {
    let filtered = [...this.appointments].sort((a, b) =>
      a.time.localeCompare(b.time)
    );

    if (this.filterStatus !== 'todos') {
      filtered = filtered.filter(app => app.status === this.filterStatus);
    }

    filtered = filtered.filter(app => {
      const appointmentDate = this.adjustToLocalDate(app.date);
      const selectedDate = this.adjustToLocalDate(this.selectedDate.toISOString());

      appointmentDate.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      return appointmentDate.getTime() === selectedDate.getTime();
    });

    return filtered;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  onDateChange(event: Event): void {
    const inputDate = (event.target as HTMLInputElement).value;
    const [year, month, day] = inputDate.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    console.log('Fecha seleccionada:', localDate);
    this.selectedDate = localDate;

    this.stopPolling();
    this.startPolling();
  }

  private adjustToLocalDate = (date: string) => {
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset());
    return localDate;
  };


  private getPatient(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Verificar el caché primero
      if (this.patientCache.has(id)) {
        const cachedPatient = this.patientCache.get(id)!;
        resolve(this.formatPatientName(cachedPatient));
        return;
      }
  
      // Si no está en caché, obtener del servicio
      this.patientService.getDataPatient(id).subscribe({
        next: (patient) => {
          // Guardar en caché
          this.patientCache.set(id, patient);
          // Formatear y devolver el nombre completo
          resolve(this.formatPatientName(patient));
        },
        error: (error) => {
          console.error('Error fetching patient data:', error);
          reject('Error al cargar paciente');
        }
      });
    });
  }

  private formatPatientName(patient: Patient): string {
    // Verificar que existan tanto el objeto user como sus propiedades
    if (!patient?.user) {
      return 'Nombre no disponible';
    }
  
    const firstName = patient.user.firstName || '';
    const lastName = patient.user.lastName || '';
  
    // Log para debugging
    console.log('Formatting name:', { firstName, lastName, patient });
  
    return firstName && lastName ? `${firstName} ${lastName}`.trim() : 'Nombre no disponible';
  }

  private getDefaultAppointment(): AppointmentPatient {
    return {
      id: '',
      date: '',
      time: '',
      patientName: 'Error en datos',
      description: 'Error en datos',
      status: 'PENDING',
    };
  }
}
