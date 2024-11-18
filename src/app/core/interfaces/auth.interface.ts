// src/app/core/interfaces/auth.interface.ts

export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    email: string;
    role: UserRole;
  }
}

export interface RegisterRequest {
  name: string;
  lastName: string;
  phone: string;
  document: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    email: string;
    role: UserRole;
  }
}

export interface User {
  email: string;
  role: UserRole;
}
