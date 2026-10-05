import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OptiVisionService } from '../../../services/optivision.service';
import { AppointmentService, OptiStore, Appointment } from '../../../models/optivision.models';

@Component({
  selector: 'app-rdv',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rdv.component.html',
  styleUrls: ['./rdv.component.css']
})
export class RdvComponent implements OnInit {

  currentStep: number = 1;
  stores: OptiStore[] = [];

  // Wizard Selections
  selectedService: AppointmentService = 'EXAMEN_VUE';
  selectedStore: OptiStore | null = null;
  selectedDate: string = '2026-09-20';
  selectedTimeSlot: string = '10:30';

  clientName: string = 'Sonia Ben Ammar';
  clientEmail: string = 'sonia.benammar@optivision.tn';
  clientPhone: string = '+216 22 456 789';
  notes: string = '';

  isSubmitted: boolean = false;
  createdAppointment: Appointment | null = null;

  servicesList = [
    { type: 'EXAMEN_VUE' as AppointmentService, title: 'Examen de Vue & Bilan Réfractif', duration: '30 min', icon: 'fa-solid fa-eye', desc: 'Bilan complet de votre acuité visuelle avec matériel de haute précision.' },
    { type: 'CONSEIL_LUNETTES' as AppointmentService, title: 'Conseil Lunettes & Morphologie Visage', duration: '45 min', icon: 'fa-solid fa-glasses', desc: 'Accompagnement stylistique par un opticien spécialisé.' },
    { type: 'ADAPTATION_LENTILLES' as AppointmentService, title: 'Adaptation Lentilles de Contact', duration: '30 min', icon: 'fa-solid fa-circle-dot', desc: 'Essais de lentilles souples ou rigides et apprentissage de la manipulation.' },
    { type: 'RETOUCHE_LUNETTES' as AppointmentService, title: 'Ajustement & Retouche de Monture', duration: '15 min', icon: 'fa-solid fa-screwdriver-wrench', desc: 'Ajustement des branches, changement de plaquettes et nettoyage ultrasonique.' },
    { type: 'CONTROLE_VISUEL' as AppointmentService, title: 'Contrôle Visuel de Suivi', duration: '20 min', icon: 'fa-solid fa-stethoscope', desc: 'Vérification du confort de vos nouveaux verres.' }
  ];

  timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

  constructor(private optiService: OptiVisionService) {}

  ngOnInit(): void {
    this.optiService.getStores().subscribe(storesList => {
      this.stores = storesList;
      if (this.stores.length > 0) this.selectedStore = this.stores[0];
    });
  }

  nextStep(): void {
    if (this.currentStep < 5) this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  confirmBooking(): void {
    if (!this.selectedStore) return;

    const appt: Appointment = {
      serviceType: this.selectedService,
      storeName: this.selectedStore.name,
      date: this.selectedDate,
      timeSlot: this.selectedTimeSlot,
      clientName: this.clientName,
      clientEmail: this.clientEmail,
      clientPhone: this.clientPhone,
      notes: this.notes,
      status: 'CONFIRME'
    };

    this.optiService.addAppointment(appt).subscribe(created => {
      this.createdAppointment = created;
      this.isSubmitted = true;
    });
  }
}
