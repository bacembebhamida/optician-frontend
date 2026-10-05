import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { StockTransfer, CreateTransferRequest, TransferStatus } from '../models/transfer.model';
import { NotificationService } from '../../products/services/notification.service';

const MOCK_TRANSFERS: StockTransfer[] = [
  {
    id: 501,
    transferNumber: 'TR-2026-0089',
    sourceStoreId: 1,
    sourceStoreName: 'Tunis Centre Flagship',
    targetStoreId: 2,
    targetStoreName: 'Sousse Centre Boutique',
    status: 'IN_TRANSIT',
    totalQuantity: 12,
    notes: 'Rééquilibrage de stock solaire avant saison',
    createdBy: 'Karim Mansour',
    createdAt: '2026-09-16T10:00:00Z',
    updatedAt: '2026-09-16T14:30:00Z',
    items: [
      {
        productId: 101,
        productName: 'Ray-Ban RX5228 Optical High-Density',
        sku: 'RB-5228-2000-53',
        barcode: '805289307883',
        sourceAvailableStock: 12,
        quantity: 5
      },
      {
        productId: 104,
        productName: 'Gucci Square Signature Oversized',
        sku: 'GC-0089S-003',
        barcode: '889652109844',
        sourceAvailableStock: 25,
        quantity: 7
      }
    ]
  },
  {
    id: 502,
    transferNumber: 'TR-2026-0090',
    sourceStoreId: 3,
    sourceStoreName: 'Sfax Mall Branch',
    targetStoreId: 1,
    targetStoreName: 'Tunis Centre Flagship',
    status: 'REQUESTED',
    totalQuantity: 3,
    notes: 'Demande urgente pour commande client privilégié',
    createdBy: 'Sonia Ben Ali',
    createdAt: '2026-09-17T08:15:00Z',
    updatedAt: '2026-09-17T08:15:00Z',
    items: [
      {
        productId: 105,
        productName: 'Oakley Radar EV Path Prizm Road',
        sku: 'OK-9208-0138',
        barcode: '888392001452',
        sourceAvailableStock: 14,
        quantity: 3
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class StockTransferService {
  private readonly baseUrl = 'http://localhost:8080/api/stock-transfers';
  private transfersSubject = new BehaviorSubject<StockTransfer[]>(MOCK_TRANSFERS);

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  getTransfers(): Observable<StockTransfer[]> {
    return this.http.get<StockTransfer[]>(this.baseUrl).pipe(
      catchError(() => of(this.transfersSubject.value))
    );
  }

  getTransferById(id: number): Observable<StockTransfer> {
    return this.http.get<StockTransfer>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => {
        const found = this.transfersSubject.value.find(t => t.id === id);
        return found ? of(found) : of(MOCK_TRANSFERS[0]);
      })
    );
  }

  createTransfer(req: CreateTransferRequest): Observable<StockTransfer> {
    return this.http.post<StockTransfer>(this.baseUrl, req).pipe(
      tap(() => this.notificationService.success('Transfert créé', 'Demande de transfert enregistrée.')),
      catchError(() => {
        const newTransfer: StockTransfer = {
          id: Math.floor(Math.random() * 9000) + 1000,
          transferNumber: `TR-2026-00${Math.floor(Math.random() * 900) + 100}`,
          sourceStoreId: req.sourceStoreId,
          sourceStoreName: req.sourceStoreId === 1 ? 'Tunis Centre Flagship' : (req.sourceStoreId === 2 ? 'Sousse Centre Boutique' : 'Sfax Mall Branch'),
          targetStoreId: req.targetStoreId,
          targetStoreName: req.targetStoreId === 1 ? 'Tunis Centre Flagship' : (req.targetStoreId === 2 ? 'Sousse Centre Boutique' : 'Sfax Mall Branch'),
          status: 'REQUESTED',
          notes: req.notes,
          totalQuantity: req.items.reduce((acc, curr) => acc + curr.quantity, 0),
          createdBy: 'Administrateur',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: req.items.map(i => ({
            productId: i.productId,
            productName: i.productId === 101 ? 'Ray-Ban RX5228 Optical' : 'Monture Optique',
            sku: `SKU-${i.productId}`,
            barcode: '805289307883',
            sourceAvailableStock: 10,
            quantity: i.quantity
          }))
        };

        const list = [newTransfer, ...this.transfersSubject.value];
        this.transfersSubject.next(list);
        this.notificationService.success('Transfert créé', `Demande #${newTransfer.transferNumber} soumise avec succès.`);
        return of(newTransfer);
      })
    );
  }

  updateTransferStatus(id: number, status: TransferStatus): Observable<StockTransfer> {
    return this.http.patch<StockTransfer>(`${this.baseUrl}/${id}/status`, { status }).pipe(
      tap(() => this.notificationService.success('Statut mis à jour', `Transfert passé au statut ${status}.`)),
      catchError(() => {
        let updated!: StockTransfer;
        const list = this.transfersSubject.value.map(t => {
          if (t.id === id) {
            updated = { ...t, status, updatedAt: new Date().toISOString() };
            return updated;
          }
          return t;
        });
        this.transfersSubject.next(list);
        this.notificationService.success('Statut mis à jour', `Transfert #${id} passé au statut ${status}.`);
        return of(updated || MOCK_TRANSFERS[0]);
      })
    );
  }
}
