import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  editMode = false;

  doctor = {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    specialty: 'Cardiología',
    email: 'juan.perez@ejemplo.com',
    phone: '123-456-7890',
    consultingRoom: 'Consultorio 101',
    professionalLicense: 'MED-12345',
    schedule: 'Lunes a Viernes 9:00 - 17:00',
    about: 'Especialista en Cardiología con más de 10 años de experiencia.',
    // Cambiamos la ruta de la imagen a una que sabemos que existe o usamos una URL de datos
    profileImage: 'assets/images/default-avatar.png' // Asegúrate de tener esta imagen en tu proyecto
  };

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstName: [{value: '', disabled: true}, Validators.required],
      lastName: [{value: '', disabled: true}, Validators.required],
      specialty: [{value: '', disabled: true}, Validators.required],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
      phone: [{value: '', disabled: true}, Validators.required],
      consultingRoom: [{value: '', disabled: true}, Validators.required],
      professionalLicense: [{value: '', disabled: true}, Validators.required],
      schedule: [{value: '', disabled: true}, Validators.required],
      about: [{value: '', disabled: true}]
    });
  }

  ngOnInit() {
    this.profileForm.patchValue(this.doctor);
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
      this.doctor = {
        ...this.doctor,
        ...this.profileForm.value
      };
      this.toggleEditMode();
    }
  }

  cancelEdit() {
    this.profileForm.patchValue(this.doctor);
    this.toggleEditMode();
  }
}
