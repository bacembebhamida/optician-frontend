export type TransferStatus = 
  | 'DRAFT'
  | 'REQUESTED'
  | 'APPROVED'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'CANCELLED';

export interface TransferItem {
  productId: number;
  productName: string;
  sku: string;
  barcode: string;
  sourceAvailableStock: number;
  quantity: number;
}

export interface StockTransfer {
  id: number;
  transferNumber: string;
  sourceStoreId: number;
  sourceStoreName: string;
  targetStoreId: number;
  targetStoreName: string;
  status: TransferStatus;
  items: TransferItem[];
  totalQuantity: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransferRequest {
  sourceStoreId: number;
  targetStoreId: number;
  items: { productId: number; quantity: number }[];
  notes?: string;
}
