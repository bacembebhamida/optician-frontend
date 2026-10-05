import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryItemCount } from '../../models/inventory.model';

@Component({
  selector: 'app-inventory-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inventory-container font-sans">
      
      <!-- Table Summary Bar -->
      <div class="inv-summary-bar">
        <div class="sum-box">
          <span class="s-label">Théorique Total</span>
          <span class="s-val font-mono font-bold">{{ totalTheoretical }}</span>
          <span class="s-unit">unités système</span>
        </div>

        <div class="sum-box">
          <span class="s-label">Saisie Physique</span>
          <span class="s-val font-mono font-bold text-blue-700">{{ totalPhysical !== null ? totalPhysical : '—' }}</span>
          <span class="s-unit">unités comptées</span>
        </div>

        <div class="sum-box" [class.danger]="netDifference < 0" [class.success]="netDifference > 0" [class.neutral]="netDifference === 0">
          <span class="s-label">Écart Réseau</span>
          <span class="s-val font-mono font-bold">
            {{ netDifference > 0 ? '+' : '' }}{{ netDifference }}
          </span>
          <span class="s-unit">différence totale</span>
        </div>
      </div>

      <!-- Main Inventory Counting Table -->
      <div class="responsive-table-container">
        <table class="inventory-table">
          <thead>
            <tr>
              <th>Référence / Produit</th>
              <th>Catégorie</th>
              <th>Code-barres</th>
              <th class="text-center">Stock Théorique</th>
              <th class="text-center">Comptage Physique</th>
              <th class="text-center">Écart</th>
              <th>Remarques</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items" class="inv-tr">
              
              <!-- Product Info -->
              <td>
                <div class="product-cell">
                  <span class="product-name font-bold">{{ item.productName }}</span>
                  <span class="sku-tag font-mono">SKU: {{ item.sku }}</span>
                </div>
              </td>

              <!-- Category -->
              <td><span class="cat-pill">{{ item.categoryName }}</span></td>

              <!-- Barcode -->
              <td class="font-mono text-xs">
                <span class="barcode-chip"><i class="fa-solid fa-barcode"></i> {{ item.barcode }}</span>
              </td>

              <!-- Theoretical Stock -->
              <td class="text-center font-mono font-bold text-slate-700">
                {{ item.theoreticalStock }}
              </td>

              <!-- Physical Count Input -->
              <td class="text-center">
                <input 
                  type="number" 
                  [(ngModel)]="item.physicalCount" 
                  (ngModelChange)="onCountChange(item)"
                  placeholder="Compter..."
                  min="0"
                  class="count-input font-mono font-bold">
              </td>

              <!-- Realtime Difference Badge -->
              <td class="text-center font-mono">
                <span *ngIf="item.physicalCount !== null" class="diff-badge" [ngClass]="diffBadgeClass(item.difference)">
                  {{ item.difference! > 0 ? '+' : '' }}{{ item.difference }}
                </span>
                <span *ngIf="item.physicalCount === null" class="text-slate-400 text-xs italic">Non compté</span>
              </td>

              <!-- Notes -->
              <td>
                <input 
                  type="text" 
                  [(ngModel)]="item.notes" 
                  placeholder="Ajouter une observation..."
                  class="notes-input text-xs">
              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <!-- Action Buttons -->
      <div class="inv-actions-bar">
        <button (click)="onSaveDraft.emit(items)" class="btn-save-draft">
          <i class="fa-solid fa-floppy-disk mr-1"></i> Sauvegarder le Comptage
        </button>

        <button (click)="onValidate.emit()" class="btn-validate-inventory font-bold">
          <i class="fa-solid fa-circle-check mr-1"></i> Clôturer &amp; Régulariser le Stock
        </button>
      </div>

    </div>
  `,
  styles: [`
    .inventory-container {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 1.25rem;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
    }

    .inv-summary-bar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .sum-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .sum-box.danger { background: #FEE2E2; border-color: #F87171; color: #991B1B; }
    .sum-box.success { background: #DCFCE7; border-color: #86EFAC; color: #166534; }
    .s-label { font-size: 0.725rem; font-weight: 700; color: #64748B; text-transform: uppercase; }
    .s-val { font-size: 1.5rem; margin: 0.2rem 0; }
    .s-unit { font-size: 0.7rem; color: #94A3B8; }

    .responsive-table-container { width: 100%; overflow-x: auto; }
    .inventory-table { width: 100%; border-collapse: collapse; text-align: left; }
    .inventory-table th {
      background: #F8FAFC;
      padding: 0.85rem 1rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      border-bottom: 1px solid #E2E8F0;
    }
    .inv-tr { border-bottom: 1px solid #F1F5F9; }
    .inv-tr:hover { background: #F8FAFC; }
    .inventory-table td { padding: 0.85rem 1rem; vertical-align: middle; }

    .product-cell { display: flex; flex-direction: column; }
    .product-name { font-size: 0.875rem; color: #0F172A; }
    .sku-tag { font-size: 0.7rem; color: #64748B; }

    .cat-pill {
      background: #F1F5F9;
      color: #475569;
      font-size: 0.725rem;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }
    .barcode-chip {
      background: #F8FAFC;
      color: #334155;
      padding: 0.15rem 0.4rem;
      border-radius: 6px;
      border: 1px solid #CBD5E1;
    }

    .count-input {
      width: 90px;
      padding: 0.4rem 0.6rem;
      border: 2px solid #CBD5E1;
      border-radius: 8px;
      text-align: center;
      font-size: 1rem;
      background: #FFFFFF;
    }
    .count-input:focus {
      outline: none;
      border-color: #C5A880;
      box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.15);
    }

    .diff-badge {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      font-size: 0.825rem;
      font-weight: 700;
    }
    .diff-exact { background: #DCFCE7; color: #15803D; }
    .diff-negative { background: #FEE2E2; color: #B91C1C; }
    .diff-positive { background: #FEF3C7; color: #B45309; }

    .notes-input {
      width: 100%;
      padding: 0.35rem 0.5rem;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
    }

    .inv-actions-bar {
      display: flex;
      justify-content: flex-end;
      gap: 0.85rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #F1F5F9;
    }
    .btn-save-draft {
      padding: 0.65rem 1.25rem;
      border-radius: 10px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #334155;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-validate-inventory {
      padding: 0.65rem 1.4rem;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #FFFFFF;
      cursor: pointer;
      font-size: 0.85rem;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    }

    @media (max-width: 640px) {
      .inv-summary-bar { grid-template-columns: 1fr; }
    }
  `]
})
export class InventoryTableComponent {
  @Input() items: InventoryItemCount[] = [];

  @Output() onSaveDraft = new EventEmitter<InventoryItemCount[]>();
  @Output() onValidate = new EventEmitter<void>();

  onCountChange(item: InventoryItemCount): void {
    if (item.physicalCount !== null && !isNaN(item.physicalCount)) {
      item.difference = item.physicalCount - item.theoreticalStock;
    } else {
      item.difference = null;
    }
  }

  diffBadgeClass(diff: number | null): string {
    if (diff === null) return '';
    if (diff === 0) return 'diff-exact';
    if (diff < 0) return 'diff-negative';
    return 'diff-positive';
  }

  get totalTheoretical(): number {
    return this.items.reduce((acc, curr) => acc + curr.theoreticalStock, 0);
  }

  get totalPhysical(): number | null {
    const counted = this.items.filter(i => i.physicalCount !== null);
    if (counted.length === 0) return null;
    return counted.reduce((acc, curr) => acc + (curr.physicalCount || 0), 0);
  }

  get netDifference(): number {
    return this.items.reduce((acc, curr) => acc + (curr.difference || 0), 0);
  }
}
