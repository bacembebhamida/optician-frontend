export type StockStatus = 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVER_STOCK';

export interface StockItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  barcode: string;
  productImageUrl?: string;
  brandName: string;
  categoryName: string;
  storeId: number;
  storeName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minimumThreshold: number;
  reorderPoint: number;
  status: StockStatus;
  lastMovementDate?: string;
}

export interface StockDashboardSummary {
  totalStockUnits: number;
  availableProductsCount: number;
  outOfStockCount: number;
  lowStockCount: number;
  reservedStockUnits: number;
  activeTransfersCount: number;
  activeInventoriesCount: number;
}

export interface StoreStockLocationSummary {
  storeId: number;
  storeName: string;
  storeAddress: string;
  city: string;
  totalProductsCount: number;
  totalUnitsCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  overStockCount: number;
}

export interface StockFilterParams {
  query?: string;
  barcode?: string;
  storeId?: number | 'ALL';
  category?: string | 'ALL';
  brandId?: number | 'ALL';
  status?: StockStatus | 'ALL';
  lowStockOnly?: boolean;
  outOfStockOnly?: boolean;
  page: number;
  pageSize: number;
  sortBy?: 'productName' | 'sku' | 'currentStock' | 'availableStock' | 'storeName';
  sortDirection?: 'asc' | 'desc';
}

export interface StockPagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StockEntryRequest {
  storeId: number;
  productId: number;
  variantId?: string;
  quantity: number;
  referenceNumber: string;
  reason: string;
  supplierName?: string;
  notes?: string;
}

export type ExitReason = 'VENTE' | 'PERTE' | 'DOMMAGE' | 'CORRECTION';

export interface StockExitRequest {
  storeId: number;
  productId: number;
  variantId?: string;
  quantity: number;
  referenceNumber: string;
  reason: ExitReason;
  notes?: string;
}
