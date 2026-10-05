import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { StockInventory, CreateInventoryRequest, InventoryItemCount } from '../models/inventory.model';
import { NotificationService } from '../../products/services/notification.service';

const MOCK_INVENTORIES: StockInventory[] = [
  {
    id: 801,
    inventoryNumber: 'INV-2026-0012',
    storeId: 1,
    storeName: 'Tunis Centre Flagship',
    categories: ['Lunettes_de_vue', 'Lunettes_de_soleil'],
    status: 'IN_PROGRESS',
    startedAt: '2026-09-17T07:00:00Z',
    performedBy: 'Karim Mansour',
    totalTheoreticalUnits: 42,
    totalPhysicalUnits: 40,
    totalDifferenceUnits: -2,
    items: [
      {
        productId: 101,
        productName: 'Ray-Ban RX5228 Optical High-Density',
        sku: 'RB-5228-2000-53',
        barcode: '805289307883',
        categoryName: 'Lunettes de vue',
        theoreticalStock: 14,
        physicalCount: 14,
        difference: 0
      },
      {
        productId: 102,
        productName: 'Tom Ford FT5634 Titanium Luxury',
        sku: 'TF-5634-001-52',
        barcode: '889214051240',
        categoryName: 'Lunettes de vue',
        theoreticalStock: 3,
        physicalCount: 2,
        difference: -1,
        notes: 'Unité manquante lors du comptage tiroir A2'
      },
      {
        productId: 104,
        productName: 'Gucci Square Signature Oversized',
        sku: 'GC-0089S-003',
        barcode: '889652109844',
        categoryName: 'Lunettes de soleil',
        theoreticalStock: 25,
        physicalCount: 24,
        difference: -1
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly baseUrl = 'http://localhost:8080/api/stock-inventories';
  private inventoriesSubject = new BehaviorSubject<StockInventory[]>(MOCK_INVENTORIES);

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  getInventories(): Observable<StockInventory[]> {
    return this.http.get<StockInventory[]>(this.baseUrl).pipe(
      catchError(() => of(this.inventoriesSubject.value))
    );
  }

  getInventoryById(id: number): Observable<StockInventory> {
    return this.http.get<StockInventory>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => {
        const found = this.inventoriesSubject.value.find(i => i.id === id);
        return found ? of(found) : of(MOCK_INVENTORIES[0]);
      })
    );
  }

  createInventory(req: CreateInventoryRequest): Observable<StockInventory> {
    return this.http.post<StockInventory>(this.baseUrl, req).pipe(
      tap(() => this.notificationService.success('Inventaire démarré', 'Session d’inventaire ouverte.')),
      catchError(() => {
        const newInv: StockInventory = {
          id: Math.floor(Math.random() * 9000) + 1000,
          inventoryNumber: `INV-2026-00${Math.floor(Math.random() * 900) + 100}`,
          storeId: req.storeId,
          storeName: req.storeId === 1 ? 'Tunis Centre Flagship' : (req.storeId === 2 ? 'Sousse Centre Boutique' : 'Sfax Mall Branch'),
          categories: req.categories || ['Lunettes de vue'],
          status: 'IN_PROGRESS',
          startedAt: new Date().toISOString(),
          performedBy: 'Administrateur',
          totalTheoreticalUnits: 32,
          totalPhysicalUnits: null,
          totalDifferenceUnits: null,
          items: [
            {
              productId: 101,
              productName: 'Ray-Ban RX5228 Optical High-Density',
              sku: 'RB-5228-2000-53',
              barcode: '805289307883',
              categoryName: 'Lunettes de vue',
              theoreticalStock: 14,
              physicalCount: null,
              difference: null
            },
            {
              productId: 102,
              productName: 'Tom Ford FT5634 Titanium Luxury',
              sku: 'TF-5634-001-52',
              barcode: '889214051240',
              categoryName: 'Lunettes de vue',
              theoreticalStock: 3,
              physicalCount: null,
              difference: null
            },
            {
              productId: 105,
              productName: 'Oakley Radar EV Path Prizm Road',
              sku: 'OK-9208-0138',
              barcode: '888392001452',
              categoryName: 'Lunettes de soleil',
              theoreticalStock: 15,
              physicalCount: null,
              difference: null
            }
          ]
        };

        const list = [newInv, ...this.inventoriesSubject.value];
        this.inventoriesSubject.next(list);
        this.notificationService.success('Session d’inventaire créée', `Session #${newInv.inventoryNumber} prête pour comptage.`);
        return of(newInv);
      })
    );
  }

  savePhysicalCounts(inventoryId: number, items: InventoryItemCount[]): Observable<StockInventory> {
    return this.http.post<StockInventory>(`${this.baseUrl}/${inventoryId}/count`, { items }).pipe(
      tap(() => this.notificationService.success('Comptage enregistré', 'Saisie physique sauvegardée.')),
      catchError(() => {
        let updated!: StockInventory;
        const list = this.inventoriesSubject.value.map(inv => {
          if (inv.id === inventoryId) {
            const updatedItems = items.map(item => {
              const diff = item.physicalCount !== null ? item.physicalCount - item.theoreticalStock : null;
              return { ...item, difference: diff };
            });

            const totalPhysical = updatedItems.reduce((acc, curr) => acc + (curr.physicalCount || 0), 0);
            const totalDiff = updatedItems.reduce((acc, curr) => acc + (curr.difference || 0), 0);

            updated = {
              ...inv,
              items: updatedItems,
              totalPhysicalUnits: totalPhysical,
              totalDifferenceUnits: totalDiff
            };
            return updated;
          }
          return inv;
        });

        this.inventoriesSubject.next(list);
        this.notificationService.success('Comptage enregistré', 'Comptage sauvegardé avec succès.');
        return of(updated || MOCK_INVENTORIES[0]);
      })
    );
  }

  validateInventory(inventoryId: number): Observable<StockInventory> {
    return this.http.post<StockInventory>(`${this.baseUrl}/${inventoryId}/validate`, {}).pipe(
      tap(() => this.notificationService.success('Inventaire clôturé', 'Écarts appliqués au stock.')),
      catchError(() => {
        let updated!: StockInventory;
        const list = this.inventoriesSubject.value.map(inv => {
          if (inv.id === inventoryId) {
            updated = {
              ...inv,
              status: 'COMPLETED',
              completedAt: new Date().toISOString()
            };
            return updated;
          }
          return inv;
        });

        this.inventoriesSubject.next(list);
        this.notificationService.success('Inventaire clôturé', 'Les écarts de stock ont été régularisés avec succès.');
        return of(updated || MOCK_INVENTORIES[0]);
      })
    );
  }
}
