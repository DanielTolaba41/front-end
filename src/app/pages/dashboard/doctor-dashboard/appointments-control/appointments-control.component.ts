//src/pages/dashboard/doctor
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Appointment {
  id: string;
  date: Date;
  time: string;
  patientName: string;
  appointmentType: string;
  consultingRoom: string;
  description: string;
  status: 'pendiente' | 'cancelada' | 'completada';
}

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

  // Datos de ejemplo
  appointments: Appointment[] = [
    {
      id: '1',
      date: new Date(),
      time: '09:00',
      patientName: 'Ana García',
      appointmentType: 'Control',
      consultingRoom: 'Consultorio 101',
      description: 'Control mensual',
      status: 'pendiente'
    },
    {
      id: '2',
      date: new Date(),
      time: '10:30',
      patientName: 'Carlos Ruiz',
      appointmentType: 'Primera Consulta',
      consultingRoom: 'Consultorio 101',
      description: 'Consulta por dolor en el pecho',
      status: 'completada'
    },
    {
      id: '3',
      date: new Date(),
      time: '11:00',
      patientName: 'María López',
      appointmentType: 'Control',
      consultingRoom: 'Consultorio 101',
      description: 'Seguimiento tratamiento',
      status: 'cancelada'
    }
  ];

  changeStatus(appointment: Appointment, newStatus: 'pendiente' | 'cancelada' | 'completada'): void {
    appointment.status = newStatus;
  }

  getFilteredAppointments(): Appointment[] {
    let filtered = [...this.appointments].sort((a, b) =>
      a.time.localeCompare(b.time)
    );

    if (this.filterStatus !== 'todos') {
      filtered = filtered.filter(app => app.status === this.filterStatus);
    }

    return filtered;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  onDateChange(event: any): void {
    this.selectedDate = new Date(event.target.value);
    // Aquí podrías cargar las citas para la nueva fecha seleccionada
  }
}
