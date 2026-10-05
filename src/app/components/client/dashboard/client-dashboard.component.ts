import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OptiVisionService } from '../../../services/optivision.service';
import { AuthRoleService } from '../../../services/auth-role.service';
import { Appointment, Order, Prescription, Product, LoyaltyProfile, NotificationItem } from '../../../models/optivision.models';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {

  activeTab: 'DASHBOARD' | 'PROFIL' | 'COMMANDES' | 'RDV' | 'ORDONNANCES' | 'FAVORIS' | 'LOYALTY' | 'NOTIFS' = 'DASHBOARD';

  appointments: Appointment[] = [];
  orders: Order[] = [];
  prescriptions: Prescription[] = [];
  favoriteProducts: Product[] = [];
  notifications: NotificationItem[] = [];
  loyalty!: LoyaltyProfile;
  currentUser = { fullName: '', email: '', phone: '' };

  constructor(
    public optiService: OptiVisionService,
    private auth: AuthRoleService
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = { fullName: user.fullName, email: user.email, phone: '' };
      }
    });
    this.loyalty = this.optiService.loyalty;

    this.optiService.getAppointments().subscribe(apps => this.appointments = apps);
    this.optiService.getOrders().subscribe(ords => this.orders = ords);
    this.optiService.getPrescriptions().subscribe(prescs => this.prescriptions = prescs);
    this.optiService.getNotifications().subscribe(notifs => this.notifications = notifs);

    this.optiService.getProducts().subscribe(prods => {
      this.optiService.favoriteIds$.subscribe(favIds => {
        this.favoriteProducts = prods.filter(p => favIds.includes(p.id));
      });
    });
  }

  get activeOrder(): Order | null {
    return this.orders.length > 0 ? this.orders[0] : null;
  }

  get upcomingAppointment(): Appointment | null {
    return this.appointments.length > 0 ? this.appointments[0] : null;
  }

  get latestPrescription(): Prescription | null {
    return this.prescriptions.length > 0 ? this.prescriptions[0] : null;
  }
}
