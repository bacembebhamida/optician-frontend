import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Patient } from '../../../models/models';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css']
})
export class PatientListComponent implements OnInit {

  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  searchQuery: string = '';
  showCreateModal: boolean = false;

  // New Patient Form
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phone: string = '';
  dateOfBirth: string = '1995-06-20';
  address: string = '';
  city: string = '';
  notes: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.apiService.getPatients().subscribe(data => {
      this.patients = data;
      this.applyFilter();
    });
  }

  applyFilter(): void {
    if (!this.searchQuery) {
      this.filteredPatients = this.patients;
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredPatients = this.patients.filter(p => 
        p.firstName.toLowerCase().includes(q) || 
        p.lastName.toLowerCase().includes(q) || 
        p.email.toLowerCase().includes(q)
      );
    }
  }

  createPatient(): void {
    const newPatient: Patient = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      dateOfBirth: this.dateOfBirth,
      address: this.address,
      city: this.city,
      notes: this.notes
    };

    this.apiService.createPatient(newPatient).subscribe(created => {
      this.patients.push(created);
      this.applyFilter();
      this.showCreateModal = false;
      this.resetForm();
    });
  }

  resetForm(): void {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.phone = '';
    this.address = '';
    this.city = '';
    this.notes = '';
  }
}
