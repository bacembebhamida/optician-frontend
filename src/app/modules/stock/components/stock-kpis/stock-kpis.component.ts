import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockDashboardSummary } from '../../models/stock.model';

@Component({
  selector: 'app-stock-kpis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpis-grid font-sans">
      
      <!-- Total Stock Units -->
      <div class="kpi-card gold-accent">
        <div class="kpi-header">
          <span class="kpi-label">Stock Total</span>
          <div class="kpi-icon-box gold"><i class="fa-solid fa-boxes-stacked"></i></div>
        </div>
        <div class="kpi-body">
          <span class="kpi-value font-bold">{{ (summary?.totalStockUnits || 0) | number }}</span>
          <span class="kpi-unit">unités en magasin</span>
        </div>
        <div class="kpi-footer text-amber-700 font-semibold">
          <i class="fa-solid fa-store"></i> {{ summary?.availableProductsCount || 0 }} références actives
        </div>
      </div>

      <!-- Rupture (Out of Stock) -->
      <div class="kpi-card danger-accent">
        <div class="kpi-header">
          <span class="kpi-label">Ruptures de Stock</span>
          <div class="kpi-icon-box danger"><i class="fa-solid fa-triangle-exclamation"></i></div>
        </div>
        <div class="kpi-body">
          <span class="kpi-value font-bold text-red-600">{{ summary?.outOfStockCount || 0 }}</span>
          <span class="kpi-unit">référence(s) à 0</span>
        </div>
        <div class="kpi-footer text-red-700 font-semibold">
          <i class="fa-solid fa-circle-exclamation"></i> Action immédiate requise
        </div>
      </div>

      <!-- Stock Faible (Low Stock) -->
      <div class="kpi-card warning-accent">
        <div class="kpi-header">
          <span class="kpi-label">Stock Faible</span>
          <div class="kpi-icon-box warning"><i class="fa-solid fa-arrow-down-short-wide"></i></div>
        </div>
        <div class="kpi-body">
          <span class="kpi-value font-bold text-amber-600">{{ summary?.lowStockCount || 0 }}</span>
          <span class="kpi-unit">sous le seuil min</span>
        </div>
        <div class="kpi-footer text-amber-700 font-semibold">
          <i class="fa-solid fa-truck-ramp-box"></i> Point de réappro atteint
        </div>
      </div>

      <!-- Stock Réservé -->
      <div class="kpi-card info-accent">
        <div class="kpi-header">
          <span class="kpi-label">Stock Réservé</span>
          <div class="kpi-icon-box info"><i class="fa-solid fa-clock-rotate-left"></i></div>
        </div>
        <div class="kpi-body">
          <span class="kpi-value font-bold text-blue-600">{{ (summary?.reservedStockUnits || 0) | number }}</span>
          <span class="kpi-unit">unités réservées client</span>
        </div>
        <div class="kpi-footer text-blue-700 font-semibold">
          <i class="fa-solid fa-cart-shopping"></i> Commandes &amp; atelier
        </div>
      </div>

      <!-- Transferts & Inventaires -->
      <div class="kpi-card purple-accent">
        <div class="kpi-header">
          <span class="kpi-label">Flux &amp; Inventaires</span>
          <div class="kpi-icon-box purple"><i class="fa-solid fa-right-left"></i></div>
        </div>
        <div class="kpi-body flex-row gap-4">
          <div>
            <span class="kpi-value sm font-bold text-purple-700">{{ summary?.activeTransfersCount || 0 }}</span>
            <span class="kpi-unit">Transfert(s)</span>
          </div>
          <div class="border-l border-slate-200 pl-4">
            <span class="kpi-value sm font-bold text-indigo-700">{{ summary?.activeInventoriesCount || 0 }}</span>
            <span class="kpi-unit">Inventaire(s)</span>
          </div>
        </div>
        <div class="kpi-footer text-purple-700 font-semibold">
          <i class="fa-solid fa-list-check"></i> Opérations en cours
        </div>
      </div>

    </div>
  `,
  styles: [`
    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    .kpi-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.75rem;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
    }
    .kpi-card.gold-accent::before { background: linear-gradient(90deg, #C5A880, #E5C99F); }
    .kpi-card.danger-accent::before { background: #EF4444; }
    .kpi-card.warning-accent::before { background: #F59E0B; }
    .kpi-card.info-accent::before { background: #3B82F6; }
    .kpi-card.purple-accent::before { background: #8B5CF6; }

    .kpi-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .kpi-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .kpi-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .kpi-icon-box.gold { background: #FEF3C7; color: #D97706; }
    .kpi-icon-box.danger { background: #FEE2E2; color: #DC2626; }
    .kpi-icon-box.warning { background: #FEF3C7; color: #D97706; }
    .kpi-icon-box.info { background: #DBEAFE; color: #2563EB; }
    .kpi-icon-box.purple { background: #EDE9FE; color: #7C3AED; }

    .kpi-body {
      display: flex;
      flex-direction: column;
    }
    .kpi-value {
      font-size: 1.85rem;
      line-height: 1.1;
      color: #0F172A;
      font-family: monospace;
    }
    .kpi-value.sm { font-size: 1.4rem; }
    .kpi-unit {
      font-size: 0.775rem;
      color: #64748B;
      margin-top: 0.2rem;
    }

    .kpi-footer {
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding-top: 0.5rem;
      border-top: 1px solid #F1F5F9;
    }
  `]
})
export class StockKpisComponent {
  @Input() summary?: StockDashboardSummary;
}
