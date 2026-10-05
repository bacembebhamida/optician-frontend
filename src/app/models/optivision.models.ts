// OptiVision International Optical Platform Models

export type ProductCategory = 'LUNETTES_VUE' | 'LUNETTES_SOLEIL' | 'LUNETTES_ENFANT' | 'LENTILLES' | 'ACCESSOIRES';
export type Gender = 'HOMME' | 'FEMME' | 'UNISEX' | 'ENFANT';
export type FrameShape = 'OVALE' | 'CARRE' | 'ROND' | 'RECTANGLE' | 'PAPILLON' | 'AVIATEUR';
export type Material = 'TITANE' | 'ACETATE' | 'METAL' | 'BOIS' | 'INJECTE';
export type StyleCategory = 'MINIMALISTE' | 'CLASSIQUE' | 'MODERNE' | 'VINTAGE' | 'SPORT' | 'PREMIUM';

export interface ProductColorOption {
  name: string;
  hex: string;
  imageUrl?: string;
}

export interface CategoryTreeItem {
  id: number | string;
  name: string;
  slug: string;
  count?: number;
  route?: string;
  queryParams?: Record<string, string>;
  children?: CategoryTreeItem[];
  isOpen?: boolean;
}

export interface Product {
  id: number;
  brand: string;
  model: string;
  name: string;
  category: ProductCategory;
  priceTnd: number;
  originalPriceTnd?: number;
  gender: Gender;
  shape: FrameShape;
  material: Material;
  style: StyleCategory;
  color: string;
  colorsAvailable: ProductColorOption[];
  size: string; // e.g. "52-18-140"
  description: string;
  imageUrl: string;
  secondaryImageUrl: string;
  inStock: boolean;
  isNewArrival: boolean;
  isPopular: boolean;
  tryOn3dAvailable: boolean;
  rating: number;
  reviewCount: number;
}

export interface LensSelection {
  type: string; // "Verres Unifocaux", "Verres Progressifs Premium", "Verres Anti-Lumière Bleue"
  index: string; // "1.5 Standard", "1.6 Anti-Reflet Ultra", "1.67 Extra-Fin"
  priceTnd: number;
  tint?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedColor?: string;
  lensSelection?: LensSelection;
  quantity: number;
  unitPriceTnd: number;
  totalPriceTnd: number;
}

export interface Prescription {
  id: number;
  prescriberName: string; // Dr. Mohamed Ben Ali
  prescriptionDate: string;
  documentUrl?: string;
  isVerified: boolean;
  
  // Right Eye (OD)
  odSphere: number;
  odCylinder: number;
  odAxis: number;
  odAddition?: number;
  
  // Left Eye (OG)
  ogSphere: number;
  ogCylinder: number;
  ogAxis: number;
  ogAddition?: number;
  
  // Pupillary Distance
  pd: number;
  notes?: string;
}

export type AppointmentService = 
  | 'EXAMEN_VUE' 
  | 'CONSEIL_LUNETTES' 
  | 'ADAPTATION_LENTILLES' 
  | 'RETOUCHE_LUNETTES' 
  | 'CONTROLE_VISUEL';

export interface OptiStore {
  id: number;
  name: string;
  city: string; // Tunis Ennasr, La Marsa, Sousse, Sfax, Monastir
  address: string;
  phone: string;
  openingHours: string;
  imageUrl: string;
  services: string[];
  lat: number;
  lng: number;
}

export interface Appointment {
  id?: number;
  serviceType: AppointmentService;
  storeName: string;
  date: string;
  timeSlot: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
  status: 'CONFIRME' | 'EN_ATTENTE' | 'TERMINE' | 'ANNULE';
}

export interface Order {
  id: number;
  orderReference: string;
  date: string;
  items: CartItem[];
  subtotalTnd: number;
  discountTnd: number;
  shippingTnd: number;
  totalTnd: number;
  status: 'VALIDEE' | 'TAILLAGE_VERRES' | 'EXPEDIEE' | 'LIVREE';
  paymentMethod: 'CARTE_BANCAIRE' | 'PAIEMENT_LIVRAISON' | 'KONNECT_FLOUCI';
  deliveryAddress: string;
  prescriptionAttached?: boolean;
}

export interface LoyaltyProfile {
  points: number;
  pointsToNextReward: number;
  tier: 'SILVER' | 'GOLD' | 'PLATINUM';
  discountValueTnd: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  date: string;
  type: 'RDV' | 'COMMANDE' | 'ORDONNANCE' | 'PROMO';
  isRead: boolean;
}

export type TryOnAssetStatus = 'DRAFT' | 'GENERATING' | 'READY_FOR_REVIEW' | 'VALIDATED' | 'PUBLISHED' | 'REJECTED';

export interface VirtualTryOnAsset {
  id: number;
  variantId: number;
  variantSku?: string;
  modelUrl: string;
  thumbnailUrl?: string;
  format: string;
  status: TryOnAssetStatus;
  version: number;

  // Calibration 3D
  scale: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  eyeOffset: number;
  bridgeOffset: number;
  templeOffset: number;

  createdAt?: string;
  updatedAt?: string;
  validatedAt?: string;
  validatedBy?: string;
}
