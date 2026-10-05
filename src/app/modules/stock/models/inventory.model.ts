export type InventoryStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface InventoryItemCount {
  productId: number;
  productName: string;
  sku: string;
  barcode: string;
  categoryName: string;
  theoreticalStock: number;
  physicalCount: number | null;
  difference: number | null; // physicalCount - theoreticalStock
  notes?: string;
}

export interface StockInventory {
  id: number;
  title?: string;
  inventoryNumber: string;
  storeId: number;
  storeName: string;
  categories: string[];
  status: InventoryStatus;
  items: InventoryItemCount[];
  totalTheoreticalUnits: number;
  totalPhysicalUnits: number | null;
  totalDifferenceUnits: number | null;
  startedAt: string;
  completedAt?: string;
  performedBy: string;
}

export interface CreateInventoryRequest {
  storeId: number;
  title?: string;
  categories?: string[];
  notes?: string;
}
