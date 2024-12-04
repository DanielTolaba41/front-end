//src/pages/dashboard/doctor
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService } from '../../../../core/services/appointments.service';
import { AppointmentPatient, AppointmentStatus } from '../../../../core/interfaces/appointment.interface';
import { PatientService } from '../../../../core/services/patient.service';
import { Patient } from '../../../../core/interfaces/user.interfaces';


@Component({
  selector: 'app-appointments-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments-control.component.html',
  styleUrls: ['./appointments-control.component.css']
})
export class AppointmentsControlComponent {
  selectedDate: Date = new Date();
  filterStatus: string = 'todos';
  weeks: Date[][] = [];
  isLoading: boolean = false;
  error: string | null = null;
  appointments: AppointmentPatient[] = [];
  AppointmentStatus = AppointmentStatus;
  private patientCache = new Map<string, Patient>();
  private intervalId: any;

  constructor(
    private appointmentsService: AppointmentsService,
    private patientService: PatientService
  ) { }

  ngOnInit() {
    console.log('Component initialized');
    this.loadAppointments();
    this.startPolling();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  loadAppointments() {
    this.isLoading = true;
    this.error = null;

    this.appointmentsService.getAppointments().subscribe({
      next: async (response: any) => {
        this.appointments = await this.transformAppointments(response);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las citas';
        this.isLoading = false;
        console.error('Error loading appointments:', error);
      }
    });
    complete: () => {
      setInterval(() => this.loadAppointments(), 1000); 
    }
  }

  private async transformAppointments(appointments: any[]): Promise<AppointmentPatient[]> {
    try {
      const transformedAppointments = await Promise.all(appointments.map(async (apt: any) => {
        try {
          const patientName = await this.getPatient(apt.patient.id);
          
          return {
            id: apt.id || '',
            date: apt.appointmentDate || '',
            time: apt.appointmentTime || '',
            patientName,
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
    this.loadAppointments()
    const inputDate = (event.target as HTMLInputElement).value;
    const [year, month, day] = inputDate.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    console.log('Fecha seleccionada:', localDate);
    this.selectedDate = localDate;
  }

  private adjustToLocalDate = (date: string) => {
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset());
    return localDate;
  };


  private getPatient(id: string): Promise<string> {
    return new Promise((resolve) => {
      if (this.patientCache.has(id)) {
        const cachedPatient = this.patientCache.get(id)!;
        resolve(`${cachedPatient.user.firstName} ${cachedPatient.user.lastName}`);
        return;
      }

      this.patientService.getDataPatient(id).subscribe({
        next: (patient) => {
          this.patientCache.set(id, patient);
          resolve(`${patient.user.name} ${patient.user.lastName}`);
        },
        error: (error) => {
          console.error('Error fetching patient data:', error);
          resolve('Error al cargar paciente');
        }
      });
    });
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

  private startPolling() {
    this.intervalId = setInterval(() => {
      this.loadAppointments();
    }, 5000); // Ajusta el intervalo según tus necesidades (en milisegundos)
  }

  private stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

}
