import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OptiVisionService } from '../../../services/optivision.service';
import { Prescription } from '../../../models/optivision.models';

@Component({
  selector: 'app-prescription',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.css']
})
export class PrescriptionComponent implements OnInit {

  prescriptions: Prescription[] = [];
  isManualEntry: boolean = false;
  uploadFileName: string | null = null;
  savedSuccess: boolean = false;

  // New Prescription Form State
  prescriberName: string = 'Dr. Jalel Ben Mbarek';
  prescriptionDate: string = '2026-03-01';

  odSphere: number = -2.25;
  odCylinder: number = -0.50;
  odAxis: number = 90;
  odAddition: number = 1.50;

  ogSphere: number = -2.50;
  ogCylinder: number = -0.75;
  ogAxis: number = 85;
  ogAddition: number = 1.50;

  pd: number = 63;
  notes: string = '';

  constructor(private optiService: OptiVisionService) {}

  ngOnInit(): void {
    this.optiService.getPrescriptions().subscribe(list => {
      this.prescriptions = list;
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadFileName = file.name;
    }
  }

  savePrescription(): void {
    const p: Prescription = {
      id: Date.now(),
      prescriberName: this.prescriberName,
      prescriptionDate: this.prescriptionDate,
      isVerified: true,
      documentUrl: this.uploadFileName ? `https://optivision.tn/uploads/${this.uploadFileName}` : undefined,
      odSphere: this.odSphere,
      odCylinder: this.odCylinder,
      odAxis: this.odAxis,
      odAddition: this.odAddition,
      ogSphere: this.ogSphere,
      ogCylinder: this.ogCylinder,
      ogAxis: this.ogAxis,
      ogAddition: this.ogAddition,
      pd: this.pd,
      notes: this.notes
    };

    this.optiService.savePrescription(p).subscribe(saved => {
      this.savedSuccess = true;
      setTimeout(() => this.savedSuccess = false, 4000);
    });
  }
}
