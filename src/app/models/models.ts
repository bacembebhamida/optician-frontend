export interface Product {
  id?: number;
  name: string;
  brand: string;
  category: 'LUNETTES_VUE' | 'LUNETTES_SOLEIL' | 'LENTILLES';
  price: number;
  gender: 'HOMME' | 'FEMME' | 'MIXTE';
  faceShape: 'OVALE' | 'CARRE' | 'ROND' | 'TOUS';
  frameType: 'METAL' | 'ACETATE' | 'TITANE' | 'AUTRE';
  color: string;
  imageUrl: string;
  stock: number;
  virtualTryOnEnabled: boolean;
  description: string;
}

export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  notes?: string;
}

export interface Prescription {
  id?: number;
  patientId?: number;
  patientName: string;
  prescriberName: string;
  prescriptionDate: string;
  odSphere: number;
  odCylinder: number;
  odAxis: number;
  odAddition: number;
  ogSphere: number;
  ogCylinder: number;
  ogAxis: number;
  ogAddition: number;
  pupillaryDistance: number;
  fileUrl?: string;
  notes?: string;
}

export interface OrderItem {
  id?: number;
  productId: number;
  productName: string;
  productCategory: string;
  unitPrice: number;
  quantity: number;
  lensType: string;
}

export interface Order {
  id?: number;
  orderReference: string;
  orderDate?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: 'PAYEE' | 'EN_PREPARATION' | 'EXPEDIEE' | 'LIVREE';
  prescriptionId?: number;
  items: OrderItem[];
}

export interface Appointment {
  id?: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  appointmentDateTime: string;
  serviceType: 'EXAMEN_VUE' | 'ESSAYAGE' | 'CONSULTATION' | 'AJUSTEMENT';
  storeLocation: string;
  status: 'EN_ATTENTE' | 'CONFIRME' | 'TERMINE' | 'ANNULE';
  notes?: string;
}

export interface Store {
  id?: number;
  name: string;
  city: string;
  address: string;
  zipCode: string;
  phone: string;
  email: string;
  openingHours: string;
  active: boolean;
  latitude?: number;
  longitude?: number;
}

export interface Promotion {
  id?: number;
  code: string;
  title: string;
  description: string;
  discountPercentage: number;
  discountAmount: number;
  startDate: string;
  endDate: string;
  active: boolean;
  categoryTarget: string;
}

export interface NotificationLog {
  id?: number;
  recipient: string;
  channel: 'EMAIL' | 'WHATSAPP' | 'SMS';
  subject: string;
  message: string;
  sentAt?: string;
  status?: string;
}
