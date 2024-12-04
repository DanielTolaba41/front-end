// src/app/pages/dashboard/patient-dashboard/new-appointment/reschedule-modal/reschedule-modal.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AppointmentService } from '../../../../../core/services/new-appointment.service';
import { TimeSlot } from '../../../../../core/interfaces/appointment.interface';
import { finalize } from 'rxjs/operators';

export interface RescheduleModalData {
  doctorId: string;
  originalDate: string;
  originalTime: string;
  specialtyName: string;
  doctorName: string;
}

@Component({
  selector: 'app-reschedule-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './reschedule-modal.component.html',
  styleUrls: ['./reschedule-modal.component.css']
})
export class RescheduleModalComponent implements OnInit {
  rescheduleForm: FormGroup;
  availableTimeSlots: TimeSlot[] = [];
  nearestTimeSlots: TimeSlot[] = [];
  isLoading = false;
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RescheduleModalComponent>,
    private appointmentService: AppointmentService,
    @Inject(MAT_DIALOG_DATA) public data: RescheduleModalData
  ) {
    this.rescheduleForm = this.fb.group({
      selectedTime: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadAvailableTimeSlots();
  }

  private loadAvailableTimeSlots() {
    if (this.isLoading) return; // Prevenir múltiples llamadas mientras carga

    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentService.getAvailableTimeSlots(
      this.data.doctorId,
      this.data.originalDate
    ).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (slots) => {
        this.availableTimeSlots = slots.sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );
        this.findNearestTimeSlots();
      },
      error: (error) => {
        console.error('Error loading time slots:', error);
        this.errorMessage = 'No se pudieron cargar los horarios disponibles';
      }
    });
  }

  private findNearestTimeSlots() {
    const originalTime = this.data.originalTime;

    const { before, after } = this.availableTimeSlots.reduce(
      (acc, slot) => {
        if (slot.startTime < originalTime) {
          acc.before.push(slot);
        } else if (slot.startTime > originalTime) {
          acc.after.push(slot);
        }
        return acc;
      },
      { before: [] as TimeSlot[], after: [] as TimeSlot[] }
    );

    const nearestBefore = before.slice(-2);
    const nearestAfter = after.slice(0, 2);
    this.nearestTimeSlots = [...nearestBefore, ...nearestAfter];
  }

  hasAvailableSlots(): boolean {
    return this.nearestTimeSlots.length > 0;
  }

  onSubmit() {
    if (this.isSubmitting || !this.rescheduleForm.valid) return; // Prevenir múltiples envíos

    this.isSubmitting = true;
    this.errorMessage = '';
    const selectedTime = this.rescheduleForm.get('selectedTime')?.value;

    // Verificar nuevamente que el horario esté disponible antes de cerrar el modal
    this.appointmentService.getAvailableTimeSlots(
      this.data.doctorId,
      this.data.originalDate
    ).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: (slots) => {
        const isStillAvailable = slots.some(slot => slot.startTime === selectedTime);
        if (isStillAvailable) {
          this.dialogRef.close({
            rescheduled: true,
            time: selectedTime
          });
        } else {
          this.errorMessage = 'El horario seleccionado ya no está disponible. Por favor, seleccione otro horario.';
          this.loadAvailableTimeSlots(); // Recargar horarios disponibles
        }
      },
      error: (error) => {
        console.error('Error verificando disponibilidad:', error);
        this.errorMessage = 'Error al verificar disponibilidad del horario';
      }
    });
  }

  onCancel() {
    if (!this.isSubmitting) {
      this.dialogRef.close({ rescheduled: false });
    }
  }

  getSlotDescription(slot: TimeSlot): string {
    return slot.startTime < this.data.originalTime ?
      'Horario anterior disponible' :
      'Horario posterior disponible';
  }
}
