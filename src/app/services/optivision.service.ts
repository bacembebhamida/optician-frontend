import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { 
  Product, CartItem, Prescription, Appointment, Order, 
  OptiStore, LoyaltyProfile, NotificationItem, LensSelection, CategoryTreeItem 
} from '../models/optivision.models';

@Injectable({
  providedIn: 'root'
})
export class OptiVisionService {

  // Current Language (FR, AR, EN)
  private currentLangSubject = new BehaviorSubject<'FR' | 'AR' | 'EN'>('FR');
  public currentLang$ = this.currentLangSubject.asObservable();

  // Cart State
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  // Favorites State
  private favoriteIdsSubject = new BehaviorSubject<number[]>([1, 3]);
  public favoriteIds$ = this.favoriteIdsSubject.asObservable();

  // User Profile
  public currentUser = {
    fullName: 'Sonia Ben Ammar',
    email: 'sonia.benammar@optivision.tn',
    phone: '+216 22 456 789',
    address: 'Avenue Hédi Nouira, Ennasr 2, Ariana, Tunisie',
    role: 'CLIENT'
  };

  // Loyalty
  public loyalty: LoyaltyProfile = {
    points: 850,
    pointsToNextReward: 150,
    tier: 'GOLD',
    discountValueTnd: 50
  };

  // Mock Products in TND
  private mockProducts: Product[] = [
    {
      id: 1,
      brand: 'RAY-BAN',
      model: 'Wayfarer Classic Optique',
      name: 'Ray-Ban Wayfarer Titane Black',
      category: 'LUNETTES_VUE',
      priceTnd: 580,
      originalPriceTnd: 650,
      gender: 'UNISEX',
      shape: 'CARRE',
      material: 'ACETATE',
      style: 'CLASSIQUE',
      color: 'Noir Mat',
      colorsAvailable: [
        { name: 'Noir Mat', hex: '#111827' },
        { name: 'Écaille Havane', hex: '#78350F' },
        { name: 'Gris Transparent', hex: '#64748B' }
      ],
      size: '50-22-145',
      description: 'Icône intemporelle réinventée avec une armature légère en acétate haut de gamme. Confort d\'exception pour le port quotidien.',
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80',
      inStock: true,
      isNewArrival: true,
      isPopular: true,
      tryOn3dAvailable: true,
      rating: 4.9,
      reviewCount: 42
    },
    {
      id: 2,
      brand: 'GUCCI',
      model: 'GG0061S Gold Edition',
      name: 'Gucci Solaire Élégance Dorée',
      category: 'LUNETTES_SOLEIL',
      priceTnd: 890,
      gender: 'FEMME',
      shape: 'PAPILLON',
      material: 'TITANE',
      style: 'PREMIUM',
      color: 'Or Rose & Noir',
      colorsAvailable: [
        { name: 'Or Rose', hex: '#E0A96D' },
        { name: 'Or Jaune', hex: '#F59E0B' }
      ],
      size: '54-19-140',
      description: 'Monture solaire surdimensionnée en titane doré finis à la main en Italie. Protection UV400 catégorie 3 maximale.',
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&auto=format&fit=crop&q=80',
      inStock: true,
      isNewArrival: true,
      isPopular: true,
      tryOn3dAvailable: true,
      rating: 5.0,
      reviewCount: 28
    },
    {
      id: 3,
      brand: 'TOM FORD',
      model: 'FT5634-B Blue Block',
      name: 'Tom Ford Minimalist Round',
      category: 'LUNETTES_VUE',
      priceTnd: 740,
      gender: 'HOMME',
      shape: 'ROND',
      material: 'TITANE',
      style: 'MINIMALISTE',
      color: 'Argent Brossé',
      colorsAvailable: [
        { name: 'Argent Brossé', hex: '#94A3B8' },
        { name: 'Or Titane', hex: '#D4C5B9' }
      ],
      size: '49-20-145',
      description: 'Esthétique sobre et raffinée signée Tom Ford. Verres BlueBlock inclus pour protéger la vue contre les écrans.',
      imageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&auto=format&fit=crop&q=80',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80',
      inStock: true,
      isNewArrival: false,
      isPopular: true,
      tryOn3dAvailable: true,
      rating: 4.8,
      reviewCount: 35
    },
    {
      id: 4,
      brand: 'OAKLEY',
      model: 'Holbrook XL Prizm',
      name: 'Oakley Holbrook Sport Prizm',
      category: 'LUNETTES_SOLEIL',
      priceTnd: 490,
      originalPriceTnd: 540,
      gender: 'HOMME',
      shape: 'RECTANGLE',
      material: 'INJECTE',
      style: 'SPORT',
      color: 'Noir Mat & Verres Saphir',
      colorsAvailable: [
        { name: 'Saphir Polarisé', hex: '#2563EB' },
        { name: 'Rubis Prizm', hex: '#DC2626' }
      ],
      size: '56-18-138',
      description: 'Conception sportive ultra-résistante avec verres Prizm qui accentuent les détails et les contrastes visuels.',
      imageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
      inStock: true,
      isNewArrival: false,
      isPopular: true,
      tryOn3dAvailable: true,
      rating: 4.7,
      reviewCount: 19
    },
    {
      id: 5,
      brand: 'PERSOL',
      model: 'PO3077S Vintage Icon',
      name: 'Persol Steve McQueen Edition',
      category: 'LUNETTES_SOLEIL',
      priceTnd: 820,
      gender: 'UNISEX',
      shape: 'OVALE',
      material: 'ACETATE',
      style: 'VINTAGE',
      color: 'Havana Bleu Dégradé',
      colorsAvailable: [
        { name: 'Havana Solaire', hex: '#78350F' },
        { name: 'Noir Profond', hex: '#000000' }
      ],
      size: '52-21-140',
      description: 'Système pliant breveté Meflecto et flèche métallique emblématique. Façonné artisanalement depuis 1917 en Italie.',
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&auto=format&fit=crop&q=80',
      inStock: true,
      isNewArrival: true,
      isPopular: false,
      tryOn3dAvailable: true,
      rating: 4.9,
      reviewCount: 14
    },
    {
      id: 6,
      brand: 'AIR OPTIX',
      model: 'Hydraglyde Monthly 6-Pack',
      name: 'Lentilles de Contact Air Optix Night & Day',
      category: 'LENTILLES',
      priceTnd: 180,
      gender: 'UNISEX',
      shape: 'ROND',
      material: 'ACETATE',
      style: 'MINIMALISTE',
      color: 'Translucide Hydrogel',
      colorsAvailable: [
        { name: 'Hydrogel Clear', hex: '#E2E8F0' }
      ],
      size: 'BC 8.6 / DIA 14.2',
      description: 'Lentilles mensuelles en silicone-hydrogel à haute oxygénation pour un confort hydratant continu 24h/24.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      secondaryImageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&auto=format&fit=crop&q=80',
      inStock: true,
      isNewArrival: false,
      isPopular: true,
      tryOn3dAvailable: false,
      rating: 4.8,
      reviewCount: 52
    }
  ];

  // Stores List in Tunisia
  private mockStores: OptiStore[] = [
    {
      id: 1,
      name: 'OptiVision Tunis Ennasr',
      city: 'Tunis Ennasr 2',
      address: 'Avenue Hédi Nouira, Ennasr 2, 2037 Ariana',
      phone: '+216 71 830 111',
      openingHours: 'Lun - Sam : 09:00 - 19:30',
      imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&auto=format&fit=crop&q=80',
      services: ['Examen de Vue 3D', 'Essayage Virtuel sur place', 'Taillage express 1h', 'Laboratoire Centrage Verres'],
      lat: 36.8584,
      lng: 10.1627
    },
    {
      id: 2,
      name: 'OptiVision La Marsa',
      city: 'La Marsa',
      address: 'Rue Imam Abou Hanifa, La Marsa Corniche, 2070 Tunis',
      phone: '+216 71 740 222',
      openingHours: 'Lun - Sam : 09:30 - 20:00',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
      services: ['Conseil Relooking Visage', 'Collection Luxe Solaire', 'Adaptation Lentilles'],
      lat: 36.8781,
      lng: 10.3247
    },
    {
      id: 3,
      name: 'OptiVision Sousse Centre',
      city: 'Sousse',
      address: 'Boulevard Habib Bourguiba, 4000 Sousse',
      phone: '+216 73 220 333',
      openingHours: 'Lun - Sam : 08:30 - 19:00',
      imageUrl: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&auto=format&fit=crop&q=80',
      services: ['Examen de Vue', 'Contrôle Visuel', 'Service Après-Vente Gratuit'],
      lat: 35.8256,
      lng: 10.6369
    },
    {
      id: 4,
      name: 'OptiVision Sfax Ville',
      city: 'Sfax',
      address: 'Route de Téniour Km 1.5, 3000 Sfax',
      phone: '+216 74 400 444',
      openingHours: 'Lun - Sam : 08:30 - 19:00',
      imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop&q=80',
      services: ['Laboratoire Optique', 'Bilan Réfraction Optométrique', 'Lunettes Enfants'],
      lat: 34.7406,
      lng: 10.7603
    }
  ];

  // Prescriptions
  private mockPrescriptions: Prescription[] = [
    {
      id: 101,
      prescriberName: 'Dr. Jalel Ben Mbarek (Ophtalmologue Tunis)',
      prescriptionDate: '2026-02-10',
      documentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      isVerified: true,
      odSphere: -2.25,
      odCylinder: -0.50,
      odAxis: 90,
      odAddition: 1.50,
      ogSphere: -2.50,
      ogCylinder: -0.75,
      ogAxis: 85,
      ogAddition: 1.50,
      pd: 63,
      notes: 'Verres anti-lumière bleue recommandés pour travail intensif sur écran.'
    }
  ];

  // Active Appointments
  private mockAppointments: Appointment[] = [
    {
      id: 501,
      serviceType: 'EXAMEN_VUE',
      storeName: 'OptiVision Tunis Ennasr',
      date: '2026-09-18',
      timeSlot: '14:30',
      clientName: 'Sonia Ben Ammar',
      clientEmail: 'sonia.benammar@optivision.tn',
      clientPhone: '+216 22 456 789',
      notes: 'Bilan visuel annuel et choix nouvelle monture Ray-Ban.',
      status: 'CONFIRME'
    }
  ];

  // Active Orders
  private mockOrders: Order[] = [
    {
      id: 901,
      orderReference: 'OPT-2026-7890',
      date: '2026-09-12',
      items: [
        {
          id: 'item-1',
          product: this.mockProducts[0],
          selectedColor: 'Noir Mat',
          lensSelection: {
            type: 'Verres Anti-Lumière Bleue',
            index: '1.6 Anti-Reflet Ultra',
            priceTnd: 180
          },
          quantity: 1,
          unitPriceTnd: 760,
          totalPriceTnd: 760
        }
      ],
      subtotalTnd: 760,
      discountTnd: 50,
      shippingTnd: 0,
      totalTnd: 710,
      status: 'TAILLAGE_VERRES',
      paymentMethod: 'CARTE_BANCAIRE',
      deliveryAddress: 'Avenue Hédi Nouira, Ennasr 2, Ariana, Tunisie',
      prescriptionAttached: true
    }
  ];

  // Notifications
  private mockNotifications: NotificationItem[] = [
    {
      id: 1,
      title: 'RDV Confirmé',
      message: 'Votre rendez-vous Examen de vue à Tunis Ennasr le 18/09 à 14:30 est confirmé.',
      date: 'Aujourd\'hui 10:15',
      type: 'RDV',
      isRead: false
    },
    {
      id: 2,
      title: 'Montage de vos verres',
      message: 'Votre commande OPT-2026-7890 est en cours de taillage dans notre laboratoire.',
      date: 'Hier 16:40',
      type: 'COMMANDE',
      isRead: false
    }
  ];

  constructor() {
    // Initial Cart Item
    const initialItem: CartItem = {
      id: 'cart-1',
      product: this.mockProducts[0],
      selectedColor: 'Noir Mat',
      lensSelection: {
        type: 'Verres Anti-Lumière Bleue',
        index: '1.6 Anti-Reflet Ultra',
        priceTnd: 180
      },
      quantity: 1,
      unitPriceTnd: 760,
      totalPriceTnd: 760
    };
    this.cartItemsSubject.next([initialItem]);
  }

  // --- LANGUAGE MANAGEMENT ---
  setLanguage(lang: 'FR' | 'AR' | 'EN'): void {
    this.currentLangSubject.next(lang);
  }

  getLanguage(): 'FR' | 'AR' | 'EN' {
    return this.currentLangSubject.getValue();
  }

  // --- PRODUCTS ---
  getProducts(): Observable<Product[]> {
    return of(this.mockProducts);
  }

  // --- CATEGORIES ---
  getCategories(): Observable<CategoryTreeItem[]> {
    return of([
      {
        id: 1,
        name: 'Lunettes de vue',
        slug: 'lunettes-de-vue',
        route: '/lunettes-de-vue',
        isOpen: true,
        children: [
          { id: 11, name: 'Hommes', slug: 'hommes', route: '/lunettes-de-vue', queryParams: { gender: 'HOMME' } },
          { id: 12, name: 'Femmes', slug: 'femmes', route: '/lunettes-de-vue', queryParams: { gender: 'FEMME' } },
          { id: 13, name: 'Enfants', slug: 'enfants', route: '/lunettes-de-vue', queryParams: { gender: 'ENFANT' } },
          { id: 14, name: 'Unisexe', slug: 'unisexe', route: '/lunettes-de-vue', queryParams: { gender: 'UNISEX' } }
        ]
      },
      {
        id: 2,
        name: 'Lunettes de soleil',
        slug: 'lunettes-de-soleil',
        route: '/lunettes-de-soleil',
        isOpen: true,
        children: [
          { id: 21, name: 'Hommes', slug: 'hommes', route: '/lunettes-de-soleil', queryParams: { gender: 'HOMME' } },
          { id: 22, name: 'Femmes', slug: 'femmes', route: '/lunettes-de-soleil', queryParams: { gender: 'FEMME' } },
          { id: 23, name: 'Enfants', slug: 'enfants', route: '/lunettes-de-soleil', queryParams: { gender: 'ENFANT' } },
          { id: 24, name: 'Unisexe', slug: 'unisexe', route: '/lunettes-de-soleil', queryParams: { gender: 'UNISEX' } }
        ]
      },
      {
        id: 3,
        name: 'Lentilles',
        slug: 'lentilles',
        route: '/lentilles',
        isOpen: true,
        children: [
          { id: 31, name: 'Journalières', slug: 'journalieres', route: '/lentilles', queryParams: { type: 'JOURNALIER' } },
          { id: 32, name: 'Mensuelles', slug: 'mensuelles', route: '/lentilles', queryParams: { type: 'MENSUEL' } },
          { id: 33, name: 'Lentilles couleur', slug: 'couleur', route: '/lentilles', queryParams: { type: 'COULEUR' } }
        ]
      },
      {
        id: 4,
        name: 'Accessoires',
        slug: 'accessoires',
        route: '/accessoires',
        isOpen: false,
        children: [
          { id: 41, name: 'Étuis', slug: 'etuis', route: '/accessoires', queryParams: { type: 'ETUI' } },
          { id: 42, name: 'Produits d\'entretien', slug: 'entretien', route: '/accessoires', queryParams: { type: 'ENTRETIEN' } },
          { id: 43, name: 'Cordons', slug: 'cordons', route: '/accessoires', queryParams: { type: 'CORDON' } },
          { id: 44, name: 'Accessoires lunettes', slug: 'accessoires-optiques', route: '/accessoires', queryParams: { type: 'DIVERS' } }
        ]
      },
      {
        id: 5,
        name: 'Marques',
        slug: 'marques',
        route: '/marques',
        isOpen: true,
        children: [
          { id: 51, name: 'Ray-Ban', slug: 'ray-ban', route: '/marques', queryParams: { brand: 'Ray-Ban' } },
          { id: 52, name: 'Oakley', slug: 'oakley', route: '/marques', queryParams: { brand: 'Oakley' } },
          { id: 53, name: 'Tom Ford', slug: 'tom-ford', route: '/marques', queryParams: { brand: 'Tom Ford' } },
          { id: 54, name: 'Gucci', slug: 'gucci', route: '/marques', queryParams: { brand: 'Gucci' } },
          { id: 55, name: 'Prada', slug: 'prada', route: '/marques', queryParams: { brand: 'Prada' } },
          { id: 56, name: 'Persol', slug: 'persol', route: '/marques', queryParams: { brand: 'Persol' } },
          { id: 57, name: 'Air Optix', slug: 'air-optix', route: '/marques', queryParams: { brand: 'Air Optix' } }
        ]
      }
    ]);
  }

  addProduct(product: Product): Observable<Product> {
    this.mockProducts.unshift(product);
    return of(product);
  }

  getProductById(id: number): Observable<Product | undefined> {
    return of(this.mockProducts.find(p => p.id === id));
  }

  // --- CART MANAGEMENT ---
  getCart(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  addToCart(product: Product, lens?: LensSelection, color?: string): void {
    const current = this.cartItemsSubject.getValue();
    const lensPrice = lens ? lens.priceTnd : 0;
    const unitPrice = product.priceTnd + lensPrice;

    const newItem: CartItem = {
      id: `cart-${Date.now()}`,
      product: product,
      selectedColor: color || product.color,
      lensSelection: lens,
      quantity: 1,
      unitPriceTnd: unitPrice,
      totalPriceTnd: unitPrice
    };

    this.cartItemsSubject.next([...current, newItem]);
  }

  removeFromCart(itemId: string): void {
    const current = this.cartItemsSubject.getValue().filter(i => i.id !== itemId);
    this.cartItemsSubject.next(current);
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
  }

  // --- FAVORITES ---
  toggleFavorite(productId: number): void {
    const current = this.favoriteIdsSubject.getValue();
    if (current.includes(productId)) {
      this.favoriteIdsSubject.next(current.filter(id => id !== productId));
    } else {
      this.favoriteIdsSubject.next([...current, productId]);
    }
  }

  // --- APPOINTMENTS ---
  getAppointments(): Observable<Appointment[]> {
    return of(this.mockAppointments);
  }

  addAppointment(appointment: Appointment): Observable<Appointment> {
    const newApp: Appointment = {
      ...appointment,
      id: Date.now(),
      status: 'CONFIRME'
    };
    this.mockAppointments.unshift(newApp);
    return of(newApp);
  }

  // --- PRESCRIPTIONS ---
  getPrescriptions(): Observable<Prescription[]> {
    return of(this.mockPrescriptions);
  }

  savePrescription(prescription: Prescription): Observable<Prescription> {
    const newP: Prescription = {
      ...prescription,
      id: Date.now(),
      isVerified: true
    };
    this.mockPrescriptions.unshift(newP);
    return of(newP);
  }

  // --- STORES ---
  getStores(): Observable<OptiStore[]> {
    return of(this.mockStores);
  }

  addStore(store: OptiStore): Observable<OptiStore> {
    this.mockStores.push(store);
    return of(store);
  }

  // --- ORDERS ---
  getOrders(): Observable<Order[]> {
    return of(this.mockOrders);
  }

  updateOrderStatus(orderId: number, status: Order['status']): Observable<Order | undefined> {
    const order = this.mockOrders.find(item => item.id === orderId);
    if (order) order.status = status;
    return of(order);
  }

  verifyPrescription(prescriptionId: number): Observable<Prescription | undefined> {
    const prescription = this.mockPrescriptions.find(item => item.id === prescriptionId);
    if (prescription) prescription.isVerified = true;
    return of(prescription);
  }

  createOrder(orderData: Partial<Order>): Observable<Order> {
    const items = this.cartItemsSubject.getValue();
    const subtotal = items.reduce((acc, item) => acc + item.totalPriceTnd, 0);
    const newOrder: Order = {
      id: Date.now(),
      orderReference: `OPT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      items: items,
      subtotalTnd: subtotal,
      discountTnd: 0,
      shippingTnd: 0,
      totalTnd: subtotal,
      status: 'VALIDEE',
      paymentMethod: orderData.paymentMethod || 'CARTE_BANCAIRE',
      deliveryAddress: orderData.deliveryAddress || this.currentUser.address,
      prescriptionAttached: true
    };
    this.mockOrders.unshift(newOrder);
    this.clearCart();
    return of(newOrder);
  }

  // --- NOTIFICATIONS ---
  getNotifications(): Observable<NotificationItem[]> {
    return of(this.mockNotifications);
  }
}
