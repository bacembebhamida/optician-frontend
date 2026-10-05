import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreStockLocationSummary } from '../../models/stock.model';

@Component({
  selector: 'app-store-location-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="store-card" [class.selected]="isSelected">
      
      <!-- Store Header -->
      <div class="card-head">
        <div class="store-icon">
          <i class="fa-solid fa-store"></i>
        </div>
        
        <div class="store-title-wrap">
          <h3 class="store-name font-bold">{{ location.storeName }}</h3>
          <span class="store-address"><i class="fa-solid fa-location-dot"></i> {{ location.city }} • {{ location.storeAddress }}</span>
        </div>

        <button (click)="selectStore.emit(location.storeId)" class="btn-select-store font-bold">
          {{ isSelected ? 'Sélectionné' : 'Consulter Stock' }}
        </button>
      </div>

      <!-- Metrics Breakdown Grid -->
      <div class="metrics-grid font-mono">
        
        <div class="metric-box">
          <span class="m-label font-sans">Produits</span>
          <span class="m-value font-bold">{{ location.totalProductsCount }}</span>
          <span class="m-sub font-sans">références</span>
        </div>

        <div class="metric-box highlight-gold">
          <span class="m-label font-sans">Stock Total</span>
          <span class="m-value font-bold text-amber-700">{{ location.totalUnitsCount }}</span>
          <span class="m-sub font-sans">unités</span>
        </div>

        <div class="metric-box warning" [class.has-issues]="location.lowStockCount > 0">
          <span class="m-label font-sans">Stock Faible</span>
          <span class="m-value font-bold text-amber-600">{{ location.lowStockCount }}</span>
          <span class="m-sub font-sans">seuil min</span>
        </div>

        <div class="metric-box danger" [class.has-issues]="location.outOfStockCount > 0">
          <span class="m-label font-sans">Ruptures</span>
          <span class="m-value font-bold text-red-600">{{ location.outOfStockCount }}</span>
          <span class="m-sub font-sans">références 0</span>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .store-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
      transition: all 0.25s ease;
    }
    .store-card:hover {
      border-color: #C5A880;
      transform: translateY(-2px);
    }
    .store-card.selected {
      border: 2px solid #C5A880;
      box-shadow: 0 10px 25px -5px rgba(197, 168, 128, 0.25);
    }

    .card-head {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .store-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: #FEF3C7;
      color: #D97706;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    .store-title-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .store-name { font-size: 1.1rem; color: #0F172A; }
    .store-address { font-size: 0.775rem; color: #64748B; }

    .btn-select-store {
      padding: 0.45rem 0.85rem;
      font-size: 0.775rem;
      border-radius: 10px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #334155;
      cursor: pointer;
      white-space: nowrap;
    }
    .store-card.selected .btn-select-store {
      background: #C5A880;
      color: #FFFFFF;
      border: none;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
    }
    .metric-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 0.75rem 0.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
    }
    .metric-box.highlight-gold { background: #FEF3C7; border-color: #FCD34D; }
    .metric-box.warning.has-issues { background: #FEF3C7; border-color: #FCD34D; }
    .metric-box.danger.has-issues { background: #FEE2E2; border-color: #F87171; }

    .m-label { font-size: 0.725rem; color: #64748B; font-weight: 700; }
    .m-value { font-size: 1.2rem; color: #0F172A; margin: 0.15rem 0; }
    .m-sub { font-size: 0.7rem; color: #94A3B8; }

    @media (max-width: 640px) {
      .metrics-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class StoreLocationCardComponent {
  @Input() location!: StoreStockLocationSummary;
  @Input() isSelected: boolean = false;

  @Output() selectStore = new EventEmitter<number>();
}
