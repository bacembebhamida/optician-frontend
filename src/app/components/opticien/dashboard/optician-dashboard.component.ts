import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Appointment, Order, Prescription, Product } from '../../../models/models';

@Component({
  selector: 'app-optician-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './optician-dashboard.component.html',
  styleUrls: ['./optician-dashboard.component.css']
})
export class OpticianDashboardComponent implements OnInit {

  appointments: Appointment[] = [];
  orders: Order[] = [];
  prescriptions: Prescription[] = [];
  products: Product[] = [];
  isLoading: boolean = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.apiService.getAppointments().subscribe(apps => this.appointments = apps);
    this.apiService.getOrders().subscribe(ords => this.orders = ords);
    this.apiService.getPrescriptions().subscribe(press => this.prescriptions = press);
    this.apiService.getProducts().subscribe(prods => {
      this.products = prods;
      this.isLoading = false;
    });
  }

  updateAppointmentStatus(appointment: Appointment, status: string): void {
    if (!appointment.id) return;
    this.apiService.updateAppointmentStatus(appointment.id, status).subscribe(updated => {
      appointment.status = updated.status;
    });
  }

  updateOrderStatus(order: Order, status: string): void {
    if (!order.id) return;
    this.apiService.updateOrderStatus(order.id, status).subscribe(updated => {
      order.status = updated.status;
    });
  }
}
