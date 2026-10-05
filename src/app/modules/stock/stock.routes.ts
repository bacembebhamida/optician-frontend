import { Routes } from '@angular/router';
import { stockPermissionGuard } from './guards/stock-permission.guard';

export const STOCK_ROUTES: Routes = [
  {
    path: '',
    canActivate: [stockPermissionGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/stock-dashboard-page/stock-dashboard-page.component').then(m => m.StockDashboardPageComponent)
      },
      {
        path: 'locations',
        loadComponent: () => import('./pages/stock-locations-page/stock-locations-page.component').then(m => m.StockLocationsPageComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/stock-list-page/stock-list-page.component').then(m => m.StockListPageComponent)
      },
      {
        path: 'entries',
        loadComponent: () => import('./pages/stock-entry-page/stock-entry-page.component').then(m => m.StockEntryPageComponent)
      },
      {
        path: 'exits',
        loadComponent: () => import('./pages/stock-exit-page/stock-exit-page.component').then(m => m.StockExitPageComponent)
      },
      {
        path: 'transfers',
        loadComponent: () => import('./pages/stock-transfer-page/stock-transfer-page.component').then(m => m.StockTransferPageComponent)
      },
      {
        path: 'transfers/:id',
        loadComponent: () => import('./pages/stock-transfer-detail-page/stock-transfer-detail-page.component').then(m => m.StockTransferDetailPageComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./pages/inventory-page/inventory-page.component').then(m => m.InventoryPageComponent)
      },
      {
        path: 'movements',
        loadComponent: () => import('./pages/movements-page/movements-page.component').then(m => m.MovementsPageComponent)
      },
      {
        path: 'alerts',
        loadComponent: () => import('./pages/alerts-page/alerts-page.component').then(m => m.AlertsPageComponent)
      },
      {
        path: 'replenishment',
        loadComponent: () => import('./pages/stock-replenishment-page/stock-replenishment-page.component').then(m => m.StockReplenishmentPageComponent)
      }
    ]
  }
];
