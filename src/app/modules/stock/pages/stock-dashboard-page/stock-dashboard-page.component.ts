import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { StockService } from '../../services/stock.service';
import { StockDashboardSummary, StoreStockLocationSummary } from '../../models/stock.model';
import { StockKpisComponent } from '../../components/stock-kpis/stock-kpis.component';
import { StoreLocationCardComponent } from '../../components/store-location-card/store-location-card.component';
import { StockAlertService } from '../../services/stock-alert.service';
import { StockAlert } from '../../models/alert.model';

@Component({
  selector: 'app-stock-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, StockKpisComponent, StoreLocationCardComponent],
  template: `
    <div class="stock-dashboard-page font-sans animate-fade-in">
      
      <!-- Top Action Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title font-bold">
            <i class="fa-solid fa-boxes-stacked text-amber-600 mr-2"></i> Tableau de Bord du Stock Multi-site
          </h1>
          <p class="page-sub">Vue synthétique de l'inventaire, des alertes de rupture et du flux des magasins.</p>
        </div>

        <div class="header-actions">
          <a routerLink="/admin/stock/entries" class="btn-head-action btn-gold">
            <i class="fa-solid fa-plus"></i> Entrée Stock
          </a>
          <a routerLink="/admin/stock/exits" class="btn-head-action btn-dark">
            <i class="fa-solid fa-minus"></i> Sortie Stock
          </a>
          <a routerLink="/admin/stock/transfers" class="btn-head-action btn-outline">
            <i class="fa-solid fa-right-left"></i> Nouveau Transfert
          </a>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="mb-6">
        <app-stock-kpis [summary]="dashboardSummary"></app-stock-kpis>
      </div>

      <!-- Quick Action Navigation Bar -->
      <div class="quick-nav-bar mb-6">
        <span class="quick-nav-title font-bold"><i class="fa-solid fa-compass"></i> Modules Stock :</span>
        <div class="quick-nav-links">
          <a routerLink="/admin/stock/products" class="q-link"><i class="fa-solid fa-list"></i> Liste Produits</a>
          <a routerLink="/admin/stock/locations" class="q-link"><i class="fa-solid fa-store"></i> Stock par Magasin</a>
          <a routerLink="/admin/stock/transfers" class="q-link"><i class="fa-solid fa-truck-ramp-box"></i> Transferts ({{ dashboardSummary?.activeTransfersCount || 0 }})</a>
          <a routerLink="/admin/stock/inventory" class="q-link"><i class="fa-solid fa-clipboard-check"></i> Inventaires</a>
          <a routerLink="/admin/stock/movements" class="q-link"><i class="fa-solid fa-clock-rotate-left"></i> Historique</a>
          <a routerLink="/admin/stock/alerts" class="q-link text-red-600 font-bold"><i class="fa-solid fa-bell"></i> Alertes ({{ alerts.length }})</a>
        </div>
      </div>

      <!-- Grid 2 Columns: Stores Breakdown & Urgent Alerts -->
      <div class="dashboard-grid-2">
        
        <!-- Stores Stock Breakdown Cards -->
        <div class="section-box">
          <div class="box-head">
            <h2 class="box-title font-bold"><i class="fa-solid fa-store text-amber-600"></i> Stock Réseau par Magasin</h2>
            <a routerLink="/admin/stock/locations" class="box-link font-semibold">Voir tout le réseau <i class="fa-solid fa-arrow-right"></i></a>
          </div>

          <div class="stores-stack">
            <app-store-location-card 
              *ngFor="let loc of locations" 
              [location]="loc"
              (selectStore)="navigateToStoreProducts($event)">
            </app-store-location-card>
          </div>
        </div>

        <!-- Recent Stock Alerts Box -->
        <div class="section-box">
          <div class="box-head">
            <h2 class="box-title font-bold"><i class="fa-solid fa-triangle-exclamation text-red-600"></i> Alertes de Stock Prioritaires</h2>
            <a routerLink="/admin/stock/alerts" class="box-link font-semibold">Gérer les alertes <i class="fa-solid fa-arrow-right"></i></a>
          </div>

          <div class="alerts-list">
            <div *ngFor="let alert of alerts" class="alert-item-card" [class.danger]="alert.type==='OUT_OF_STOCK'" [class.warning]="alert.type==='LOW_STOCK'">
              <div class="alert-icon">
                <i class="fa-solid" [class.fa-ban]="alert.type==='OUT_OF_STOCK'" [class.fa-triangle-exclamation]="alert.type==='LOW_STOCK'" [class.fa-boxes-stacked]="alert.type==='OVER_STOCK'"></i>
              </div>
              
              <div class="alert-body">
                <span class="alert-p-name font-bold">{{ alert.productName }}</span>
                <span class="alert-store font-mono"><i class="fa-solid fa-location-dot"></i> {{ alert.storeName }} • Stock: {{ alert.currentStock }} (Seuil: {{ alert.threshold }})</span>
                <span class="alert-action text-xs font-semibold">{{ alert.suggestedAction }}</span>
              </div>

              <a [routerLink]="['/admin/stock/entries']" [queryParams]="{ productId: alert.productId, storeId: alert.storeId }" class="btn-resolve-quick font-bold">
                Réappro
              </a>
            </div>

            <div *ngIf="alerts.length === 0" class="empty-alerts text-center text-slate-400 py-8 font-sans">
              <i class="fa-solid fa-circle-check text-emerald-500 text-2xl mb-2"></i>
              <p>Aucune alerte de stock critique à signaler.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .stock-dashboard-page {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-title { font-size: 1.5rem; color: #0F172A; }
    .page-sub { font-size: 0.875rem; color: #64748B; }

    .header-actions { display: flex; gap: 0.75rem; }
    .btn-head-action {
      padding: 0.6rem 1.1rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .btn-gold { background: linear-gradient(135deg, #C5A880 0%, #A3865E 100%); color: white; }
    .btn-dark { background: #0F172A; color: white; }
    .btn-outline { background: white; border: 1px solid #CBD5E1; color: #334155; }

    .quick-nav-bar {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 0.85rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 12px rgba(17, 24, 39, 0.03);
    }
    .quick-nav-title { font-size: 0.85rem; color: #475569; }
    .quick-nav-links { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    .q-link {
      padding: 0.4rem 0.8rem;
      border-radius: 10px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      color: #334155;
      font-size: 0.8rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s;
    }
    .q-link:hover { background: #FEF3C7; border-color: #FCD34D; color: #D97706; }

    .dashboard-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .section-box {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 1.25rem;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
    }
    .box-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .box-title { font-size: 1.1rem; color: #0F172A; }
    .box-link { font-size: 0.8rem; color: #C5A880; text-decoration: none; }

    .stores-stack { display: flex; flex-direction: column; gap: 1rem; }

    .alerts-list { display: flex; flex-direction: column; gap: 0.85rem; }
    .alert-item-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 0.85rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .alert-item-card.danger { border-color: #FCA5A5; background: #FEF2F2; }
    .alert-item-card.warning { border-color: #FDE68A; background: #FFFBEB; }
    .alert-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .alert-item-card.danger .alert-icon { background: #FEE2E2; color: #DC2626; }
    .alert-item-card.warning .alert-icon { background: #FEF3C7; color: #D97706; }

    .alert-body { display: flex; flex-direction: column; flex: 1; }
    .alert-p-name { font-size: 0.875rem; color: #0F172A; }
    .alert-store { font-size: 0.725rem; color: #64748B; margin: 0.15rem 0; }
    .alert-action { color: #334155; }

    .btn-resolve-quick {
      padding: 0.4rem 0.75rem;
      border-radius: 8px;
      background: #0F172A;
      color: white;
      font-size: 0.75rem;
      text-decoration: none;
      white-space: nowrap;
    }

    @media (max-width: 1024px) {
      .dashboard-grid-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class StockDashboardPageComponent implements OnInit {
  dashboardSummary?: StockDashboardSummary;
  locations: StoreStockLocationSummary[] = [];
  alerts: StockAlert[] = [];

  constructor(
    private stockService: StockService,
    private alertService: StockAlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.stockService.getDashboardSummary().subscribe(sum => this.dashboardSummary = sum);
    this.stockService.getStoreStockLocations().subscribe(locs => this.locations = locs);
    this.alertService.getAlerts().subscribe(alerts => this.alerts = alerts);
  }

  navigateToStoreProducts(storeId: number): void {
    this.router.navigate(['/admin/stock/products'], { queryParams: { storeId } });
  }
}
