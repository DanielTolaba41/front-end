// src/app/pages/dashboard/interfaces/dashboard-interfaces.ts

import { Doctor } from "../../../core/interfaces/doctor.interface";
import { User } from "../../../core/interfaces/user.interfaces";

export enum AppointmentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  CONFIRMED = 'CONFIRMED'
}

export interface DashboardUser {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  specialty?: string;
  consultingRoom?: string;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  specialty: string;
  consultingRoom: string;
  doctor: Doctor;
  patient: User;
  description: string;
  status: AppointmentStatus;
  patientName?: string;
}

export interface ApiAppointment {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reason: string;
  doctor_id: string;
  doctor: {
    id: string;
    consultingRoom: string;
    specialty: {
      id: string;
      name: string;
    };
    user: {
      name: string;
      lastName: string;
    };
  };
}
