export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  profileImage?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export enum UserRole {
  ADMIN = 'admin',
  PATIENT = 'patient',
  DOCTOR = 'doctor'
}

// Interfaces adicionales relacionadas con el usuario
export interface UserProfile extends Partial<User> {
  fullName?: string;
  age?: number;
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string;
}

export interface UserSettings {
  userId: number;
  notifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: string;
  theme: 'light' | 'dark';
}
