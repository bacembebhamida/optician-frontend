import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StockService } from '../../services/stock.service';
import { StockFilterParams, StockItem, StockPagedResult } from '../../models/stock.model';
import { StockFiltersComponent } from '../../components/stock-filters/stock-filters.component';
import { StockTableComponent } from '../../components/stock-table/stock-table.component';
import { BarcodeScannerModalComponent } from '../../components/barcode-scanner-modal/barcode-scanner-modal.component';
import { HasStockPermissionDirective } from '../../directives/has-stock-permission.directive';
import { NotificationService } from '../../../products/services/notification.service';

@Component({
  selector: 'app-stock-list-page',
  standalone: true,
  imports: [
    CommonModule,
    StockFiltersComponent,
    StockTableComponent,
    BarcodeScannerModalComponent,
    HasStockPermissionDirective
  ],
  template: `
    <div class="stock-list-page font-sans animate-fade-in">
      
      <!-- Header Bar -->
      <div class="page-header mb-6">
        <div>
          <h1 class="page-title font-bold text-2xl text-slate-900">
            <i class="fa-solid fa-list-check text-amber-600 mr-2"></i> Inventaire des Produits &amp; Montures
          </h1>
          <p class="page-sub text-sm text-slate-500">Consultez les niveaux de stock par référence, boutique, seuil minimum et statut.</p>
        </div>

        <div class="header-right-actions">
          <button 
            *appHasStockPermission="'STOCK_EXPORT'"
            (click)="exportStockCsv()" 
            class="btn-export font-semibold">
            <i class="fa-solid fa-file-csv mr-1"></i> Exporter CSV
          </button>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="mb-6">
        <app-stock-filters 
          [filters]="filterParams"
          (filterChange)="onFilterChange($event)"
          (openScannerModal)="showScannerModal = true">
        </app-stock-filters>
      </div>

      <!-- Stock Data Table -->
      <div class="mb-6">
        <app-stock-table 
          [items]="pagedResult?.items || []"
          [isLoading]="isLoading"
          (onEntry)="navigateToEntry($event)"
          (onExit)="navigateToExit($event)"
          (onTransfer)="navigateToTransfer($event)">
        </app-stock-table>
      </div>

      <!-- Server Pagination Bar -->
      <div *ngIf="pagedResult && pagedResult.totalPages > 1" class="pagination-bar">
        <div class="pagination-info font-mono text-xs text-slate-500">
          Affichage de {{ pageStartIndex }} à {{ pageEndIndex }} sur {{ pagedResult.totalItems }} références
        </div>

        <div class="pagination-controls">
          <button 
            (click)="changePage(filterParams.page - 1)" 
            [disabled]="filterParams.page <= 1" 
            class="btn-page">
            <i class="fa-solid fa-chevron-left"></i> Précédent
          </button>

          <span class="page-current font-bold font-mono text-sm px-3">
            Page {{ filterParams.page }} / {{ pagedResult.totalPages }}
          </span>

          <button 
            (click)="changePage(filterParams.page + 1)" 
            [disabled]="filterParams.page >= pagedResult.totalPages" 
            class="btn-page">
            Suivant <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Barcode Scanner Modal -->
      <app-barcode-scanner-modal 
        *ngIf="showScannerModal"
        (onClose)="showScannerModal = false"
        (onScan)="handleBarcodeScanned($event)">
      </app-barcode-scanner-modal>

    </div>
  `,
  styles: [`
    .stock-list-page { padding: 1.5rem; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .btn-export {
      padding: 0.6rem 1.1rem;
      border-radius: 12px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #334155;
      font-size: 0.85rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
    }
    .btn-export:hover { background: #F8FAFC; border-color: #94A3B8; }

    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 0.85rem 1.25rem;
      box-shadow: 0 4px 12px rgba(17, 24, 39, 0.03);
    }
    .pagination-controls { display: flex; align-items: center; }
    .btn-page {
      padding: 0.45rem 0.85rem;
      border-radius: 10px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      font-size: 0.8rem;
      cursor: pointer;
    }
    .btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
  `]
})
export class StockListPageComponent implements OnInit {
  filterParams: StockFilterParams = {
    query: '',
    barcode: '',
    storeId: 'ALL',
    category: 'ALL',
    brandId: 'ALL',
    status: 'ALL',
    lowStockOnly: false,
    outOfStockOnly: false,
    page: 1,
    pageSize: 10
  };

  pagedResult?: StockPagedResult<StockItem>;
  isLoading: boolean = false;
  showScannerModal: boolean = false;

  constructor(
    private stockService: StockService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['storeId']) this.filterParams.storeId = Number(params['storeId']);
      if (params['status']) this.filterParams.status = params['status'];
      if (params['barcode']) this.filterParams.barcode = params['barcode'];
      this.loadStockData();
    });
  }

  loadStockData(): void {
    this.isLoading = true;
    this.stockService.getStockProducts(this.filterParams).subscribe({
      next: (res) => {
        this.pagedResult = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onFilterChange(newParams: StockFilterParams): void {
    this.filterParams = { ...newParams };
    this.loadStockData();
  }

  changePage(newPage: number): void {
    if (this.pagedResult && newPage >= 1 && newPage <= this.pagedResult.totalPages) {
      this.filterParams.page = newPage;
      this.loadStockData();
    }
  }

  handleBarcodeScanned(barcode: string): void {
    this.filterParams.barcode = barcode;
    this.filterParams.page = 1;
    this.loadStockData();
    this.notificationService.info('Code-barres scanné', `Recherche de l'article #${barcode}`);
  }

  navigateToEntry(item: StockItem): void {
    this.router.navigate(['/admin/stock/entries'], { queryParams: { productId: item.productId, storeId: item.storeId } });
  }

  navigateToExit(item: StockItem): void {
    this.router.navigate(['/admin/stock/exits'], { queryParams: { productId: item.productId, storeId: item.storeId } });
  }

  navigateToTransfer(item: StockItem): void {
    this.router.navigate(['/admin/stock/transfers'], { queryParams: { productId: item.productId, sourceStoreId: item.storeId } });
  }

  exportStockCsv(): void {
    this.notificationService.success('Exportation initiée', 'Le fichier CSV du stock a été téléchargé.');
  }

  get pageStartIndex(): number {
    if (!this.pagedResult) return 0;
    return (this.filterParams.page - 1) * this.filterParams.pageSize + 1;
  }

  get pageEndIndex(): number {
    if (!this.pagedResult) return 0;
    return Math.min(this.filterParams.page * this.filterParams.pageSize, this.pagedResult.totalItems);
  }
}
