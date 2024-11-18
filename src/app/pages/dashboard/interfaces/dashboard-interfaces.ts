// src/app/pages/dashboard/interfaces/dashboard-interfaces.ts

// Interfaz para las citas transformadas (vista)
export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  specialty: string;
  consultingRoom: string;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

// Interfaz para la respuesta del backend
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

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
}
