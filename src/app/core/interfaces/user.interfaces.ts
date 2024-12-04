export enum UserRole {
  ADMIN = 'admin',
  PATIENT = 'patient',
  DOCTOR = 'doctor'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  profileImage?: string;
  phoneNumber?: string;
}

export interface Patient {
  id: string;
  user: User;
}