//src/app/pages/dashboard/patient-dashboard/profile/profile.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  profileForm: FormGroup;
  editMode = false;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstName: [{value: 'Juan', disabled: true}, Validators.required],
      lastName: [{value: 'Pérez', disabled: true}, Validators.required],
      email: [{value: 'juan@example.com', disabled: true}, [Validators.required, Validators.email]],
      phone: [{value: '123-456-7890', disabled: true}, Validators.required],
      address: [{value: 'Calle Principal 123', disabled: true}, Validators.required]
    });
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log(this.profileForm.value);
      this.toggleEditMode();
    }
  }
}
