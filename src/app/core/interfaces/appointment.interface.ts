// src/app/core/interfaces/appointment.interface.ts
export enum AppointmentStatus {
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NOSHOW = 'NOSHOW',     // Cambiamos NO_SHOW a NOSHOW para que coincida
  PROCESSING = 'INPROCESS',
  PENDING = 'PENDING'
}


export interface AppointmentRequest {
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: string;
  reason?: string;
}

export interface AppointmentResponse {
  id: string;
  doctor: {
    id: string;
    user: {
      name: string;
      lastName: string;
      email: string;
    };
    specialty: {
      name: string;
    };
    consultingRoom: string;
  };
  patient: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  appointmentDate: Date;
  appointmentTime: string;
  reason?: string;
  status: AppointmentStatus;
}
export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface TimeSlotResponse {
  availableTimeSlots: TimeSlot[];
}
export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  specialty: string;
  consultingRoom: string;
  description?: string;
  status: string;
}
export interface AppointmentPatient {
  id: string;
  date: string;
  time: string;
  patientName: string;
  description?: string;
  status: string;
}
