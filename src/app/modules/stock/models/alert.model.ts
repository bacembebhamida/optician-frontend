export type AlertType = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'OVER_STOCK';

export interface StockAlert {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  barcode: string;
  productImageUrl?: string;
  storeId: number;
  storeName: string;
  type: AlertType;
  currentStock: number;
  threshold: number;
  suggestedAction: string;
  createdAt: string;
}
