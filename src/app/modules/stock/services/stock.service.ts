import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  StockItem, StockDashboardSummary, StoreStockLocationSummary,
  StockFilterParams, StockPagedResult, StockEntryRequest, StockExitRequest
} from '../models/stock.model';
import { NotificationService } from '../../products/services/notification.service';

const MOCK_STOCK_ITEMS: StockItem[] = [
  {
    id: 1,
    productId: 101,
    productName: 'Ray-Ban RX5228 Optical High-Density',
    sku: 'RB-5228-2000-53',
    barcode: '805289307883',
    productImageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
    brandName: 'RAY-BAN',
    categoryName: 'Lunettes de vue',
    storeId: 1,
    storeName: 'Tunis Centre',
    currentStock: 14,
    reservedStock: 2,
    availableStock: 12,
    minimumThreshold: 5,
    reorderPoint: 8,
    status: 'AVAILABLE',
    lastMovementDate: '2026-09-16T14:30:00Z'
  },
  {
    id: 2,
    productId: 102,
    productName: 'Tom Ford FT5634 Titanium Luxury',
    sku: 'TF-5634-001-52',
    barcode: '889214051240',
    productImageUrl: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80',
    brandName: 'TOM FORD',
    categoryName: 'Lunettes de vue',
    storeId: 1,
    storeName: 'Tunis Centre',
    currentStock: 3,
    reservedStock: 1,
    availableStock: 2,
    minimumThreshold: 5,
    reorderPoint: 6,
    status: 'LOW_STOCK',
    lastMovementDate: '2026-09-15T11:20:00Z'
  },
  {
    id: 3,
    productId: 103,
    productName: 'Ray-Ban Aviator Classic Gold Polarized',
    sku: 'RB-3025-001-58',
    barcode: '805289004829',
    productImageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
    brandName: 'RAY-BAN',
    categoryName: 'Lunettes de soleil',
    storeId: 2,
    storeName: 'Sousse Centre',
    currentStock: 0,
    reservedStock: 0,
    availableStock: 0,
    minimumThreshold: 4,
    reorderPoint: 6,
    status: 'OUT_OF_STOCK',
    lastMovementDate: '2026-09-10T09:15:00Z'
  },
  {
    id: 4,
    productId: 104,
    productName: 'Gucci Square Signature Oversized',
    sku: 'GC-0089S-003',
    barcode: '889652109844',
    productImageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80',
    brandName: 'GUCCI',
    categoryName: 'Lunettes de soleil',
    storeId: 1,
    storeName: 'Tunis Centre',
    currentStock: 28,
    reservedStock: 3,
    availableStock: 25,
    minimumThreshold: 5,
    reorderPoint: 10,
    status: 'OVER_STOCK',
    lastMovementDate: '2026-09-14T16:00:00Z'
  },
  {
    id: 5,
    productId: 105,
    productName: 'Oakley Radar EV Path Prizm Road',
    sku: 'OK-9208-0138',
    barcode: '888392001452',
    productImageUrl: 'https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=800&auto=format&fit=crop&q=80',
    brandName: 'OAKLEY',
    categoryName: 'Lunettes de soleil',
    storeId: 3,
    storeName: 'Sfax Mall',
    currentStock: 15,
    reservedStock: 1,
    availableStock: 14,
    minimumThreshold: 4,
    reorderPoint: 7,
    status: 'AVAILABLE',
    lastMovementDate: '2026-09-13T10:45:00Z'
  }
];

const MOCK_LOCATIONS: StoreStockLocationSummary[] = [
  {
    storeId: 1,
    storeName: 'Tunis Centre Flagship',
    storeAddress: 'Avenue Habib Bourguiba, Tunis',
    city: 'Tunis',
    totalProductsCount: 142,
    totalUnitsCount: 845,
    lowStockCount: 12,
    outOfStockCount: 4,
    overStockCount: 6
  },
  {
    storeId: 2,
    storeName: 'Sousse Centre Boutique',
    storeAddress: 'Boulevard 14 Janvier, Sousse',
    city: 'Sousse',
    totalProductsCount: 98,
    totalUnitsCount: 420,
    lowStockCount: 8,
    outOfStockCount: 3,
    overStockCount: 2
  },
  {
    storeId: 3,
    storeName: 'Sfax Mall Branch',
    storeAddress: 'Route de Teniour, Sfax',
    city: 'Sfax',
    totalProductsCount: 85,
    totalUnitsCount: 380,
    lowStockCount: 4,
    outOfStockCount: 1,
    overStockCount: 1
  }
];

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private readonly baseUrl = 'http://localhost:8080/api/stocks';
  private stockSubject = new BehaviorSubject<StockItem[]>(MOCK_STOCK_ITEMS);

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  // ── Dashboard Summary KPIs ──────────────────────────────────────────
  getDashboardSummary(): Observable<StockDashboardSummary> {
    return this.http.get<StockDashboardSummary>(`${this.baseUrl}/dashboard`).pipe(
      catchError(() => {
        const items = this.stockSubject.value;
        const totalStockUnits = items.reduce((acc, curr) => acc + curr.currentStock, 0);
        const availableProductsCount = items.filter(i => i.status === 'AVAILABLE' || i.status === 'OVER_STOCK').length;
        const outOfStockCount = items.filter(i => i.status === 'OUT_OF_STOCK').length;
        const lowStockCount = items.filter(i => i.status === 'LOW_STOCK').length;
        const reservedStockUnits = items.reduce((acc, curr) => acc + curr.reservedStock, 0);

        return of({
          totalStockUnits,
          availableProductsCount,
          outOfStockCount,
          lowStockCount,
          reservedStockUnits,
          activeTransfersCount: 3,
          activeInventoriesCount: 1
        });
      })
    );
  }

  // ── Stock Breakdown by Location / Store ─────────────────────────────
  getStoreStockLocations(): Observable<StoreStockLocationSummary[]> {
    return this.http.get<StoreStockLocationSummary[]>(`${this.baseUrl}/locations`).pipe(
      catchError(() => of(MOCK_LOCATIONS))
    );
  }

  // ── Paged Product Stock List (Server Pagination & Filters) ──────────
  getStockProducts(params: StockFilterParams): Observable<StockPagedResult<StockItem>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.query) httpParams = httpParams.set('query', params.query);
    if (params.barcode) httpParams = httpParams.set('barcode', params.barcode);
    if (params.storeId && params.storeId !== 'ALL') httpParams = httpParams.set('storeId', params.storeId.toString());
    if (params.category && params.category !== 'ALL') httpParams = httpParams.set('category', params.category);
    if (params.brandId && params.brandId !== 'ALL') httpParams = httpParams.set('brandId', params.brandId.toString());
    if (params.status && params.status !== 'ALL') httpParams = httpParams.set('status', params.status);
    if (params.lowStockOnly) httpParams = httpParams.set('lowStockOnly', 'true');
    if (params.outOfStockOnly) httpParams = httpParams.set('outOfStockOnly', 'true');
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);

    return this.http.get<StockPagedResult<StockItem>>(`${this.baseUrl}/products`, { params: httpParams }).pipe(
      catchError(() => {
        let list = [...this.stockSubject.value];

        if (params.query) {
          const q = params.query.toLowerCase().trim();
          list = list.filter(i =>
            i.productName.toLowerCase().includes(q) ||
            i.sku.toLowerCase().includes(q) ||
            i.barcode.includes(q) ||
            i.storeName.toLowerCase().includes(q)
          );
        }

        if (params.barcode) {
          list = list.filter(i => i.barcode.includes(params.barcode!.trim()));
        }

        if (params.storeId && params.storeId !== 'ALL') {
          list = list.filter(i => i.storeId === params.storeId);
        }

        if (params.status && params.status !== 'ALL') {
          list = list.filter(i => i.status === params.status);
        }

        if (params.lowStockOnly) {
          list = list.filter(i => i.status === 'LOW_STOCK');
        }

        if (params.outOfStockOnly) {
          list = list.filter(i => i.status === 'OUT_OF_STOCK');
        }

        const totalItems = list.length;
        const totalPages = Math.ceil(totalItems / params.pageSize) || 1;
        const page = Math.max(1, Math.min(params.page, totalPages));
        const startIndex = (page - 1) * params.pageSize;
        const items = list.slice(startIndex, startIndex + params.pageSize);

        return of({
          items,
          totalItems,
          page,
          pageSize: params.pageSize,
          totalPages
        });
      })
    );
  }

  // ── Stock Entry API ────────────────────────────────────────────────
  createStockEntry(req: StockEntryRequest): Observable<StockItem> {
    return this.http.post<StockItem>(`${this.baseUrl}/entries`, req).pipe(
      tap(() => this.notificationService.success('Entrée de stock validée', `${req.quantity} unité(s) ajoutée(s).`)),
      catchError(() => {
        let updatedItem!: StockItem;
        const list = this.stockSubject.value.map(item => {
          if (item.productId === req.productId && item.storeId === req.storeId) {
            const currentStock = item.currentStock + req.quantity;
            const availableStock = currentStock - item.reservedStock;
            let status = item.status;
            if (currentStock === 0) status = 'OUT_OF_STOCK';
            else if (currentStock <= item.minimumThreshold) status = 'LOW_STOCK';
            else if (currentStock > item.reorderPoint * 2) status = 'OVER_STOCK';
            else status = 'AVAILABLE';

            updatedItem = { ...item, currentStock, availableStock, status, lastMovementDate: new Date().toISOString() };
            return updatedItem;
          }
          return item;
        });

        this.stockSubject.next(list);
        this.notificationService.success('Entrée de stock enregistrée', `${req.quantity} unité(s) ajoutée(s) avec succès.`);
        return of(updatedItem || MOCK_STOCK_ITEMS[0]);
      })
    );
  }

  // ── Stock Exit API ─────────────────────────────────────────────────
  createStockExit(req: StockExitRequest): Observable<StockItem> {
    return this.http.post<StockItem>(`${this.baseUrl}/exits`, req).pipe(
      tap(() => this.notificationService.success('Sortie de stock validée', `${req.quantity} unité(s) retirée(s).`)),
      catchError(() => {
        let updatedItem!: StockItem;
        const list = this.stockSubject.value.map(item => {
          if (item.productId === req.productId && item.storeId === req.storeId) {
            const currentStock = Math.max(0, item.currentStock - req.quantity);
            const availableStock = Math.max(0, currentStock - item.reservedStock);
            let status = item.status;
            if (currentStock === 0) status = 'OUT_OF_STOCK';
            else if (currentStock <= item.minimumThreshold) status = 'LOW_STOCK';
            else status = 'AVAILABLE';

            updatedItem = { ...item, currentStock, availableStock, status, lastMovementDate: new Date().toISOString() };
            return updatedItem;
          }
          return item;
        });

        this.stockSubject.next(list);
        this.notificationService.success('Sortie de stock enregistrée', `${req.quantity} unité(s) déduite(s) avec succès.`);
        return of(updatedItem || MOCK_STOCK_ITEMS[0]);
      })
    );
  }
}
