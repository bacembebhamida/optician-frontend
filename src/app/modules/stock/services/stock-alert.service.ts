import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StockAlert } from '../models/alert.model';
import { NotificationService } from '../../products/services/notification.service';

const MOCK_ALERTS: StockAlert[] = [
  {
    id: 1,
    productId: 103,
    productName: 'Ray-Ban Aviator Classic Gold Polarized',
    sku: 'RB-3025-001-58',
    barcode: '805289004829',
    productImageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
    storeId: 2,
    storeName: 'Sousse Centre Boutique',
    type: 'OUT_OF_STOCK',
    currentStock: 0,
    threshold: 4,
    suggestedAction: 'Déclencher commande fournisseur urgente ou transfert depuis Tunis Centre',
    createdAt: '2026-09-15T09:00:00Z'
  },
  {
    id: 2,
    productId: 102,
    productName: 'Tom Ford FT5634 Titanium Luxury',
    sku: 'TF-5634-001-52',
    barcode: '889214051240',
    productImageUrl: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80',
    storeId: 1,
    storeName: 'Tunis Centre Flagship',
    type: 'LOW_STOCK',
    currentStock: 3,
    threshold: 5,
    suggestedAction: 'Réapprovisionner 6 unités (Seuil min atteint)',
    createdAt: '2026-09-16T11:00:00Z'
  },
  {
    id: 3,
    productId: 104,
    productName: 'Gucci Square Signature Oversized',
    sku: 'GC-0089S-003',
    barcode: '889652109844',
    productImageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80',
    storeId: 1,
    storeName: 'Tunis Centre Flagship',
    type: 'OVER_STOCK',
    currentStock: 28,
    threshold: 10,
    suggestedAction: 'Transférer 10 unités vers Sousse ou Sfax Mall',
    createdAt: '2026-09-14T15:30:00Z'
  }
];

@Injectable({
  providedIn: 'root'
})
export class StockAlertService {
  private readonly baseUrl = 'http://localhost:8080/api/admin/stock/alerts';
  private alertsSubject = new BehaviorSubject<StockAlert[]>(MOCK_ALERTS);

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  getAlerts(): Observable<StockAlert[]> {
    return this.http.get<StockAlert[]>(this.baseUrl).pipe(
      catchError(() => of(this.alertsSubject.value))
    );
  }

  resolveAlert(id: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/${id}/resolve`, {}).pipe(
      catchError(() => {
        const filtered = this.alertsSubject.value.filter(a => a.id !== id);
        this.alertsSubject.next(filtered);
        this.notificationService.success('Alerte acquittée', 'Action de régularisation prise en compte.');
        return of(true);
      })
    );
  }
}
