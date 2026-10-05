import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockItem, StockStatus } from '../../models/stock.model';
import { HasStockPermissionDirective } from '../../directives/has-stock-permission.directive';

@Component({
  selector: 'app-stock-table',
  standalone: true,
  imports: [CommonModule, HasStockPermissionDirective],
  template: `
    <div class="table-wrapper font-sans">
      
      <!-- Skeleton Loading State -->
      <div *ngIf="isLoading" class="skeleton-container">
        <div *ngFor="let i of [1,2,3,4,5]" class="skeleton-row">
          <div class="skeleton-box img-sk"></div>
          <div class="skeleton-box text-sk flex-2"></div>
          <div class="skeleton-box text-sk"></div>
          <div class="skeleton-box badge-sk"></div>
          <div class="skeleton-box text-sk"></div>
        </div>
      </div>

      <!-- Main Data Content -->
      <ng-container *ngIf="!isLoading">

        <!-- Empty State -->
        <div *ngIf="!items || items.length === 0" class="empty-state">
          <div class="empty-icon-box">
            <i class="fa-solid fa-boxes-packing"></i>
          </div>
          <h3 class="empty-title font-bold">Aucun produit en stock trouvé</h3>
          <p class="empty-sub">Aucun article ne correspond à vos critères de recherche ou de filtrage.</p>
        </div>

        <!-- Desktop & Tablet Table -->
        <div *ngIf="items && items.length > 0" class="responsive-table-container">
          <table class="stock-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>SKU / Barcode</th>
                <th>Magasin</th>
                <th class="text-center">Actuel</th>
                <th class="text-center">Réservé</th>
                <th class="text-center">Disponible</th>
                <th class="text-center">Seuil Min</th>
                <th class="text-center">Statut</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items" class="stock-tr">
                
                <!-- Product Column -->
                <td>
                  <div class="product-cell">
                    <img 
                      [src]="item.productImageUrl || 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&auto=format&fit=crop&q=80'" 
                      [alt]="item.productName" 
                      class="product-thumb">
                    <div class="product-details">
                      <span class="brand-tag font-mono">{{ item.brandName }}</span>
                      <span class="product-name font-bold">{{ item.productName }}</span>
                      <span class="category-name">{{ item.categoryName }}</span>
                    </div>
                  </div>
                </td>

                <!-- SKU & Barcode -->
                <td>
                  <div class="sku-cell font-mono">
                    <span class="sku-code font-bold">{{ item.sku }}</span>
                    <span class="barcode-badge"><i class="fa-solid fa-barcode"></i> {{ item.barcode }}</span>
                  </div>
                </td>

                <!-- Store -->
                <td>
                  <div class="store-cell">
                    <i class="fa-solid fa-store store-ic"></i>
                    <span class="store-name font-semibold">{{ item.storeName }}</span>
                  </div>
                </td>

                <!-- Current Stock -->
                <td class="text-center font-mono">
                  <span class="stock-val font-bold">{{ item.currentStock }}</span>
                </td>

                <!-- Reserved Stock -->
                <td class="text-center font-mono">
                  <span class="reserved-val text-blue-600 font-semibold">{{ item.reservedStock }}</span>
                </td>

                <!-- Available Stock -->
                <td class="text-center font-mono">
                  <span class="avail-val font-bold" [class.text-emerald-700]="item.availableStock > 0" [class.text-red-600]="item.availableStock === 0">
                    {{ item.availableStock }}
                  </span>
                </td>

                <!-- Minimum Threshold -->
                <td class="text-center font-mono">
                  <span class="threshold-val text-slate-500">{{ item.minimumThreshold }} <span class="text-xs text-slate-400">(Re: {{ item.reorderPoint }})</span></span>
                </td>

                <!-- Status Badge -->
                <td class="text-center">
                  <span class="status-badge" [ngClass]="statusBadgeClass(item.status)">
                    <span class="dot"></span>
                    {{ statusLabel(item.status) }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="text-right">
                  <div class="actions-group">
                    
                    <!-- Entry Action -->
                    <button 
                      *appHasStockPermission="'STOCK_ENTRY'"
                      (click)="onEntry.emit(item)" 
                      class="act-btn btn-entry" 
                      title="Entrée de stock">
                      <i class="fa-solid fa-plus"></i> Entrée
                    </button>

                    <!-- Exit Action -->
                    <button 
                      *appHasStockPermission="'STOCK_EXIT'"
                      (click)="onExit.emit(item)" 
                      class="act-btn btn-exit" 
                      title="Sortie de stock">
                      <i class="fa-solid fa-minus"></i> Sortie
                    </button>

                    <!-- Transfer Action -->
                    <button 
                      *appHasStockPermission="'STOCK_TRANSFER'"
                      (click)="onTransfer.emit(item)" 
                      class="act-btn btn-transfer" 
                      title="Demander transfert">
                      <i class="fa-solid fa-right-left"></i>
                    </button>

                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

      </ng-container>

    </div>
  `,
  styles: [`
    .table-wrapper {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
    }

    /* Skeleton */
    .skeleton-container {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .skeleton-row {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .skeleton-box {
      height: 48px;
      background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 10px;
    }
    .img-sk { width: 48px; flex-shrink: 0; }
    .text-sk { flex: 1; }
    .badge-sk { width: 100px; }
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Empty state */
    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .empty-icon-box {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: #FEF3C7;
      color: #D97706;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }
    .empty-title { font-size: 1.15rem; color: #0F172A; }
    .empty-sub { font-size: 0.875rem; color: #64748B; max-width: 400px; margin-top: 0.25rem; }

    /* Table styles */
    .responsive-table-container {
      width: 100%;
      overflow-x: auto;
    }
    .stock-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .stock-table th {
      background: #F8FAFC;
      padding: 0.85rem 1rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #E2E8F0;
    }
    .stock-tr {
      border-bottom: 1px solid #F1F5F9;
      transition: background 0.15s ease;
    }
    .stock-tr:hover {
      background: #F8FAFC;
    }
    .stock-table td {
      padding: 0.9rem 1rem;
      font-size: 0.875rem;
      vertical-align: middle;
    }

    .product-cell {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .product-thumb {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      object-fit: cover;
      border: 1px solid #E2E8F0;
    }
    .product-details {
      display: flex;
      flex-direction: column;
    }
    .brand-tag {
      font-size: 0.675rem;
      color: #C5A880;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .product-name {
      font-size: 0.9rem;
      color: #0F172A;
      line-height: 1.25;
    }
    .category-name {
      font-size: 0.725rem;
      color: #64748B;
    }

    .sku-cell {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .sku-code { font-size: 0.8rem; color: #1E293B; }
    .barcode-badge {
      font-size: 0.7rem;
      color: #64748B;
      background: #F1F5F9;
      padding: 0.15rem 0.4rem;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      width: fit-content;
    }

    .store-cell {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: #334155;
      font-size: 0.825rem;
    }
    .store-ic { color: #94A3B8; font-size: 0.8rem; }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .status-badge .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .status-available { background: #DCFCE7; color: #15803D; }
    .status-available .dot { background: #16A34A; }
    
    .status-low { background: #FEF3C7; color: #B45309; }
    .status-low .dot { background: #D97706; }

    .status-out { background: #FEE2E2; color: #B91C1C; }
    .status-out .dot { background: #DC2626; }

    .status-over { background: #EDE9FE; color: #6D28D9; }
    .status-over .dot { background: #7C3AED; }

    .actions-group {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.4rem;
    }

    .act-btn {
      padding: 0.35rem 0.65rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      transition: all 0.15s ease;
    }
    .btn-entry:hover { background: #DCFCE7; border-color: #86EFAC; color: #15803D; }
    .btn-exit:hover { background: #FEE2E2; border-color: #FCA5A5; color: #B91C1C; }
    .btn-transfer:hover { background: #FEF3C7; border-color: #FCD34D; color: #B45309; }
  `]
})
export class StockTableComponent {
  @Input() items: StockItem[] = [];
  @Input() isLoading: boolean = false;

  @Output() onEntry = new EventEmitter<StockItem>();
  @Output() onExit = new EventEmitter<StockItem>();
  @Output() onTransfer = new EventEmitter<StockItem>();

  statusLabel(status: StockStatus): string {
    const map: Record<StockStatus, string> = {
      AVAILABLE: 'Disponible',
      LOW_STOCK: 'Stock Faible',
      OUT_OF_STOCK: 'Rupture',
      OVER_STOCK: 'Surstock'
    };
    return map[status] || status;
  }

  statusBadgeClass(status: StockStatus): string {
    const map: Record<StockStatus, string> = {
      AVAILABLE: 'status-available',
      LOW_STOCK: 'status-low',
      OUT_OF_STOCK: 'status-out',
      OVER_STOCK: 'status-over'
    };
    return map[status] || '';
  }
}
