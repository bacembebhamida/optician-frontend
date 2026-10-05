import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductVariantService } from '../../services/product-variant.service';
import { NotificationService } from '../../services/notification.service';
import { Product, ProductVariant, ProductStatus } from '../../models/product.model';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { ToastContainerComponent } from '../../components/toast/toast-container.component';

interface VariantRow {
  product: Product;
  variant: ProductVariant;
}

/**
 * Page « Variantes » du Catalogue.
 * Gestion complète des déclinaisons (image produit, couleur, taille/calibre, SKU,
 * code-barres, prix, stock) pour l'ensemble du catalogue OptiVision.
 */
@Component({
  selector: 'app-variant-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HasPermissionDirective, ToastContainerComponent],
  template: `
    <div class="variant-root">

      <app-toast-container></app-toast-container>

      <!-- ── En-tête ── -->
      <header class="page-header">
        <div>
          <nav class="breadcrumb" aria-label="Fil d'Ariane">
            <span>Gestion commerciale</span>
            <i class="fa-solid fa-chevron-right sep"></i>
            <span>Catalogue</span>
            <i class="fa-solid fa-chevron-right sep"></i>
            <span class="active">Variantes</span>
          </nav>
          <h1 class="page-title">Variantes &amp; Déclinaisons</h1>
          <p class="page-subtitle">Gérez les couleurs, calibres, SKU et prix spécifiques de chaque produit du catalogue.</p>
        </div>

        <div class="header-actions">
          <button class="btn-secondary" (click)="exportVariants()">
            <i class="fa-solid fa-file-export"></i> Exporter
          </button>
          <button *appHasPermission="'PRODUCT_CREATE'" class="btn-primary" (click)="openCreateModal()">
            <i class="fa-solid fa-plus"></i> Nouvelle variante
          </button>
        </div>
      </header>

      <!-- ── KPI ── -->
      <section class="kpi-strip" aria-label="Indicateurs variantes">
        <div class="kpi-card">
          <span class="kpi-icon kpi-icon--total"><i class="fa-solid fa-layer-group"></i></span>
          <span class="kpi-body">
            <span class="kpi-label">Variantes totales</span>
            <span class="kpi-value">{{ rows.length }}</span>
          </span>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon kpi-icon--product"><i class="fa-solid fa-glasses"></i></span>
          <span class="kpi-body">
            <span class="kpi-label">Produits concernés</span>
            <span class="kpi-value">{{ productsWithVariants }}</span>
          </span>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon kpi-icon--stock"><i class="fa-solid fa-boxes-stacked"></i></span>
          <span class="kpi-body">
            <span class="kpi-label">Unités en stock</span>
            <span class="kpi-value">{{ totalVariantStock }}</span>
          </span>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon kpi-icon--danger"><i class="fa-solid fa-triangle-exclamation"></i></span>
          <span class="kpi-body">
            <span class="kpi-label">Variantes en rupture</span>
            <span class="kpi-value kpi-value--danger">{{ outOfStockCount }}</span>
          </span>
        </div>
      </section>

      <!-- ── Filtres ── -->
      <section class="filter-bar">
        <div class="search-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text"
                 [(ngModel)]="query"
                 placeholder="Rechercher une variante (SKU, couleur, taille, produit)..."
                 aria-label="Rechercher une variante">
          <button *ngIf="query" (click)="query = ''" class="search-clear" title="Effacer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <select [(ngModel)]="selectedProductId" class="filter-select" aria-label="Filtrer par produit">
          <option value="ALL">Tous les produits</option>
          <option *ngFor="let p of products" [ngValue]="p.id">{{ p.name }}</option>
        </select>

        <select [(ngModel)]="selectedStatus" class="filter-select" aria-label="Filtrer par statut">
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIF">Actif</option>
          <option value="INACTIF">Inactif</option>
          <option value="BROUILLON">Brouillon</option>
        </select>

        <button class="btn-reset" (click)="resetFilters()">
          <i class="fa-solid fa-rotate-left"></i> Réinitialiser
        </button>
      </section>

      <!-- ── Tableau des variantes ── -->
      <section class="table-shell">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-img">Image</th>
              <th class="col-product">Produit</th>
              <th class="col-color">Couleur</th>
              <th class="col-size">Taille / Calibre</th>
              <th class="col-sku">SKU</th>
              <th class="col-barcode">Code-barres</th>
              <th class="col-price">Prix de vente</th>
              <th class="col-stock">Stock</th>
              <th class="col-status">Statut</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of filteredRows; trackBy: trackByVariant">
              <td class="col-img">
                <img [src]="getProductImage(row.product)" [alt]="row.product.name" class="variant-thumb" loading="lazy">
              </td>

              <td class="col-product">
                <a [routerLink]="['/admin/products', row.product.id]" class="product-link">{{ row.product.name }}</a>
                <span class="product-brand">{{ row.product.brandName }}</span>
              </td>

              <td class="col-color">
                <span class="color-cell">
                  <span class="swatch" [style.background-color]="row.variant.colorHex || '#111827'"></span>
                  {{ row.variant.colorName }}
                </span>
              </td>

              <td class="col-size mono">{{ row.variant.size }}</td>
              <td class="col-sku mono">{{ row.variant.sku }}</td>
              <td class="col-barcode mono muted"><i class="fa-solid fa-barcode"></i> {{ row.variant.barcode }}</td>

              <td class="col-price mono">{{ row.variant.priceTnd | number:'1.3-3' }} DT</td>

              <td class="col-stock">
                <span class="stock-chip" [ngClass]="getStockClass(row.variant.stockQuantity)">
                  <i class="fa-solid fa-cubes"></i> {{ row.variant.stockQuantity || 0 }}
                </span>
              </td>

              <td class="col-status">
                <span class="status-chip" [ngClass]="row.variant.status.toLowerCase()">{{ getStatusLabel(row.variant.status) }}</span>
              </td>

              <td class="col-actions">
                <button *appHasPermission="'PRODUCT_UPDATE'" class="icon-action" (click)="openEditModal(row)" title="Modifier la variante">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <a class="icon-action" [routerLink]="['/admin/products', row.product.id]" title="Voir la fiche produit">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
                <button *appHasPermission="'PRODUCT_DELETE'" class="icon-action icon-action--danger" (click)="removeVariant(row)" title="Supprimer la variante">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </td>
            </tr>

            <tr *ngIf="filteredRows.length === 0">
              <td colspan="10" class="empty-row">
                <i class="fa-solid fa-tags"></i>
                Aucune variante ne correspond à vos critères.
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- ── Pagination ── -->
      <footer class="pagination-bar" *ngIf="filteredRows.length > 0">
        <span class="pagination-info">
          Affichage de <strong>{{ getStartIndex() }}–{{ getEndIndex() }}</strong> sur
          <strong>{{ filteredRows.length }}</strong> variantes
        </span>
        <div class="pagination-controls">
          <button class="page-btn" [disabled]="page <= 1" (click)="goToPage(page - 1)">
            <i class="fa-solid fa-angle-left"></i>
          </button>
          <span class="page-indicator">Page <strong>{{ page }}</strong> / {{ totalPages }}</span>
          <button class="page-btn" [disabled]="page >= totalPages" (click)="goToPage(page + 1)">
            <i class="fa-solid fa-angle-right"></i>
          </button>
        </div>
      </footer>

      <!-- ── Modal Création / Édition de variante ── -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <header class="modal-header">
            <div>
              <h3>{{ editingRow ? 'Modifier la variante' : 'Nouvelle variante' }}</h3>
              <p>{{ editingRow ? editingRow.product.name : 'Sélectionnez un produit puis renseignez la déclinaison.' }}</p>
            </div>
            <button class="modal-close" (click)="closeModal()" title="Fermer"><i class="fa-solid fa-xmark"></i></button>
          </header>

          <div class="modal-body">
            <div class="field-group" *ngIf="!editingRow">
              <label>Produit parent *</label>
              <select [(ngModel)]="draft.productId" class="modal-input">
                <option *ngFor="let p of products" [ngValue]="p.id">{{ p.name }} — {{ p.sku }}</option>
              </select>
            </div>

            <div class="field-grid">
              <div class="field-group">
                <label>Nom de la couleur *</label>
                <input type="text" [(ngModel)]="draft.colorName" placeholder="Ex: Écaille Havane" class="modal-input">
              </div>

              <div class="field-group">
                <label>Couleur (Hex)</label>
                <div class="color-input-row">
                  <input type="color" [(ngModel)]="draft.colorHex" class="color-picker">
                  <input type="text" [(ngModel)]="draft.colorHex" placeholder="#78350F" class="modal-input">
                </div>
              </div>

              <div class="field-group">
                <label>Taille / Calibre *</label>
                <input type="text" [(ngModel)]="draft.size" placeholder="52-18-140" class="modal-input">
              </div>

              <div class="field-group">
                <label>SKU de la variante *</label>
                <input type="text" [(ngModel)]="draft.sku" placeholder="RB-5228-HAV-52" class="modal-input">
              </div>

              <div class="field-group">
                <label>Code-barres EAN-13 *</label>
                <input type="text" [(ngModel)]="draft.barcode" placeholder="805289307890" class="modal-input">
              </div>

              <div class="field-group">
                <label>Prix de vente (DT) *</label>
                <input type="number" step="0.001" [(ngModel)]="draft.priceTnd" class="modal-input">
              </div>

              <div class="field-group">
                <label>Stock initial</label>
                <input type="number" [(ngModel)]="draft.stockQuantity" class="modal-input">
              </div>

              <div class="field-group">
                <label>Statut</label>
                <select [(ngModel)]="draft.status" class="modal-input">
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                  <option value="BROUILLON">Brouillon</option>
                </select>
              </div>
            </div>
          </div>

          <footer class="modal-footer">
            <button class="btn-secondary" (click)="closeModal()">Annuler</button>
            <button class="btn-primary" (click)="saveVariant()">
              <i class="fa-solid fa-floppy-disk"></i> Enregistrer
            </button>
          </footer>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .variant-root {
      min-height: auto;
      background: #F4F6FA;
      padding: 1.75rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.4rem;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }

    /* En-tête */
    .page-header {
      display: flex; align-items: flex-end; justify-content: space-between;
      flex-wrap: wrap; gap: 1.25rem;
    }
    .breadcrumb {
      display: flex; align-items: center; gap: 0.45rem;
      font-size: 0.7rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: #94A3B8;
    }
    .breadcrumb .active { color: #475569; }
    .breadcrumb .sep { font-size: 0.55rem; color: #CBD5E1; }
    .page-title { font-size: 1.55rem; font-weight: 800; color: #111827; margin: 0.45rem 0 0; letter-spacing: -0.03em; }
    .page-subtitle { font-size: 0.82rem; color: #64748B; margin-top: 0.2rem; }
    .header-actions { display: flex; align-items: center; gap: 0.65rem; }

    .btn-primary, .btn-secondary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.65rem 1.2rem; border-radius: 11px;
      font-size: 0.83rem; font-weight: 700; cursor: pointer;
      border: none; transition: all 0.18s ease; white-space: nowrap;
    }
    .btn-primary { background: #111827; color: #FFFFFF; box-shadow: 0 2px 8px rgba(17,24,39,0.2); }
    .btn-primary:hover { background: #1F2937; transform: translateY(-1px); }
    .btn-secondary { background: #FFFFFF; color: #374151; border: 1px solid #E5E7EB; }
    .btn-secondary:hover { background: #F9FAFB; border-color: #D1D5DB; }
    .btn-secondary i { color: #6B7280; font-size: 0.8rem; }

    /* KPI */
    .kpi-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .kpi-card {
      background: #FFFFFF; border: 1px solid #E9ECF0; border-radius: 16px;
      padding: 1.1rem 1.25rem; display: flex; align-items: center; gap: 0.9rem;
      box-shadow: 0 1px 4px rgba(17,24,39,0.04);
    }
    .kpi-icon {
      width: 2.75rem; height: 2.75rem; border-radius: 0.8rem;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem; flex-shrink: 0;
    }
    .kpi-icon--total { background: #F1F5F9; color: #0F172A; }
    .kpi-icon--product { background: #F7F3EE; color: #8F724C; }
    .kpi-icon--stock { background: #ECFDF5; color: #059669; }
    .kpi-icon--danger { background: #FEF2F2; color: #DC2626; }
    .kpi-body { display: flex; flex-direction: column; }
    .kpi-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94A3B8; }
    .kpi-value { font-size: 1.4rem; font-weight: 800; color: #111827; line-height: 1.2; }
    .kpi-value--danger { color: #DC2626; }

    /* Filtres */
    .filter-bar {
      display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap;
      background: #FFFFFF; border: 1px solid #E9ECF0; border-radius: 14px;
      padding: 0.75rem 0.9rem;
    }
    .search-wrap { position: relative; flex: 1; min-width: 260px; display: flex; align-items: center; }
    .search-wrap i {
      position: absolute; left: 0.85rem; color: #94A3B8; font-size: 0.82rem;
    }
    .search-wrap input {
      width: 100%; padding: 0.6rem 2.3rem 0.6rem 2.3rem;
      border: 1px solid #E5E7EB; border-radius: 10px;
      font-size: 0.82rem; font-family: inherit; color: #111827; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .search-wrap input:focus { border-color: #C5A880; box-shadow: 0 0 0 3px rgba(197,168,128,0.16); }
    .search-clear {
      position: absolute; right: 0.7rem; background: none; border: none;
      color: #94A3B8; cursor: pointer; font-size: 0.85rem;
    }
    .filter-select {
      padding: 0.6rem 0.8rem; border: 1px solid #E5E7EB; border-radius: 10px;
      font-size: 0.8rem; font-weight: 600; color: #374151;
      background: #FFFFFF; font-family: inherit; cursor: pointer; outline: none;
      max-width: 260px;
    }
    .filter-select:focus { border-color: #C5A880; }
    .btn-reset {
      display: inline-flex; align-items: center; gap: 0.45rem;
      padding: 0.6rem 0.95rem; border-radius: 10px;
      border: 1px dashed #D1D5DB; background: #FFFFFF;
      font-size: 0.78rem; font-weight: 700; color: #6B7280;
      cursor: pointer; font-family: inherit;
    }
    .btn-reset:hover { color: #0F172A; border-color: #C5A880; }

    /* Tableau */
    .table-shell {
      background: #FFFFFF; border: 1px solid #E9ECF0; border-radius: 16px;
      overflow: hidden; box-shadow: 0 1px 4px rgba(17,24,39,0.04);
    }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    .data-table thead th {
      background: #F8FAFC; border-bottom: 1px solid #E2E8F0;
      padding: 0.7rem 0.85rem; text-align: left;
      font-size: 0.66rem; font-weight: 800; letter-spacing: 0.07em;
      text-transform: uppercase; color: #64748B; white-space: nowrap;
    }
    .data-table tbody td {
      padding: 0.65rem 0.85rem; border-bottom: 1px solid #F1F5F9;
      vertical-align: middle; color: #1E293B;
    }
    .data-table tbody tr:hover { background: #FBFCFE; }
    .col-img { width: 62px; }
    .col-actions { text-align: right; white-space: nowrap; }
    .variant-thumb {
      width: 2.75rem; height: 2.75rem; border-radius: 0.6rem;
      object-fit: cover; border: 1px solid #E2E8F0; background: #F8FAFC;
    }
    .product-link { display: block; font-weight: 700; color: #111827; text-decoration: none; }
    .product-link:hover { color: #8F724C; text-decoration: underline; }
    .product-brand { font-size: 0.68rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; }
    .color-cell { display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 600; }
    .swatch {
      width: 1rem; height: 1rem; border-radius: 50%;
      border: 1px solid rgba(15,23,42,0.15); flex-shrink: 0;
    }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.78rem; }
    .muted { color: #64748B; }
    .muted i { color: #CBD5E1; margin-right: 0.25rem; }
    .stock-chip {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.2rem 0.6rem; border-radius: 9999px;
      font-size: 0.72rem; font-weight: 800;
    }
    .stock-chip--ok { background: #ECFDF5; color: #047857; }
    .stock-chip--low { background: #FFFBEB; color: #B45309; }
    .stock-chip--zero { background: #FEF2F2; color: #B91C1C; }
    .status-chip {
      display: inline-block; padding: 0.2rem 0.6rem; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 800;
    }
    .status-chip.actif { background: #ECFDF5; color: #047857; }
    .status-chip.inactif { background: #FEF2F2; color: #B91C1C; }
    .status-chip.brouillon { background: #F1F5F9; color: #475569; }
    .icon-action {
      width: 1.9rem; height: 1.9rem; border-radius: 0.5rem;
      border: 1px solid #E5E7EB; background: #FFFFFF; color: #475569;
      cursor: pointer; font-size: 0.72rem; margin-left: 0.25rem;
      display: inline-flex; align-items: center; justify-content: center;
      text-decoration: none; transition: all 0.15s ease;
    }
    .icon-action:hover { background: #F8FAFC; border-color: #CBD5E1; color: #0F172A; }
    .icon-action--danger:hover { background: #FEF2F2; border-color: #FECACA; color: #DC2626; }
    .empty-row {
      text-align: center; padding: 3rem 1rem !important;
      color: #94A3B8; font-weight: 600;
    }
    .empty-row i { display: block; font-size: 1.6rem; margin-bottom: 0.6rem; color: #CBD5E1; }

    /* Pagination */
    .pagination-bar {
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem; flex-wrap: wrap;
    }
    .pagination-info { font-size: 0.8rem; color: #64748B; }
    .pagination-info strong { color: #111827; }
    .pagination-controls { display: flex; align-items: center; gap: 0.5rem; }
    .page-btn {
      width: 2.1rem; height: 2.1rem; border-radius: 0.55rem;
      border: 1px solid #E5E7EB; background: #FFFFFF; color: #374151;
      cursor: pointer; transition: all 0.15s;
    }
    .page-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .page-btn:not(:disabled):hover { background: #F8FAFC; border-color: #C5A880; color: #0F172A; }
    .page-indicator { font-size: 0.8rem; color: #64748B; }
    .page-indicator strong { color: #111827; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 500;
      background: rgba(15, 23, 42, 0.55);
      display: flex; align-items: center; justify-content: center;
      padding: 1.5rem;
    }
    .modal-card {
      width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto;
      background: #FFFFFF; border-radius: 18px;
      box-shadow: 0 30px 60px rgba(15,23,42,0.3);
    }
    .modal-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 1rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid #F1F5F9;
    }
    .modal-header h3 { font-size: 1.05rem; font-weight: 800; color: #111827; }
    .modal-header p { font-size: 0.78rem; color: #64748B; margin-top: 0.2rem; }
    .modal-close { background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 1rem; }
    .modal-close:hover { color: #DC2626; }
    .modal-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .field-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-group label {
      font-size: 0.7rem; font-weight: 800; color: #64748B;
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .modal-input {
      width: 100%; padding: 0.6rem 0.75rem;
      border: 1px solid #E5E7EB; border-radius: 10px;
      font-size: 0.82rem; color: #111827; font-family: inherit; outline: none;
    }
    .modal-input:focus { border-color: #C5A880; box-shadow: 0 0 0 3px rgba(197,168,128,0.16); }
    .color-input-row { display: flex; align-items: center; gap: 0.5rem; }
    .color-picker {
      width: 2.6rem; height: 2.4rem; padding: 0.15rem;
      border: 1px solid #E5E7EB; border-radius: 10px; background: #FFFFFF; cursor: pointer;
    }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 0.65rem;
      padding: 1rem 1.5rem; border-top: 1px solid #F1F5F9; background: #F8FAFC;
      border-radius: 0 0 18px 18px;
    }

    @media (max-width: 1100px) {
      .kpi-strip { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .variant-root { padding: 1.25rem 1rem; }
      .table-shell { overflow-x: auto; }
      .data-table { min-width: 900px; }
      .field-grid { grid-template-columns: 1fr; }
    }

  `]
})
export class VariantListPageComponent implements OnInit {
  products: Product[] = [];
  rows: VariantRow[] = [];
  isLoading = true;

  // Filtres
  query = '';
  selectedProductId: number | 'ALL' = 'ALL';
  selectedStatus: ProductStatus | 'ALL' = 'ALL';

  // Pagination
  page = 1;
  pageSize = 8;

  // Modal
  showModal = false;
  editingRow: VariantRow | null = null;
  draft: Partial<ProductVariant> & { productId?: number } = {};

  constructor(
    private productService: ProductService,
    private variantService: ProductVariantService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts({
      category: 'ALL',
      brandId: 'ALL',
      type: 'ALL',
      gender: 'ALL',
      material: 'ALL',
      status: 'ALL',
      sortBy: 'name',
      sortDirection: 'asc',
      page: 1,
      pageSize: 200
    }).subscribe(result => {
      this.products = result.items;
      this.rebuildRows();
      this.isLoading = false;
    });
  }

  /** Reconstruit la liste plate des variantes à partir des produits */
  private rebuildRows(): void {
    this.rows = this.products.flatMap(product =>
      (product.variants || []).map(variant => ({ product, variant }))
    );
  }

  // ── Filtrage & pagination ──
  private get matchingRows(): VariantRow[] {
    const needle = this.query.trim().toLowerCase();

    return this.rows.filter(row => {
      const matchProduct = this.selectedProductId === 'ALL' || row.product.id === this.selectedProductId;
      const matchStatus = this.selectedStatus === 'ALL' || row.variant.status === this.selectedStatus;
      if (!matchProduct || !matchStatus) return false;

      if (!needle) return true;

      return [
        row.variant.sku,
        row.variant.barcode,
        row.variant.colorName,
        row.variant.size,
        row.product.name,
        row.product.brandName
      ].some(value => (value || '').toLowerCase().includes(needle));
    });
  }

  get filteredRows(): VariantRow[] {
    const start = (this.page - 1) * this.pageSize;
    return this.matchingRows.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.matchingRows.length / this.pageSize));
  }

  getStartIndex(): number {
    return this.matchingRows.length === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.page * this.pageSize, this.matchingRows.length);
  }

  goToPage(page: number): void {
    this.page = Math.min(Math.max(1, page), this.totalPages);
  }

  resetFilters(): void {
    this.query = '';
    this.selectedProductId = 'ALL';
    this.selectedStatus = 'ALL';
    this.page = 1;
  }

  // ── KPI ──
  get productsWithVariants(): number {
    return new Set(this.rows.map(row => row.product.id)).size;
  }

  get totalVariantStock(): number {
    return this.rows.reduce((sum, row) => sum + (row.variant.stockQuantity || 0), 0);
  }

  get outOfStockCount(): number {
    return this.rows.filter(row => !row.variant.stockQuantity).length;
  }

  // ── Modal ──
  openCreateModal(): void {
    this.editingRow = null;
    this.draft = {
      productId: this.products[0]?.id,
      colorName: 'Noir Mat',
      colorHex: '#111827',
      size: '52-18-140',
      sku: `VAR-${Date.now().toString().slice(-6)}`,
      barcode: '805289307000',
      priceTnd: this.products[0]?.commercial.sellingPriceTnd ?? 0,
      stockQuantity: 0,
      status: 'ACTIF'
    };
    this.showModal = true;
  }

  openEditModal(row: VariantRow): void {
    this.editingRow = row;
    this.draft = { ...row.variant, productId: row.product.id };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingRow = null;
    this.draft = {};
  }

  saveVariant(): void {
    if (!this.draft.colorName || !this.draft.sku || !this.draft.barcode) {
      this.notificationService.error('Champs obligatoires', 'Couleur, SKU et code-barres sont requis pour enregistrer la variante.');
      return;
    }

    if (this.editingRow) {
      const target = this.editingRow;
      this.variantService.updateVariant(target.variant.id, this.draft).subscribe(() => {
        Object.assign(target.variant, {
          colorName: this.draft.colorName!,
          colorHex: this.draft.colorHex || '#111827',
          size: this.draft.size || target.variant.size,
          sku: this.draft.sku!,
          barcode: this.draft.barcode!,
          priceTnd: Number(this.draft.priceTnd) || 0,
          stockQuantity: Number(this.draft.stockQuantity) || 0,
          status: (this.draft.status as ProductStatus) || 'ACTIF'
        });
        this.rebuildRows();
        this.closeModal();
      });
      return;
    }

    const parent = this.products.find(p => p.id === this.draft.productId) || this.products[0];
    if (!parent) {
      this.notificationService.warning('Aucun produit', 'Créez au moins un produit avant d\'ajouter une variante.');
      return;
    }

    this.variantService.createVariant(parent.id, this.draft).subscribe(created => {
      parent.variants = [...(parent.variants || []), created];
      this.rebuildRows();
      this.closeModal();
    });
  }

  removeVariant(row: VariantRow): void {
    this.variantService.deleteVariant(row.variant.id).subscribe(() => {
      row.product.variants = (row.product.variants || []).filter(v => v.id !== row.variant.id);
      this.rebuildRows();
      if (this.page > this.totalPages) this.page = this.totalPages;
    });
  }

  // ── Helpers d'affichage ──
  getProductImage(product: Product): string {
    const primary = product.images?.find(i => i.isPrimary);
    if (primary) return primary.url;
    if (product.images?.length) return product.images[0].url;
    return 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&auto=format&fit=crop&q=80';
  }

  getStockClass(quantity?: number): string {
    if (!quantity) return 'stock-chip--zero';
    if (quantity < 5) return 'stock-chip--low';
    return 'stock-chip--ok';
  }

  getStatusLabel(status: ProductStatus): string {
    const map: Record<ProductStatus, string> = {
      'ACTIF': 'Actif',
      'INACTIF': 'Inactif',
      'BROUILLON': 'Brouillon'
    };
    return map[status] || status;
  }

  trackByVariant(_: number, row: VariantRow): string {
    return row.variant.id;
  }

  /** Export CSV des variantes filtrées */
  exportVariants(): void {
    const rows = this.matchingRows;
    if (rows.length === 0) {
      this.notificationService.warning('Export impossible', 'Aucune variante à exporter avec les filtres actuels.');
      return;
    }

    const header = ['Produit', 'Marque', 'Couleur', 'Taille', 'SKU', 'Code-barres', 'Prix TND', 'Stock', 'Statut'];
    const lines = rows.map(row => [
      `"${row.product.name}"`,
      `"${row.product.brandName}"`,
      `"${row.variant.colorName}"`,
      `"${row.variant.size}"`,
      `"${row.variant.sku}"`,
      `"${row.variant.barcode}"`,
      row.variant.priceTnd.toFixed(3),
      row.variant.stockQuantity || 0,
      row.variant.status
    ].join(';'));

    const csv = [header.join(';'), ...lines].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `optivision-variantes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    this.notificationService.success('Export terminé', `${rows.length} variante(s) exportée(s) au format CSV.`);
  }
}
