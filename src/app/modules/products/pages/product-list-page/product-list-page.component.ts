import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { Product, ProductFilterParams, PagedResult, ProductStatus } from '../../models/product.model';
import { BarcodeScannerComponent } from '../../components/barcode-scanner/barcode-scanner.component';
import { ProductFiltersComponent } from '../../components/product-filters/product-filters.component';
import { ProductTableComponent } from '../../components/product-table/product-table.component';
import { ToastContainerComponent } from '../../components/toast/toast-container.component';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { ImportProductsModalComponent } from '../../components/import-products-modal/import-products-modal.component';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BarcodeScannerComponent,
    ProductFiltersComponent,
    ProductTableComponent,
    ToastContainerComponent,
    ConfirmationDialogComponent,
    ImportProductsModalComponent,
    HasPermissionDirective
  ],
  template: `
    <div class="catalog-root animate-fade-in">

      <!-- Toast Outlet -->
      <app-toast-container></app-toast-container>

      <!-- ═══════════════════════════════════════════════════
           PAGE HEADER — Breadcrumb + Titre + Actions CTA
      ═══════════════════════════════════════════════════ -->
      <header class="page-header">
        <div class="header-left">
          <nav class="breadcrumb" aria-label="Fil d'Ariane">
            <span class="breadcrumb-item">OptiVision</span>
            <i class="fa-solid fa-chevron-right breadcrumb-sep"></i>
            <span class="breadcrumb-item active">Catalogue Produits</span>
          </nav>
          <div class="page-title-group">
            <div class="page-title-icon">
              <i class="fa-solid fa-glasses"></i>
            </div>
            <div>
              <h1 class="page-title">Catalogue Produits</h1>
              <p class="page-subtitle">Gérez et centralisez votre inventaire optique</p>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <button (click)="isImportModalOpen = true" class="btn-secondary" id="btn-import-products">
            <i class="fa-solid fa-file-import"></i>
            <span>Importer</span>
          </button>

          <button *appHasPermission="'PRODUCT_EXPORT'" (click)="onExportAll('csv')" class="btn-secondary" id="btn-export-products">
            <i class="fa-solid fa-arrow-up-from-bracket"></i>
            <span>Exporter CSV</span>
          </button>

          <a *appHasPermission="'PRODUCT_CREATE'" routerLink="/admin/products/new" class="btn-primary" id="btn-create-product">
            <i class="fa-solid fa-plus"></i>
            <span>Nouveau Produit</span>
          </a>
        </div>
      </header>

      <!-- ═══════════════════════════════════════════════════
           KPI METRICS STRIP — 4 indicateurs clés
      ═══════════════════════════════════════════════════ -->
      <section class="kpi-strip" aria-label="Indicateurs catalogue">
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--total">
            <i class="fa-solid fa-layer-group"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Total Références</span>
            <span class="kpi-value">{{ pagedResult.totalItems || 0 }}</span>
          </div>
          <div class="kpi-trend kpi-trend--neutral">
            <i class="fa-solid fa-database"></i>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--active">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Actifs</span>
            <span class="kpi-value kpi-value--active">{{ countActiveProducts() }}</span>
          </div>
          <div class="kpi-progress">
            <div class="kpi-progress-bar kpi-progress-bar--active"
                 [style.width.%]="pagedResult.totalItems ? (countActiveProducts() / pagedResult.totalItems * 100) : 0">
            </div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--inactive">
            <i class="fa-solid fa-circle-pause"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Inactifs</span>
            <span class="kpi-value kpi-value--inactive">{{ countInactiveProducts() }}</span>
          </div>
          <div class="kpi-progress">
            <div class="kpi-progress-bar kpi-progress-bar--inactive"
                 [style.width.%]="pagedResult.totalItems ? (countInactiveProducts() / pagedResult.totalItems * 100) : 0">
            </div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--variants">
            <i class="fa-solid fa-swatchbook"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Avec Variantes</span>
            <span class="kpi-value kpi-value--variants">{{ countProductsWithVariants() }}</span>
          </div>
          <div class="kpi-trend kpi-trend--info">
            <i class="fa-solid fa-tag"></i>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════
           TOOLBAR — Barcode Scanner intégré + Filters
      ═══════════════════════════════════════════════════ -->
      <section class="toolbar-section">

        <!-- Barcode Scanner compact intégré -->
        <div class="scanner-inline-row">
          <app-barcode-scanner (barcodeScanned)="onBarcodeScanned($event)"></app-barcode-scanner>
        </div>

        <!-- Panneau Filtres -->
        <app-product-filters
          [filters]="filterParams"
          (filterChange)="onFilterChange($event)">
        </app-product-filters>
      </section>

      <!-- ═══════════════════════════════════════════════════
           TABLE PRINCIPALE PRODUITS
      ═══════════════════════════════════════════════════ -->
      <section class="table-section">
        <app-product-table
          [products]="pagedResult.items"
          [isLoading]="isLoading"
          [sortBy]="filterParams.sortBy || 'updatedAt'"
          [sortDirection]="filterParams.sortDirection || 'desc'"
          (sortChange)="onSortChange($event)"
          (toggleStatus)="onToggleStatus($event)"
          (duplicate)="onDuplicateProduct($event)"
          (delete)="onPromptDelete($event)"
          (createNewProduct)="navigateToCreate()"
          (bulkAction)="onBulkAction($event)">
        </app-product-table>
      </section>

      <!-- ═══════════════════════════════════════════════════
           PAGINATION PROFESSIONNELLE
      ═══════════════════════════════════════════════════ -->
      <footer *ngIf="!isLoading && pagedResult.totalItems > 0" class="pagination-bar" aria-label="Pagination">

        <div class="pagination-info">
          Affichage de
          <strong>{{ getStartIndex() }}–{{ getEndIndex() }}</strong>
          sur <strong>{{ pagedResult.totalItems }}</strong> produits
        </div>

        <div class="pagination-controls">
          <div class="page-size-selector">
            <label for="pageSizeSelect" class="page-size-label">Par page</label>
            <select id="pageSizeSelect"
                    [value]="filterParams.pageSize"
                    (change)="onPageSizeChange($event)"
                    class="page-size-select">
              <option [value]="5">5</option>
              <option [value]="10">10</option>
              <option [value]="25">25</option>
              <option [value]="50">50</option>
            </select>
          </div>

          <div class="page-nav">
            <button
              [disabled]="pagedResult.page <= 1"
              (click)="goToPage(1)"
              class="page-btn page-btn--edge"
              title="Première page"
              aria-label="Première page">
              <i class="fa-solid fa-angles-left"></i>
            </button>
            <button
              [disabled]="pagedResult.page <= 1"
              (click)="goToPage(pagedResult.page - 1)"
              class="page-btn"
              title="Page précédente"
              aria-label="Page précédente">
              <i class="fa-solid fa-angle-left"></i>
            </button>

            <span class="page-indicator">
              <strong>{{ pagedResult.page }}</strong>
              <span class="page-sep">/</span>
              {{ pagedResult.totalPages }}
            </span>

            <button
              [disabled]="pagedResult.page >= pagedResult.totalPages"
              (click)="goToPage(pagedResult.page + 1)"
              class="page-btn"
              title="Page suivante"
              aria-label="Page suivante">
              <i class="fa-solid fa-angle-right"></i>
            </button>
            <button
              [disabled]="pagedResult.page >= pagedResult.totalPages"
              (click)="goToPage(pagedResult.totalPages)"
              class="page-btn page-btn--edge"
              title="Dernière page"
              aria-label="Dernière page">
              <i class="fa-solid fa-angles-right"></i>
            </button>
          </div>
        </div>

      </footer>

      <!-- Modals -->
      <app-confirmation-dialog
        [isOpen]="isDeleteModalOpen"
        title="Supprimer ce produit ?"
        subtitle="Cette action est permanente et irréversible."
        [message]="'Confirmez-vous la suppression définitive du produit #' + targetProductId + ' du catalogue ?'"
        type="danger"
        confirmText="Supprimer définitivement"
        confirmIcon="fa-trash-can"
        (confirmed)="confirmDeleteProduct()"
        (cancelled)="isDeleteModalOpen = false">
      </app-confirmation-dialog>

      <app-import-products-modal
        [isOpen]="isImportModalOpen"
        (onClose)="isImportModalOpen = false"
        (onImportComplete)="loadProducts()">
      </app-import-products-modal>

    </div>
  `,
  styles: [`
    /* ─── Root Layout ─── */
    .catalog-root {
      min-height: 100vh;
      background: #F4F6FA;
      padding: 2rem 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* ─── Page Header ─── */
    .page-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .header-left {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .breadcrumb-item {
      font-size: 0.75rem;
      font-weight: 500;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .breadcrumb-item.active {
      color: #475569;
    }
    .breadcrumb-sep {
      color: #CBD5E1;
      font-size: 0.6rem;
    }
    .page-title-group {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .page-title-icon {
      width: 48px;
      height: 48px;
      background: #111827;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #C5A880;
      font-size: 1.2rem;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(17,24,39,0.15);
    }
    .page-title {
      font-size: 1.625rem;
      font-weight: 800;
      color: #111827;
      letter-spacing: -0.03em;
      line-height: 1.2;
      margin: 0;
    }
    .page-subtitle {
      font-size: 0.825rem;
      color: #64748B;
      margin: 0.2rem 0 0 0;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      flex-shrink: 0;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      background: #111827;
      color: #FFFFFF;
      border: none;
      border-radius: 11px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(17,24,39,0.2);
      white-space: nowrap;
    }
    .btn-primary:hover {
      background: #1F2937;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(17,24,39,0.25);
      color: #FFFFFF;
    }
    .btn-primary i { font-size: 0.8rem; }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.1rem;
      background: #FFFFFF;
      color: #374151;
      border: 1px solid #E5E7EB;
      border-radius: 11px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .btn-secondary:hover {
      background: #F9FAFB;
      border-color: #D1D5DB;
    }
    .btn-secondary i { color: #6B7280; font-size: 0.8rem; }

    /* ─── KPI Strip ─── */
    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
    .kpi-card {
      background: #FFFFFF;
      border: 1px solid #E9ECF0;
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
      overflow: hidden;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .kpi-card:hover {
      box-shadow: 0 8px 24px rgba(17,24,39,0.06);
      border-color: #D4D8DF;
    }
    .kpi-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .kpi-icon--total { background: #F1F5F9; color: #475569; }
    .kpi-icon--active { background: #ECFDF5; color: #059669; }
    .kpi-icon--inactive { background: #FEF2F2; color: #DC2626; }
    .kpi-icon--variants { background: #EFF6FF; color: #2563EB; }
    .kpi-content {
      flex: 1;
      min-width: 0;
    }
    .kpi-label {
      display: block;
      font-size: 0.7rem;
      font-weight: 700;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
    }
    .kpi-value {
      display: block;
      font-size: 1.75rem;
      font-weight: 800;
      color: #111827;
      line-height: 1.1;
      margin-top: 0.2rem;
      letter-spacing: -0.03em;
    }
    .kpi-value--active { color: #059669; }
    .kpi-value--inactive { color: #DC2626; }
    .kpi-value--variants { color: #2563EB; }
    .kpi-trend {
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .kpi-trend--neutral { color: #CBD5E1; }
    .kpi-trend--info { color: #BFDBFE; }
    .kpi-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #F1F5F9;
    }
    .kpi-progress-bar {
      height: 100%;
      border-radius: 0 2px 2px 0;
      transition: width 0.6s ease;
    }
    .kpi-progress-bar--active { background: #059669; }
    .kpi-progress-bar--inactive { background: #DC2626; }

    /* ─── Toolbar Section ─── */
    .toolbar-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .scanner-inline-row {
      width: 100%;
    }

    /* ─── Table Section ─── */
    .table-section {
      flex: 1;
    }

    /* ─── Pagination Bar ─── */
    .pagination-bar {
      background: #FFFFFF;
      border: 1px solid #E9ECF0;
      border-radius: 14px;
      padding: 0.875rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .pagination-info {
      font-size: 0.8rem;
      color: #6B7280;
    }
    .pagination-info strong {
      color: #111827;
      font-weight: 700;
    }
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .page-size-label {
      font-size: 0.775rem;
      color: #9CA3AF;
      font-weight: 500;
      white-space: nowrap;
    }
    .page-size-select {
      padding: 0.375rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: #111827;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      outline: none;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .page-size-select:focus { border-color: #C5A880; }
    .page-nav {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .page-btn {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
      background: #FFFFFF;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s ease;
    }
    .page-btn:hover:not(:disabled) {
      background: #111827;
      color: #FFFFFF;
      border-color: #111827;
    }
    .page-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .page-btn--edge {
      font-size: 0.7rem;
      color: #9CA3AF;
    }
    .page-indicator {
      padding: 0 0.75rem;
      font-size: 0.825rem;
      color: #6B7280;
      white-space: nowrap;
    }
    .page-indicator strong {
      color: #111827;
      font-size: 0.9rem;
    }
    .page-sep {
      margin: 0 0.35rem;
      color: #D1D5DB;
    }

    /* ─── Fade-in animation ─── */
    .animate-fade-in {
      animation: pageFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes pageFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ─── Responsive ─── */
    @media (max-width: 1200px) {
      .catalog-root { padding: 1.5rem 1.75rem; }
      .kpi-strip { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .catalog-root { padding: 1rem; gap: 1rem; }
      .page-header { flex-direction: column; align-items: flex-start; }
      .header-actions { width: 100%; justify-content: flex-end; }
      .kpi-strip { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
      .kpi-card { padding: 1rem; gap: 0.75rem; }
      .kpi-value { font-size: 1.4rem; }
      .pagination-bar { flex-direction: column; align-items: flex-start; }
      .pagination-controls { width: 100%; justify-content: space-between; }
      .btn-secondary span { display: none; }
      .btn-primary span { display: none; }
    }
    @media (max-width: 480px) {
      .kpi-strip { grid-template-columns: 1fr 1fr; }
      .page-title { font-size: 1.3rem; }
      .page-title-icon { width: 40px; height: 40px; font-size: 1rem; }
    }
  `]
})
export class ProductListPageComponent implements OnInit {
  isLoading: boolean = true;
  isImportModalOpen: boolean = false;

  filterParams: ProductFilterParams = {
    query: '',
    category: 'ALL',
    brandId: 'ALL',
    type: 'ALL',
    gender: 'ALL',
    material: 'ALL',
    status: 'ALL',
    sortBy: 'updatedAt',
    sortDirection: 'desc',
    page: 1,
    pageSize: 10
  };

  pagedResult: PagedResult<Product> = {
    items: [],
    totalItems: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1
  };

  isDeleteModalOpen: boolean = false;
  targetProductId: number | null = null;

  constructor(
    private productService: ProductService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts(this.filterParams).subscribe(result => {
      this.pagedResult = result;
      this.isLoading = false;
    });
  }

  countActiveProducts(): number {
    return this.pagedResult.items.filter(p => p.status === 'ACTIF').length;
  }

  countInactiveProducts(): number {
    return this.pagedResult.items.filter(p => p.status === 'INACTIF').length;
  }

  countProductsWithVariants(): number {
    return this.pagedResult.items.filter(p => p.variants && p.variants.length > 0).length;
  }

  onFilterChange(newFilters: ProductFilterParams): void {
    this.filterParams = { ...newFilters };
    this.loadProducts();
  }

  onBarcodeScanned(barcode: string): void {
    this.filterParams.barcode = barcode;
    this.filterParams.page = 1;
    this.loadProducts();
  }

  onSortChange(event: { field: string; direction: 'asc' | 'desc' }): void {
    this.filterParams.sortBy = event.field as any;
    this.filterParams.sortDirection = event.direction;
    this.loadProducts();
  }

  onToggleStatus(id: number): void {
    this.productService.toggleProductStatus(id).subscribe(() => {
      this.loadProducts();
    });
  }

  onDuplicateProduct(id: number): void {
    this.productService.duplicateProduct(id).subscribe(() => {
      this.loadProducts();
    });
  }

  onPromptDelete(id: number): void {
    this.targetProductId = id;
    this.isDeleteModalOpen = true;
  }

  confirmDeleteProduct(): void {
    if (this.targetProductId !== null) {
      this.productService.deleteProduct(this.targetProductId).subscribe(() => {
        this.loadProducts();
        this.isDeleteModalOpen = false;
        this.targetProductId = null;
      });
    }
  }

  onBulkAction(event: { action: 'delete' | 'status' | 'export'; status?: ProductStatus; format?: 'csv'; ids: number[] }): void {
    if (event.action === 'delete') {
      this.productService.bulkDeleteProducts(event.ids).subscribe(() => this.loadProducts());
    } else if (event.action === 'status' && event.status) {
      this.productService.bulkUpdateStatus(event.ids, event.status).subscribe(() => this.loadProducts());
    } else if (event.action === 'export') {
      this.productService.exportProducts(event.ids, 'csv').subscribe();
    }
  }

  onExportAll(format: 'csv'): void {
    this.productService.exportProducts([], format).subscribe();
  }

  goToPage(page: number): void {
    this.filterParams.page = page;
    this.loadProducts();
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterParams.pageSize = Number(select.value);
    this.filterParams.page = 1;
    this.loadProducts();
  }

  navigateToCreate(): void {
    this.router.navigate(['/admin/products/new']);
  }

  getStartIndex(): number {
    return (this.pagedResult.page - 1) * this.pagedResult.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.pagedResult.page * this.pagedResult.pageSize, this.pagedResult.totalItems);
  }
}
