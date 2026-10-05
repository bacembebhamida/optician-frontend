export type MovementType = 
  | 'ENTREE'
  | 'SORTIE_VENTE'
  | 'SORTIE_PERTE'
  | 'SORTIE_DOMMAGE'
  | 'SORTIE_CORRECTION'
  | 'TRANSFERT_ENTRANT'
  | 'TRANSFERT_SORTANT'
  | 'AJUSTEMENT_INVENTAIRE';

export interface StockMovement {
  id: number;
  date: string;
  productId: number;
  productName: string;
  sku: string;
  barcode: string;
  storeId: number;
  storeName: string;
  type: MovementType;
  quantity: number; // positive for entry, negative or positive depending on context
  stockBefore: number;
  stockAfter: number;
  userFullName: string;
  referenceNumber: string;
  notes?: string;
}

export interface MovementFilterParams {
  startDate?: string;
  endDate?: string;
  type?: MovementType | 'ALL';
  storeId?: number | 'ALL';
  productId?: number;
  userFullName?: string;
  query?: string;
  page: number;
  pageSize: number;
}
