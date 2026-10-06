// OptiVision Product Module Models

export type ProductCategory = 'LUNETTES_VUE' | 'LUNETTES_SOLEIL' | 'LUNETTES_ENFANT' | 'LENTILLES' | 'ACCESSOIRES';

export type ProductType = 'MONTURE' | 'VERRE' | 'LENTILLE_CONTACT' | 'PRODUIT_ENTRETIEN' | 'ACCESSOIRE';

export type Gender = 'HOMME' | 'FEMME' | 'UNISEX' | 'ENFANT';

export type FrameShape = 'OVALE' | 'CARRE' | 'ROND' | 'RECTANGLE' | 'PAPILLON' | 'AVIATEUR' | 'OCTOGONALE' | 'PANTO';

export type Material = 'TITANE' | 'ACETATE' | 'METAL' | 'BOIS' | 'INJECTE' | 'COMBINE' | 'CARBONE';

export type LensType = 'UNIFOCAL' | 'PROGRESSIF' | 'DEGRESSIF' | 'SOLAIRE' | 'ANTI_LUMIERE_BLEUE' | 'PHOTOCHROMIQUE' | 'SANS_VERRE';

export type ProductStatus = 'ACTIF' | 'INACTIF' | 'BROUILLON';

export interface OpticalSpecs {
  shape: FrameShape;
  material: Material;
  color: string;
  widthMm: number;        // Largeur du verre / monture en mm
  heightMm: number;       // Hauteur du verre en mm
  bridgeMm: number;       // Largeur du pont en mm
  templeLengthMm: number; // Longueur des branches en mm
  lensType: LensType;
  uvProtection: boolean;  // UV400
  polarized: boolean;     // Verres polarisés
}

export interface CommercialSpecs {
  purchasePriceTnd: number;  // Prix d'achat HT en TND
  sellingPriceTnd: number;   // Prix de vente TTC en TND
  vatRate: number;           // TVA (%) ex: 19
  marginTnd: number;         // Marge brute en TND
  marginPercentage: number;  // Marge brute %
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
  filename?: string;
  sizeBytes?: number;
  imageType?: 'FRONT' | 'THREE_QUARTER' | 'SIDE' | 'BACK' | 'TOP' | 'BOTTOM' | 'OTHER';
}

export interface VirtualTryOnAsset {
  id: number;
  variantId: number;
  variantSku?: string;
  modelUrl: string;
  thumbnailUrl?: string;
  format: string;
  status: 'DRAFT' | 'GENERATING' | 'READY_FOR_REVIEW' | 'VALIDATED' | 'PUBLISHED' | 'REJECTED';
  version: number;
  jobId?: string;
  qualityScore?: number;
  geometryScore?: number;
  symmetryScore?: number;
  scaleScore?: number;
  materialScore?: number;
  statusDetails?: string;
  opticalLensWidth?: number;
  opticalBridgeWidth?: number;
  opticalTempleLength?: number;
  scale: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  eyeOffset?: number;
  bridgeOffset?: number;
  templeOffset?: number;
  createdAt: string;
  updatedAt: string;
  validatedAt?: string;
  validatedBy?: string;
}

export interface ProductVariant {
  id: string;
  productId?: number;
  sku: string;
  barcode: string;
  colorName: string;
  colorHex: string;
  size: string; // Ex: "52-18-140" ou "M"
  priceTnd: number;
  stockQuantity?: number;
  status: ProductStatus;
}

export interface Product {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  type: ProductType;
  category: ProductCategory;
  subCategory?: string;
  brandId: number;
  brandName: string;
  model: string;
  collection?: string;
  gender: Gender;
  status: ProductStatus;
  description: string;
  commercial: CommercialSpecs;
  optical: OpticalSpecs;
  images: ProductImage[];
  variants: ProductVariant[];
  tryOn3dAvailable?: boolean;
  model3dUrl?: string;
  model3dConfig?: string;
  updatedAt: string; // ISO string
  createdAt: string; // ISO string
}

export interface ProductFilterParams {
  query?: string;
  barcode?: string;
  category?: ProductCategory | 'ALL';
  subCategory?: string;
  brandId?: number | 'ALL';
  type?: ProductType | 'ALL';
  gender?: Gender | 'ALL';
  color?: string;
  material?: Material | 'ALL';
  minPrice?: number | null;
  maxPrice?: number | null;
  status?: ProductStatus | 'ALL';
  sortBy?: 'name' | 'sku' | 'priceTnd' | 'brandName' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
