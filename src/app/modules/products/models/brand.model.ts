// OptiVision Brand Models

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  websiteUrl?: string;
  active: boolean;
  productCount: number;
  countryOrigin?: string;
}
