import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { StockAlertService } from '../../services/stock-alert.service';
import { StockAlert, AlertType } from '../../models/alert.model';
import { NotificationService } from '../../../products/services/notification.service';

@Component({
  selector: 'app-alerts-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="alerts-page font-sans animate-fade-in">
      
      <!-- Page Header -->
      <div class="page-header mb-6">
        <div>
          <h1 class="page-title font-bold text-2xl text-slate-900">
            <i class="fa-solid fa-bell text-red-600 mr-2"></i> Centre des Alertes de Stock
          </h1>
          <p class="page-sub text-sm text-slate-500">Détection automatique des ruptures, niveaux faibles et risques de surstockage.</p>
        </div>
      </div>

      <!-- Alert Category Tabs -->
      <div class="tabs-row mb-6">
        <button (click)="activeTab = 'ALL'" [class.active]="activeTab === 'ALL'" class="tab-btn">
          Toutes les alertes ({{ alerts.length }})
        </button>
        <button (click)="activeTab = 'OUT_OF_STOCK'" [class.active]="activeTab === 'OUT_OF_STOCK'" class="tab-btn danger font-bold">
          🔴 Ruptures ({{ countByType('OUT_OF_STOCK') }})
        </button>
        <button (click)="activeTab = 'LOW_STOCK'" [class.active]="activeTab === 'LOW_STOCK'" class="tab-btn warning font-bold">
          🟠 Stock Faible ({{ countByType('LOW_STOCK') }})
        </button>
        <button (click)="activeTab = 'OVER_STOCK'" [class.active]="activeTab === 'OVER_STOCK'" class="tab-btn purple font-bold">
          🟣 Surstock ({{ countByType('OVER_STOCK') }})
        </button>
      </div>

      <!-- Alerts List Grid -->
      <div class="alerts-grid">
        
        <div 
          *ngFor="let alert of filteredAlerts" 
          class="alert-full-card" 
          [ngClass]="cardBorderClass(alert.type)">
          
          <div class="alert-top">
            <div class="alert-badge-icon" [ngClass]="iconBadgeClass(alert.type)">
              <i class="fa-solid" [ngClass]="iconClass(alert.type)"></i>
            </div>

            <div class="alert-meta">
              <span class="type-title font-mono font-bold text-xs" [ngClass]="typeTextClass(alert.type)">
                {{ typeLabel(alert.type) }}
              </span>
              <h3 class="product-title font-bold text-slate-900 text-base">{{ alert.productName }}</h3>
              <span class="store-info text-xs text-slate-500">
                <i class="fa-solid fa-store"></i> {{ alert.storeName }} • SKU: {{ alert.sku }}
              </span>
            </div>
          </div>

          <div class="stock-diff-meter my-3">
            <div class="meter-row text-xs font-mono">
              <span>Stock Actuel : <strong class="text-slate-900">{{ alert.currentStock }}</strong></span>
              <span>Seuil Alerte : <strong class="text-slate-900">{{ alert.threshold }}</strong></span>
            </div>
            <div class="meter-bar-track">
              <div 
                class="meter-bar-fill" 
                [style.width.%]="calcMeterWidth(alert)"
                [ngClass]="barFillClass(alert.type)">
              </div>
            </div>
          </div>

          <div class="alert-bottom">
            <div class="suggested-box text-xs">
              <i class="fa-solid fa-lightbulb text-amber-600 mr-1"></i>
              <span class="font-semibold text-slate-700">{{ alert.suggestedAction }}</span>
            </div>

            <div class="alert-actions">
              <a [routerLink]="['/admin/stock/entries']" [queryParams]="{ productId: alert.productId, storeId: alert.storeId }" class="btn-alert-act btn-reorder font-bold">
                Réapprovisionner
              </a>
              <a [routerLink]="['/admin/stock/transfers']" [queryParams]="{ productId: alert.productId, targetStoreId: alert.storeId }" class="btn-alert-act btn-transfer font-bold">
                Demander Transfert
              </a>
              <button (click)="dismissAlert(alert.id)" class="btn-alert-act btn-dismiss" title="Ignorer alerte">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

        </div>

        <div *ngIf="filteredAlerts.length === 0" class="empty-alerts-box py-12 text-center text-slate-400">
          <i class="fa-solid fa-shield-cat text-4xl mb-2 text-emerald-500"></i>
          <h4 class="font-bold text-slate-800">Aucune alerte dans cette catégorie</h4>
          <p class="text-xs">Tous les niveaux de stock sont optimaux.</p>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .alerts-page { padding: 1.5rem; }

    .tabs-row { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .tab-btn {
      padding: 0.55rem 1rem;
      border-radius: 12px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #334155;
      font-size: 0.825rem;
      cursor: pointer;
    }
    .tab-btn.active { background: #0F172A; color: white; border-color: #0F172A; }

    .alerts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 1.25rem;
    }

    .alert-full-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 1.25rem;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card-border-danger { border-left: 4px solid #EF4444; }
    .card-border-warning { border-left: 4px solid #F59E0B; }
    .card-border-purple { border-left: 4px solid #8B5CF6; }

    .alert-top { display: flex; gap: 0.85rem; align-items: flex-start; }
    .alert-badge-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .ib-danger { background: #FEE2E2; color: #DC2626; }
    .ib-warning { background: #FEF3C7; color: #D97706; }
    .ib-purple { background: #EDE9FE; color: #6D28D9; }

    .alert-meta { flex: 1; }
    .type-text-danger { color: #DC2626; }
    .type-text-warning { color: #D97706; }
    .type-text-purple { color: #6D28D9; }

    .meter-bar-track {
      height: 6px;
      background: #F1F5F9;
      border-radius: 999px;
      overflow: hidden;
      margin-top: 0.3rem;
    }
    .meter-bar-fill { height: 100%; border-radius: 999px; }
    .fill-danger { background: #EF4444; }
    .fill-warning { background: #F59E0B; }
    .fill-purple { background: #8B5CF6; }

    .alert-bottom { border-top: 1px solid #F1F5F9; padding-top: 0.85rem; margin-top: 0.5rem; }
    .suggested-box { margin-bottom: 0.75rem; background: #FFFDF9; padding: 0.4rem 0.6rem; border-radius: 8px; border: 1px solid #FEF3C7; }

    .alert-actions { display: flex; gap: 0.4rem; align-items: center; }
    .btn-alert-act {
      padding: 0.4rem 0.75rem;
      border-radius: 8px;
      font-size: 0.75rem;
      text-decoration: none;
    }
    .btn-reorder { background: #0F172A; color: white; }
    .btn-transfer { background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1; }
    .btn-dismiss { background: none; border: 1px solid #E2E8F0; color: #94A3B8; cursor: pointer; }
  `]
})
export class AlertsPageComponent implements OnInit {
  alerts: StockAlert[] = [];
  activeTab: 'ALL' | AlertType = 'ALL';

  constructor(
    private alertService: StockAlertService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.alertService.getAlerts().subscribe(a => this.alerts = a);
  }

  get filteredAlerts(): StockAlert[] {
    if (this.activeTab === 'ALL') return this.alerts;
    return this.alerts.filter(a => a.type === this.activeTab);
  }

  countByType(type: AlertType): number {
    return this.alerts.filter(a => a.type === type).length;
  }

  typeLabel(type: AlertType): string {
    const map = { OUT_OF_STOCK: 'RUPTURE DE STOCK', LOW_STOCK: 'STOCK FAIBLE', OVER_STOCK: 'SURSTOCK' };
    return map[type] || type;
  }

  cardBorderClass(type: AlertType): string {
    const map = { OUT_OF_STOCK: 'card-border-danger', LOW_STOCK: 'card-border-warning', OVER_STOCK: 'card-border-purple' };
    return map[type] || '';
  }

  iconBadgeClass(type: AlertType): string {
    const map = { OUT_OF_STOCK: 'ib-danger', LOW_STOCK: 'ib-warning', OVER_STOCK: 'ib-purple' };
    return map[type] || '';
  }

  iconClass(type: AlertType): string {
    const map = { OUT_OF_STOCK: 'fa-ban', LOW_STOCK: 'fa-triangle-exclamation', OVER_STOCK: 'fa-boxes-stacked' };
    return map[type] || 'fa-bell';
  }

  typeTextClass(type: AlertType): string {
    const map = { OUT_OF_STOCK: 'type-text-danger', LOW_STOCK: 'type-text-warning', OVER_STOCK: 'type-text-purple' };
    return map[type] || '';
  }

  barFillClass(type: AlertType): string {
    const map = { OUT_OF_STOCK: 'fill-danger', LOW_STOCK: 'fill-warning', OVER_STOCK: 'fill-purple' };
    return map[type] || '';
  }

  calcMeterWidth(alert: StockAlert): number {
    if (alert.threshold === 0) return 100;
    return Math.min(100, Math.round((alert.currentStock / alert.threshold) * 100));
  }

  dismissAlert(id: number): void {
    this.alertService.resolveAlert(id).subscribe(() => {
      this.alerts = this.alerts.filter(a => a.id !== id);
    });
  }
}
