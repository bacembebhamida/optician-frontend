import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { OptiVisionService } from '../../../services/optivision.service';
import { AuthRoleService, UserProfile } from '../../../services/auth-role.service';
import { OptiStore, Product, Order, Prescription } from '../../../models/optivision.models';

export type AdminTab =
  | 'OVERVIEW'
  | 'PRODUCTS'
  | 'ORDERS'
  | 'PRESCRIPTIONS'
  | 'APPOINTMENTS'
  | 'STORES'
  | 'USERS'
  | 'AUDIT_LOG';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  target: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface AppointmentItem {
  id: string;
  time: string;
  clientName: string;
  clientPhone: string;
  service: string;
  opticien: string;
  storeCity: string;
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface TopProductItem {
  id: number;
  name: string;
  brand: string;
  category: string;
  unitsSold: number;
  revenueTnd: number;
  imageUrl: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  // ── Shell UI State ──────────────────────────────────────────────────
  activeTab: AdminTab = 'OVERVIEW';
  isSidebarCollapsed: boolean = false;
  isMobileSidebarOpen: boolean = false;
  isNotificationsOpen: boolean = false;
  isProfileOpen: boolean = false;
  isCatalogueOpen: boolean = true;
  isInventaireOpen: boolean = true;
  globalSearchQuery: string = '';

  // ── Filters State ───────────────────────────────────────────────────
  selectedStoreFilter: string = 'ALL';
  selectedPeriodFilter: '7D' | '30D' | '3M' | '12M' = '30D';
  selectedCategoryFilter: string = 'ALL';

  // ── Data Collections ────────────────────────────────────────────────
  stores: OptiStore[] = [];
  products: Product[] = [];
  orders: Order[] = [];
  prescriptions: Prescription[] = [];
  currentUser: UserProfile | null = null;

  // ── Product Creation Form ───────────────────────────────────────────
  showAddProductModal: boolean = false;
  newProductBrand: string = 'RAY-BAN';
  newProductName: string = '';
  newProductModel: string = '';
  newProductCategory: Product['category'] = 'LUNETTES_VUE';
  newProductMaterial: Product['material'] = 'ACETATE';
  newProductShape: Product['shape'] = 'CARRE';
  newProductPrice: number | null = null;
  newProductStock: number = 15;
  newProductStore: string = 'Tunis Centre';
  newProductImageUrl: string = '';
  imagePreviewUrl: string | null = null;

  onProductImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.imagePreviewUrl = result;
        this.newProductImageUrl = result;
      };
      reader.readAsDataURL(file);
    }
  }

  readonly productCategories: { value: Product['category']; label: string }[] = [
    { value: 'LUNETTES_VUE', label: 'Lunettes de vue' },
    { value: 'LUNETTES_SOLEIL', label: 'Lunettes de soleil' },
    { value: 'LENTILLES', label: 'Lentilles de contact' },
    { value: 'ACCESSOIRES', label: 'Accessoires & Produits' }
  ];
  readonly productMaterials: Product['material'][] = ['TITANE', 'ACETATE', 'METAL', 'BOIS', 'INJECTE'];
  readonly productShapes: Product['shape'][] = ['OVALE', 'CARRE', 'ROND', 'RECTANGLE', 'PAPILLON', 'AVIATEUR'];

  // ── New Store Form ─────────────────────────────────────────────────
  newStoreName: string = '';
  newStoreCity: string = '';
  newStoreAddress: string = '';
  newStorePhone: string = '';
  newStoreHours: string = 'Lun - Sam : 09:00 - 19:30';
  selectedStoreServices: string[] = ['Examen de Vue', 'Conseil Optique'];
  readonly storeServices = [
    'Examen de Vue',
    'Conseil Optique',
    'Adaptation Lentilles',
    'Taillage express',
    'Service Après-Vente'
  ];

  // ── Today's Appointments Data ──────────────────────────────────────
  appointments: AppointmentItem[] = [
    { id: 'RDV-101', time: '09:30', clientName: 'Sonia Ben Ali', clientPhone: '+216 22 456 789', service: 'Examen de vue complet', opticien: 'Dr. Ben Mbarek', storeCity: 'Tunis Centre', status: 'CONFIRMED' },
    { id: 'RDV-102', time: '10:45', clientName: 'Amine Trabelsi', clientPhone: '+216 24 770 314', service: 'Adaptation lentilles rigides', opticien: 'Yasmine Gharbi', storeCity: 'La Marsa', status: 'CONFIRMED' },
    { id: 'RDV-103', time: '14:00', clientName: 'Mariem Gharbi', clientPhone: '+216 98 468 526', service: 'Conseil montures haute couture', opticien: 'Karem Saidi', storeCity: 'Sousse', status: 'PENDING' },
    { id: 'RDV-104', time: '15:30', clientName: 'Mohamed Dridi', clientPhone: '+216 55 123 456', service: 'Vérification ordonnance & centrage', opticien: 'Dr. Ben Mbarek', storeCity: 'Tunis Centre', status: 'CONFIRMED' },
    { id: 'RDV-105', time: '17:00', clientName: 'Leila Bouaziz', clientPhone: '+216 97 889 900', service: 'Contrôle visuel annuel', opticien: 'Slim Karray', storeCity: 'Sfax', status: 'COMPLETED' }
  ];

  // ── Top Selling Eyewear ─────────────────────────────────────────────
  topProducts: TopProductItem[] = [
    { id: 1, name: 'RX 5228 Optical', brand: 'RAY-BAN', category: 'Lunettes de vue', unitsSold: 48, revenueTnd: 21600, imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&auto=format&fit=crop&q=80' },
    { id: 2, name: 'FT5634 Titanium Luxury', brand: 'TOM FORD', category: 'Lunettes de vue', unitsSold: 32, revenueTnd: 25280, imageUrl: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&auto=format&fit=crop&q=80' },
    { id: 3, name: 'Aviator Classic Gold', brand: 'RAY-BAN', category: 'Lunettes de soleil', unitsSold: 29, revenueTnd: 15080, imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&auto=format&fit=crop&q=80' },
    { id: 4, name: 'Square Signature Edition', brand: 'GUCCI', category: 'Lunettes de soleil', unitsSold: 21, revenueTnd: 18690, imageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400&auto=format&fit=crop&q=80' }
  ];

  // ── Users & Roles (RBAC) ────────────────────────────────────────────
  usersList = [
    { id: 'USR-01', username: 'sonia.benammar', fullName: 'Sonia Ben Ammar', role: 'ROLE_CLIENT', email: 'sonia.benammar@optivision.tn', phone: '+216 22 456 789', status: 'Actif', city: 'Tunis' },
    { id: 'USR-02', username: 'amine.trabelsi', fullName: 'Amine Trabelsi', role: 'ROLE_CLIENT', email: 'amine.trabelsi@optivision.tn', phone: '+216 24 770 314', status: 'Actif', city: 'La Marsa' },
    { id: 'USR-03', username: 'mariem.gharbi', fullName: 'Mariem Gharbi', role: 'ROLE_CLIENT', email: 'mariem.gharbi@optivision.tn', phone: '+216 98 468 526', status: 'Actif', city: 'Sousse' },
    { id: 'USR-04', username: 'dr.benmbarek', fullName: 'Dr. Jalel Ben Mbarek', role: 'ROLE_OPTICIAN', email: 'j.benmbarek@optivision.tn', phone: '+216 21 830 111', status: 'Actif', city: 'Tunis Centre' },
    { id: 'USR-05', username: 'opticien.marsa', fullName: 'Yasmine Gharbi', role: 'ROLE_OPTICIAN', email: 'marsa@optivision.tn', phone: '+216 71 740 222', status: 'Actif', city: 'La Marsa' },
    { id: 'USR-06', username: 'direction.admin', fullName: 'Direction OptiVision', role: 'ROLE_ADMIN', email: 'admin@optivision.tn', phone: '+216 71 830 111', status: 'Actif', city: 'Siège Social' }
  ];

  // ── RBAC Matrix ─────────────────────────────────────────────────────
  readonly rolePermissions = [
    { module: 'Tableau de bord KPI', superAdmin: true, admin: true, opticien: true, vendeur: false },
    { module: 'Produits & Montures', superAdmin: true, admin: true, opticien: true, vendeur: true },
    { module: 'Stock & Transferts', superAdmin: true, admin: true, opticien: true, vendeur: false },
    { module: 'Commandes Clients', superAdmin: true, admin: true, opticien: true, vendeur: true },
    { module: 'Ordonnances Médicales', superAdmin: true, admin: true, opticien: true, vendeur: false },
    { module: 'Rendez-vous Examens', superAdmin: true, admin: true, opticien: true, vendeur: true },
    { module: 'Comptes & Droits', superAdmin: true, admin: true, opticien: false, vendeur: false },
    { module: 'Journal d’Audit System', superAdmin: true, admin: true, opticien: false, vendeur: false }
  ];

  // ── Audit Log Trail ─────────────────────────────────────────────────
  auditLogs: AuditLogEntry[] = [
    { id: 'LOG-9941', timestamp: '15/09/2026 16:42', user: 'Direction OptiVision', role: 'SUPER_ADMIN', action: 'Certification ordonnance #ORD-882', module: 'Ordonnances', target: 'Client: Sonia Ben Ali', ipAddress: '197.26.14.88', status: 'SUCCESS' },
    { id: 'LOG-9940', timestamp: '15/09/2026 15:10', user: 'Dr. Jalel Ben Mbarek', role: 'OPTICIEN', action: 'Transfert verres taillage -> Expédition', module: 'Commandes', target: 'Réf: OPT-2026-904', ipAddress: '197.26.14.90', status: 'SUCCESS' },
    { id: 'LOG-9939', timestamp: '15/09/2026 14:05', user: 'Yasmine Gharbi', role: 'OPTICIEN', action: 'Ajout référence Tom Ford FT5634', module: 'Produits', target: 'Stock La Marsa', ipAddress: '197.26.88.12', status: 'SUCCESS' },
    { id: 'LOG-9938', timestamp: '15/09/2026 11:30', user: 'Direction OptiVision', role: 'SUPER_ADMIN', action: 'Mise à jour rôles utilisateurs', module: 'Sécurité RBAC', target: 'Utilisateur: USR-05', ipAddress: '197.26.14.88', status: 'SUCCESS' },
    { id: 'LOG-9937', timestamp: '15/09/2026 09:15', user: 'Système Automatique', role: 'SYSTEM', action: 'Alerte stock faible déclenchée', module: 'Inventaire', target: '17 articles sous le seuil', ipAddress: '127.0.0.1', status: 'WARNING' }
  ];

  // ── System Notifications ───────────────────────────────────────────
  notifications = [
    { id: 1, type: 'WARNING', title: 'Stock Faible Décelé', message: '17 références sous le seuil de réapprovisionnement.', time: 'Il y a 25 min' },
    { id: 2, type: 'INFO', title: 'Nouvelle Ordonnance', message: 'Ordonnance importée par Sonia Ben Ali à valider.', time: 'Il y a 1h' },
    { id: 3, type: 'SUCCESS', title: 'Commande Prête', message: 'Commande OPT-2026-904 prête au taillage express.', time: 'Il y a 2h' }
  ];

  constructor(
    private optiService: OptiVisionService,
    private auth: AuthRoleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.optiService.getStores().subscribe(data => this.stores = data);
    this.optiService.getProducts().subscribe(data => this.products = data);
    this.optiService.getOrders().subscribe(data => this.orders = data);
    this.optiService.getPrescriptions().subscribe(data => this.prescriptions = data);
    this.auth.currentUser$.subscribe(user => this.currentUser = user);

    // Ouverture directe d'un onglet depuis la sidebar du shell admin (ex: /admin/dashboard?tab=ORDERS)
    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      if (tab && this.isValidTab(tab)) {
        this.activeTab = tab as AdminTab;
      }
    });
  }

  private isValidTab(tab: string): boolean {
    return ['OVERVIEW', 'PRODUCTS', 'ORDERS', 'PRESCRIPTIONS', 'APPOINTMENTS', 'STORES', 'USERS', 'AUDIT_LOG'].includes(tab);
  }

  // ── Tab Title & Breadcrumbs ────────────────────────────────────────
  get currentTabTitle(): string {
    const titles: Record<AdminTab, string> = {
      OVERVIEW: 'Tableau de bord',
      PRODUCTS: 'Catalogue & Stock',
      ORDERS: 'Commandes & Suivi Labo',
      PRESCRIPTIONS: 'Ordonnances Médicales',
      APPOINTMENTS: 'Rendez-vous Optiques',
      STORES: 'Réseau de Boutiques',
      USERS: 'Utilisateurs & Droits RBAC',
      AUDIT_LOG: 'Journal d’Audit Système'
    };
    return titles[this.activeTab];
  }

  selectTab(tab: AdminTab): void {
    this.activeTab = tab;
    this.isMobileSidebarOpen = false;
  }

  // ── KPI Calculated Getters ─────────────────────────────────────────
  get totalRevenueTnd(): number {
    return this.orders.reduce((sum, o) => sum + o.totalTnd, 0);
  }

  get activeLabOrders(): number {
    return this.orders.filter(order => order.status === 'TAILLAGE_VERRES' || order.status === 'VALIDEE').length;
  }

  get certifiedPrescriptions(): number {
    return this.prescriptions.filter(prescription => prescription.isVerified).length;
  }

  get pendingPrescriptionsCount(): number {
    return this.prescriptions.filter(p => !p.isVerified).length;
  }

  get lowStockProducts(): Product[] {
    return this.products.filter(product => !product.inStock);
  }

  get clients(): typeof this.usersList {
    return this.usersList.filter(user => user.role === 'ROLE_CLIENT');
  }

  get filteredProducts(): Product[] {
    return this.products.filter(p => {
      const matchesSearch = !this.globalSearchQuery ||
        p.name.toLowerCase().includes(this.globalSearchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(this.globalSearchQuery.toLowerCase()) ||
        p.model.toLowerCase().includes(this.globalSearchQuery.toLowerCase());
      const matchesCategory = this.selectedCategoryFilter === 'ALL' || p.category === this.selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }

  // ── Store Actions ──────────────────────────────────────────────────
  toggleStoreService(service: string): void {
    this.selectedStoreServices = this.selectedStoreServices.includes(service)
      ? this.selectedStoreServices.filter(item => item !== service)
      : [...this.selectedStoreServices, service];
  }

  addStore(): void {
    if (!this.newStoreName || !this.newStoreCity) return;
    const store: OptiStore = {
      id: Date.now(),
      name: this.newStoreName,
      city: this.newStoreCity,
      address: this.newStoreAddress || 'Avenue Principale',
      phone: this.newStorePhone || '+216 71 000 000',
      openingHours: this.newStoreHours || 'Lun - Sam : 09:00 - 19:30',
      imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&auto=format&fit=crop&q=80',
      services: this.selectedStoreServices.length ? this.selectedStoreServices : ['Examen de Vue', 'Conseil Optique'],
      lat: 36.8,
      lng: 10.1
    };

    this.optiService.addStore(store).subscribe(() => {
      this.newStoreName = '';
      this.newStoreCity = '';
      this.newStoreAddress = '';
      this.newStorePhone = '';
      this.newStoreHours = 'Lun - Sam : 09:00 - 19:30';
      this.selectedStoreServices = ['Examen de Vue', 'Conseil Optique'];
    });
  }

  // ── Product Actions ────────────────────────────────────────────────
  addProduct(): void {
    if (!this.newProductName.trim() || !this.newProductBrand.trim() || !this.newProductPrice || this.newProductPrice <= 0) return;

    const product: Product = {
      id: Date.now(),
      brand: this.newProductBrand.trim().toUpperCase(),
      model: this.newProductModel.trim() || 'Nouveau modèle',
      name: this.newProductName.trim(),
      category: this.newProductCategory,
      priceTnd: this.newProductPrice,
      gender: 'UNISEX',
      shape: this.newProductShape,
      material: this.newProductMaterial,
      style: 'MODERNE',
      color: 'Noir / Or',
      colorsAvailable: [{ name: 'Noir / Or', hex: '#111827' }],
      size: '52-18-140',
      description: 'Monture de précision sélectionnée par nos opticiens diplômés.',
      imageUrl: this.newProductImageUrl || this.imagePreviewUrl || 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
      secondaryImageUrl: this.newProductImageUrl || 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80',
      inStock: true,
      isNewArrival: true,
      isPopular: false,
      tryOn3dAvailable: true,
      rating: 5,
      reviewCount: 1
    };

    this.optiService.addProduct(product).subscribe(() => {
      this.newProductName = '';
      this.newProductModel = '';
      this.newProductPrice = null;
      this.newProductImageUrl = '';
      this.imagePreviewUrl = null;
      this.showAddProductModal = false;
    });
  }

  toggleStock(product: Product): void {
    product.inStock = !product.inStock;
  }

  // ── Orders & Prescriptions Workflow ─────────────────────────────────
  advanceOrder(order: Order): void {
    if (order.status === 'VALIDEE') {
      this.optiService.updateOrderStatus(order.id, 'TAILLAGE_VERRES').subscribe();
    } else if (order.status === 'TAILLAGE_VERRES') {
      this.optiService.updateOrderStatus(order.id, 'EXPEDIEE').subscribe();
    } else if (order.status === 'EXPEDIEE') {
      this.optiService.updateOrderStatus(order.id, 'LIVREE').subscribe();
    }
  }

  verifyPrescription(prescription: Prescription): void {
    this.optiService.verifyPrescription(prescription.id).subscribe();
  }

  updateAppointmentStatus(apt: AppointmentItem, newStatus: AppointmentItem['status']): void {
    apt.status = newStatus;
  }

  orderStatusLabel(status: Order['status']): string {
    const labels: Record<Order['status'], string> = {
      VALIDEE: 'Validée',
      TAILLAGE_VERRES: 'Au taillage',
      EXPEDIEE: 'Expédiée',
      LIVREE: 'Livrée'
    };
    return labels[status];
  }

  nextOrderAction(status: Order['status']): string | null {
    const actions: Record<Order['status'], string | null> = {
      VALIDEE: 'Lancer le taillage',
      TAILLAGE_VERRES: 'Marquer expédiée',
      EXPEDIEE: 'Marquer livrée',
      LIVREE: null
    };
    return actions[status];
  }

  logout(): void {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/connexion']);
    });
  }
}
