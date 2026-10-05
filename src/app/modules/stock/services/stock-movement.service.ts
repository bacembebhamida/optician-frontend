import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StockMovement, MovementFilterParams } from '../models/movement.model';
import { StockPagedResult } from '../models/stock.model';

const MOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 1001,
    date: '2026-09-16T14:30:00Z',
    productId: 101,
    productName: 'Ray-Ban RX5228 Optical High-Density',
    sku: 'RB-5228-2000-53',
    barcode: '805289307883',
    storeId: 1,
    storeName: 'Tunis Centre',
    type: 'ENTREE',
    quantity: 10,
    stockBefore: 4,
    stockAfter: 14,
    userFullName: 'Karim Mansour',
    referenceNumber: 'BL-2026-0891',
    notes: 'Réception fournisseur Luxottica'
  },
  {
    id: 1002,
    date: '2026-09-15T11:20:00Z',
    productId: 102,
    productName: 'Tom Ford FT5634 Titanium Luxury',
    sku: 'TF-5634-001-52',
    barcode: '889214051240',
    storeId: 1,
    storeName: 'Tunis Centre',
    type: 'SORTIE_VENTE',
    quantity: -1,
    stockBefore: 4,
    stockAfter: 3,
    userFullName: 'Sonia Ben Ali',
    referenceNumber: 'FAC-2026-0042',
    notes: 'Vente directe magasin'
  },
  {
    id: 1003,
    date: '2026-09-14T16:00:00Z',
    productId: 104,
    productName: 'Gucci Square Signature Oversized',
    sku: 'GC-0089S-003',
    barcode: '889652109844',
    storeId: 1,
    storeName: 'Tunis Centre',
    type: 'TRANSFERT_ENTRANT',
    quantity: 5,
    stockBefore: 23,
    stockAfter: 28,
    userFullName: 'Karim Mansour',
    referenceNumber: 'TR-2026-0015',
    notes: 'Transfert depuis Sousse'
  },
  {
    id: 1004,
    date: '2026-09-12T09:45:00Z',
    productId: 103,
    productName: 'Ray-Ban Aviator Classic Gold Polarized',
    sku: 'RB-3025-001-58',
    barcode: '805289004829',
    storeId: 2,
    storeName: 'Sousse Centre',
    type: 'SORTIE_PERTE',
    quantity: -1,
    stockBefore: 1,
    stockAfter: 0,
    userFullName: 'Ahmed Triki',
    referenceNumber: 'PERTE-2026-004',
    notes: 'Ajustement suite casse monture d’exposition'
  }
];

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  private readonly baseUrl = 'http://localhost:8080/api/stock-movements';

  constructor(private http: HttpClient) {}

  getMovements(params: MovementFilterParams): Observable<StockPagedResult<StockMovement>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.query) httpParams = httpParams.set('query', params.query);
    if (params.type && params.type !== 'ALL') httpParams = httpParams.set('type', params.type);
    if (params.storeId && params.storeId !== 'ALL') httpParams = httpParams.set('storeId', params.storeId.toString());

    return this.http.get<StockPagedResult<StockMovement>>(this.baseUrl, { params: httpParams }).pipe(
      catchError(() => {
        let list = [...MOCK_MOVEMENTS];

        if (params.query) {
          const q = params.query.toLowerCase().trim();
          list = list.filter(m =>
            m.productName.toLowerCase().includes(q) ||
            m.sku.toLowerCase().includes(q) ||
            m.referenceNumber.toLowerCase().includes(q) ||
            m.userFullName.toLowerCase().includes(q)
          );
        }

        if (params.type && params.type !== 'ALL') {
          list = list.filter(m => m.type === params.type);
        }

        if (params.storeId && params.storeId !== 'ALL') {
          list = list.filter(m => m.storeId === params.storeId);
        }

        const totalItems = list.length;
        const totalPages = Math.ceil(totalItems / params.pageSize) || 1;
        const page = Math.max(1, Math.min(params.page, totalPages));
        const items = list.slice((page - 1) * params.pageSize, page * params.pageSize);

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
}
