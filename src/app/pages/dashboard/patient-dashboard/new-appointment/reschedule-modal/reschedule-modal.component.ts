// src/app/pages/dashboard/patient-dashboard/new-appointment/reschedule-modal/reschedule-modal.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AppointmentService } from '../../../../../core/services/new-appointment.service';
import { TimeSlot } from '../../../../../core/interfaces/appointment.interface';

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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './reschedule-modal.component.html',
  styleUrls: ['./reschedule-modal.component.css']
})
export class RescheduleModalComponent implements OnInit {
  rescheduleForm: FormGroup;
  availableTimeSlots: TimeSlot[] = [];
  isLoading = false;

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
    this.isLoading = true;
    this.appointmentService.getAvailableTimeSlots(
      this.data.doctorId,
      this.data.originalDate
    ).subscribe({
      next: (slots) => {
        this.availableTimeSlots = slots.sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading time slots:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.rescheduleForm.valid) {
      const selectedTime = this.rescheduleForm.get('selectedTime')?.value;
      this.dialogRef.close({
        rescheduled: true,
        time: selectedTime
      });
    }
  }

  onCancel() {
    this.dialogRef.close({ rescheduled: false });
  }
}
