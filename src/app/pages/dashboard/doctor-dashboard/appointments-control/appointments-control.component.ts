//src/pages/dashboard/doctor
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService } from '../../../../core/services/appointments.service';
import { AppointmentPatient, AppointmentStatus } from '../../../../core/interfaces/appointment.interface';
import { PatientService } from '../../../../core/services/patient.service';
import { Patient } from '../../../../core/interfaces/user.interfaces';
import { interval, startWith, Subscription, switchMap } from 'rxjs';
import { ConfirmationModalComponent } from './confirmation-modal.component';


@Component({
  selector: 'app-appointments-control',
  standalone: true,
  imports: [CommonModule, FormsModule,ConfirmationModalComponent ],
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

  showConfirmModal = false;
  modalTitle = '';
  modalMessage = '';
  pendingAction: (() => void) | null = null;


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

  openConfirmationModal(title: string, message: string, action: () => void) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.pendingAction = action;
    this.showConfirmModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmModal = false;
    this.pendingAction = null;
  }

  executeAction() {
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.closeConfirmationModal();
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


   changeStatus(appointment: AppointmentPatient, newStatus: AppointmentStatus): void {
    let message = '';
    switch (newStatus) {
      case AppointmentStatus.PROCESSING:
        message = '¿Desea iniciar esta cita?';
        break;
      case AppointmentStatus.COMPLETED:
        message = '¿Desea marcar esta cita como completada?';
        break;
      case AppointmentStatus.CANCELLED:
        message = '¿Está seguro que desea cancelar esta cita?';
        break;
      case AppointmentStatus.NOSHOW:
        message = '¿Desea marcar esta cita como no asistida?';
        break;
    }

    this.openConfirmationModal(
      'Confirmar acción',
      message,
      () => this.executeStatusChange(appointment, newStatus)
    );
  }

  private executeStatusChange(appointment: AppointmentPatient, newStatus: AppointmentStatus) {
    this.isLoading = true;

    this.appointmentsService.updateAppointmentStatus(appointment.id, newStatus)
      .subscribe({
        next: (updatedAppointment) => {
          console.log('Appointment status updated:', updatedAppointment);
          appointment.status = newStatus;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating appointment status:', error);
          this.error = 'Error al actualizar el estado de la cita';
          this.isLoading = false;
        }
      });
  }


  getStatusText(status: string): string {
    const statusTexts = {
      [AppointmentStatus.PENDING]: 'Pendiente',
      [AppointmentStatus.PROCESSING]: 'En Proceso',
      [AppointmentStatus.COMPLETED]: 'Completada',
      [AppointmentStatus.CANCELLED]: 'Cancelada',
      [AppointmentStatus.NOSHOW]: 'No Asistió'
    };
    return statusTexts[status as AppointmentStatus] || status;
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
      if (this.patientCache.has(id)) {
        const cachedPatient = this.patientCache.get(id)!;
        console.log('Patient data from cache:', cachedPatient);
        resolve(this.formatPatientName(cachedPatient));
        return;
      }

      this.patientService.getDataPatient(id).subscribe({
        next: (patient) => {
          // Imprimir la respuesta completa del servicio
          console.log('Raw patient data from service:', patient);

          // Verificar la estructura completa del objeto user
          console.log('User object:', patient.user);

          // Guardar en caché
          this.patientCache.set(id, patient);

          // Verificamos si name existe en lugar de firstName
          const name = patient.user.name || patient.user.firstName || '';
          const lastName = patient.user.lastName || '';

          console.log('Name properties:', {
            name: patient.user.name,
            lastName: patient.user.lastName
          });

          const fullName = `${name} ${lastName}`.trim();
          resolve(fullName);
        },
        error: (error) => {
          console.error('Error fetching patient data:', error);
          reject('Error al cargar paciente');
        }
      });
    });
  }

  private formatPatientName(patient: Patient): string {
    // Imprimir el objeto patient completo
    console.log('Full patient object:', patient);

    if (!patient?.user) {
      return 'Nombre no disponible';
    }

    // Verificar si existe name o firstName
    const name = patient.user.name || '';
    const lastName = patient.user.lastName || '';

    console.log('Name components:', {
      name: patient.user.name,
      lastName: patient.user.lastName
    });

    return name && lastName ? `${name} ${lastName}`.trim() : lastName || 'Nombre no disponible';
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
