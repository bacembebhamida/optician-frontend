import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Product, Patient, Prescription, Order,
  Appointment, Store, Promotion, NotificationLog
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products/category/${category}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`);
  }

  // Patients
  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.baseUrl}/patients`);
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/patients/${id}`);
  }

  createPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(`${this.baseUrl}/patients`, patient);
  }

  // Prescriptions
  getPrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.baseUrl}/prescriptions`);
  }

  createPrescription(prescription: Prescription): Observable<Prescription> {
    return this.http.post<Prescription>(`${this.baseUrl}/prescriptions`, prescription);
  }

  // Appointments
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments`);
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments`, appointment);
  }

  updateAppointmentStatus(id: number, status: string): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.baseUrl}/appointments/${id}/status?status=${status}`, {});
  }

  // Orders
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, order);
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/orders/${id}/status?status=${status}`, {});
  }

  // Stores
  getStores(): Observable<Store[]> {
    return this.http.get<Store[]>(`${this.baseUrl}/stores`);
  }

  createStore(store: Store): Observable<Store> {
    return this.http.post<Store>(`${this.baseUrl}/stores`, store);
  }

  // Promotions
  getPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.baseUrl}/promotions`);
  }

  validatePromoCode(code: string): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.baseUrl}/promotions/validate/${code}`);
  }

  createPromotion(promotion: Promotion): Observable<Promotion> {
    return this.http.post<Promotion>(`${this.baseUrl}/promotions`, promotion);
  }

  // Notifications
  sendNotification(notification: NotificationLog): Observable<NotificationLog> {
    return this.http.post<NotificationLog>(`${this.baseUrl}/notifications/send`, notification);
  }
}
