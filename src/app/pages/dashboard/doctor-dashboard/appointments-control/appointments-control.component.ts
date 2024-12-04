//src/pages/dashboard/doctor
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService } from '../../../../core/services/appointments.service';
import { AppointmentPatient, AppointmentStatus } from '../../../../core/interfaces/appointment.interface';
import { DoctorService } from '../../../../core/services/doctor.service';


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

  constructor(
    private appointmentsService: AppointmentsService,
    private doctorService: DoctorService
  ) { }

  ngOnInit() {
    console.log('Component initialized');
    //this.generateCalendar();
    this.loadAppointments();
  }

  loadAppointments() {
    this.isLoading = true;
    this.error = null;
    console.log('appointment');
    this.appointmentsService.getAppointments().subscribe({
      next: (response: any) => {
        this.appointments = this.transformAppointments(response);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las citas';
        this.isLoading = false;
      }
    });
  }
  private transformAppointments(appointments: any[]): AppointmentPatient[] {
    console.log('appointment:', appointments.pop() );
    return appointments.map((apt: any) => {
      try {
        return {
          id: apt.id || '',
          date: apt.appointmentDate || '',
          time: apt.appointmentTime || '',
          patientName: this.getPatient(apt.patient.id),
          description: apt.reason || 'Sin descripción',
          status: apt.status || 'PENDING',
          doctor: {
            id: apt.doctor?.id || '',
            user: apt.doctor?.user || {},
            specialty: apt.doctor?.specialty || {},
          },
          patient: {
            id: apt.patient?.id || '',
            firstName: apt.patient?.user?.firstName || '',
            lastName: apt.patient?.user?.lastName || '',
            email: apt.patient?.user?.email || '',
          }
        };
      } catch (error) {
        console.error('Error transforming appointment:', apt, error);
        return {
          id: '',
          date: '',
          time: '',
          patientName: 'Error en datos',
          description: 'Error en datos',
          status: 'PENDING',
          doctor: {
            id: '',
            user: {},
            specialty: {},
            licenseNumber: '',
            consultingRoom: ''
          },
          patient: {
            id: '',
            firstName: '',
            lastName: '',
            email: '',
            role: '',
            createdAt: '',
            updatedAt: '',
            isActive: false
          }
        };
      }
    });
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


  private getPatient(id: string): string{
    return 'Ana Salvatierra'
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
  }

  private adjustToLocalDate = (date: string) => {
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset());
    return localDate;
  };

}
