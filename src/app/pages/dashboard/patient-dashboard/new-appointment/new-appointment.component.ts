// src/app/pages/dashboard/patient-dashboard/new-appointment/new-appointment.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppointmentService } from '../../../../core/services/new-appointment.service';
import { AppointmentRequest, AppointmentResponse, TimeSlot } from '../../../../core/interfaces/appointment.interface';
import { Doctor } from '../../../../core/interfaces/doctor.interface';
import { Specialty } from '../../../../core/interfaces/specialty.interface';
import { AuthService } from '../../../../core/services/auth.service';
import { RescheduleModalComponent, RescheduleModalData } from './reschedule-modal/reschedule-modal.component';

interface AppointmentFormControls {
  specialtyId: FormControl<string | null>;
  doctorId: FormControl<string | null>;
  appointmentDate: FormControl<string | null>;
  appointmentTime: FormControl<string | null>;
  reason: FormControl<string | null>;
}

@Component({
  selector: 'app-new-appointment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './new-appointment.component.html',
  styleUrls: ['./new-appointment.component.css']
})
export class NewAppointmentComponent implements OnInit {
  appointmentForm!: FormGroup<AppointmentFormControls>;
  specialties: Specialty[] = [];
  doctors: Doctor[] = [];
  availableTimeSlots: TimeSlot[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  minDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSpecialties();
  }


  private initForm(): void {
    this.appointmentForm = this.fb.group<AppointmentFormControls>({
      specialtyId: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      doctorId: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      appointmentDate: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      appointmentTime: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      reason: this.fb.control('')
    });

    this.setupFormSubscriptions();
  }

  private setupFormSubscriptions(): void {
    this.appointmentForm.get('specialtyId')?.valueChanges.subscribe(specialtyId => {
      if (specialtyId) {
        const selectedSpecialty = this.specialties.find(s => s.id === specialtyId);
        if (selectedSpecialty) {
          this.loadDoctorsBySpecialtyName(selectedSpecialty);
        }
        this.appointmentForm.patchValue({
          doctorId: '',
          appointmentTime: ''
        });
      } else {
        this.doctors = [];
      }
    });

    this.appointmentForm.get('doctorId')?.valueChanges.subscribe(() => {
      this.checkAndLoadTimeSlots();
    });

    this.appointmentForm.get('appointmentDate')?.valueChanges.subscribe(() => {
      this.checkAndLoadTimeSlots();
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.appointmentForm.value;
      const selectedDate = new Date(formValue.appointmentDate ?? '');
      selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset());

      const appointmentRequest: AppointmentRequest = {
        doctorId: formValue.doctorId ?? '',
        appointmentDate: selectedDate,
        appointmentTime: formValue.appointmentTime ?? '',
        reason: formValue.reason ?? ''
      };

      this.createAppointment(appointmentRequest);
    } else {
      this.markFormGroupTouched(this.appointmentForm);
    }
  }

  private createAppointment(appointmentRequest: AppointmentRequest) {
    this.appointmentService.createAppointment(appointmentRequest).subscribe({
      next: (response) => this.handleSuccessfulBooking(response),
      error: (error) => {
        if (error.code === 'CONCURRENT_BOOKING') {
          this.handleConcurrencyError(appointmentRequest);
        } else {
          this.errorMessage = error.message || 'No se pudo agendar la cita';
          this.isLoading = false;
        }
      }
    });
  }

  private handleSuccessfulBooking(response: AppointmentResponse) {
    this.successMessage = 'La cita se ha agendado correctamente';
    const userRole = this.authService.getCurrentUser()?.role.toLowerCase();
    const appointmentsRoute = `/dashboard/${userRole}/appointments`;

    setTimeout(() => {
      this.router.navigate([appointmentsRoute])
        .then(() => console.log('Navegación exitosa a:', appointmentsRoute))
        .catch(err => {
          console.error('Error en la navegación:', err);
          this.errorMessage = 'Error al redireccionar';
        });
      this.isLoading = false;
    }, 1500);
  }

  private handleConcurrencyError(originalRequest: AppointmentRequest): void {
    const selectedDoctor = this.doctors.find(d => d.id === originalRequest.doctorId);
    const selectedSpecialty = this.specialties.find(s =>
      s.id === this.appointmentForm.get('specialtyId')?.value
    );

    const dialogRef = this.dialog.open(RescheduleModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        doctorId: originalRequest.doctorId,
        originalDate: originalRequest.appointmentDate.toISOString().split('T')[0],
        originalTime: originalRequest.appointmentTime,
        specialtyName: selectedSpecialty?.name || '',
        doctorName: selectedDoctor ?
          `${selectedDoctor.user.name} ${selectedDoctor.user.lastName}` : ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isLoading = false;

      if (result?.rescheduled) {
        const newRequest = {
          ...originalRequest,
          appointmentTime: result.time
        };

        this.isLoading = true;
        this.createAppointment(newRequest);
      }
    });
  }

  private loadSpecialties(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentService.getSpecialties().subscribe({
      next: (specialties) => {
        this.specialties = specialties;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar especialidades:', error);
        this.errorMessage = 'No se pudieron cargar las especialidades';
        this.isLoading = false;
      }
    });
  }

  private loadDoctorsBySpecialtyName(specialty: Specialty): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentService.getDoctorsBySpecialtyName(specialty.name).subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar doctores:', error);
        this.errorMessage = 'No se pudieron cargar los doctores';
        this.isLoading = false;
      }
    });
  }

  private checkAndLoadTimeSlots(): void {
    const doctorId = this.appointmentForm.get('doctorId')?.value;
    const date = this.appointmentForm.get('appointmentDate')?.value;

    if (doctorId && date) {
      this.loadAvailableTimeSlots(doctorId, date);
    } else {
      this.availableTimeSlots = [];
      this.appointmentForm.get('appointmentTime')?.setValue('');
    }
  }

  private loadAvailableTimeSlots(doctorId: string, date: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentService.getAvailableTimeSlots(doctorId, date).subscribe({
      next: (slots) => {
        this.availableTimeSlots = slots || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar horarios disponibles:', error);
        this.errorMessage = 'No se pudieron cargar los horarios disponibles';
        this.availableTimeSlots = [];
        this.isLoading = false;
      }
    });
  }

  get formControls() {
    return this.appointmentForm.controls;
  }

  resetForm(): void {
    this.appointmentForm.reset();
    this.doctors = [];
    this.availableTimeSlots = [];
    this.errorMessage = '';
    this.successMessage = '';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getDoctorFullName(doctor: Doctor): string {
    return `${doctor.user.name} ${doctor.user.lastName}`;
  }
}
