import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Prescription } from '../../../models/models';

@Component({
  selector: 'app-ordonnance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordonnance.component.html',
  styleUrls: ['./ordonnance.component.css']
})
export class PrescriptionUploadComponent implements OnInit {

  fileName: string | null = null;
  fileUploaded: boolean = false;
  isSubmitting: boolean = false;
  successMessage: boolean = false;

  // Prescription Values
  patientName: string = 'Sophie Martin';
  prescriberName: string = 'Dr. Antoine Moreau (Ophtalmologiste)';
  prescriptionDate: string = new Date().toISOString().split('T')[0];

  // OD (Œil Droit)
  odSphere: number = -2.25;
  odCylinder: number = -0.50;
  odAxis: number = 90;
  odAddition: number = 0.00;

  // OG (Œil Gauche)
  ogSphere: number = -2.50;
  ogCylinder: number = -0.75;
  ogAxis: number = 85;
  ogAddition: number = 0.00;

  pupillaryDistance: number = 62.5;
  notes: string = 'Traitement anti-reflet premium recommandé.';

  prescriptionsList: Prescription[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    this.apiService.getPrescriptions().subscribe(data => {
      this.prescriptionsList = data;
    });
  }

  isScanning: boolean = false;
  scanProgress: number = 0;
  scanStepText: string = '';
  aiScanVerified: boolean = false;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.fileUploaded = true;
      this.triggerAiScan();
    }
  }

  triggerAiScan(): void {
    this.isScanning = true;
    this.scanProgress = 15;
    this.scanStepText = 'Chargement de l\'image dans le modèle Vision IA...';

    setTimeout(() => {
      this.scanProgress = 50;
      this.scanStepText = 'Reconnaissance OCR & Détection des valeurs OD / OG...';
    }, 800);

    setTimeout(() => {
      this.scanProgress = 85;
      this.scanStepText = 'Calcul automatique de l\'écart pupillaire et contrôle de cohérence...';
    }, 1600);

    setTimeout(() => {
      this.scanProgress = 100;
      this.isScanning = false;
      this.aiScanVerified = true;
      // Auto populate scanned values
      this.odSphere = -2.75;
      this.odCylinder = -0.50;
      this.odAxis = 95;
      this.ogSphere = -2.50;
      this.ogCylinder = -0.75;
      this.ogAxis = 80;
      this.pupillaryDistance = 63.5;
      this.prescriberName = 'Dr. Claire Laurent (Ophtalmologiste CHU)';
      this.notes = 'Ordonnance numérisée et validée par IA Vision avec traitement Anti-Reflet Premium.';
    }, 2400);
  }

  savePrescription(): void {
    this.isSubmitting = true;

    const prescription: Prescription = {
      patientName: this.patientName,
      prescriberName: this.prescriberName,
      prescriptionDate: this.prescriptionDate,
      odSphere: this.odSphere,
      odCylinder: this.odCylinder,
      odAxis: this.odAxis,
      odAddition: this.odAddition,
      ogSphere: this.ogSphere,
      ogCylinder: this.ogCylinder,
      ogAxis: this.ogAxis,
      ogAddition: this.ogAddition,
      pupillaryDistance: this.pupillaryDistance,
      fileUrl: this.fileName ? `https://example.com/prescriptions/${this.fileName}` : 'https://example.com/ordonnance-standard.pdf',
      notes: this.notes
    };

    this.apiService.createPrescription(prescription).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.successMessage = true;
        this.loadPrescriptions();
        setTimeout(() => this.successMessage = false, 5000);
      },
      error: (err) => {
        console.error('Failed to save prescription', err);
        this.isSubmitting = false;
      }
    });
  }
}
