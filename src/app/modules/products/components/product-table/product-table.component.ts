import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product, ProductStatus } from '../../models/product.model';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule, RouterLink, HasPermissionDirective],
  template: `

    <!-- ── Bulk Actions Bar ── -->
    <div *ngIf="selectedIds.length > 0" class="bulk-bar animate-pop-in" role="toolbar" aria-label="Actions groupées">
      <div class="bulk-bar__info">
        <div class="bulk-bar__icon">
          <i class="fa-solid fa-check"></i>
        </div>
        <span><strong>{{ selectedIds.length }}</strong> produit{{ selectedIds.length > 1 ? 's' : '' }} sélectionné{{ selectedIds.length > 1 ? 's' : '' }}</span>
        <button class="bulk-deselect" (click)="clearSelection()" title="Désélectionner tout">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="bulk-bar__actions">
        <button (click)="bulkUpdateStatus('ACTIF')" class="bulk-btn bulk-btn--activate" id="bulk-btn-activate">
          <i class="fa-solid fa-circle-check"></i> Activer
        </button>
        <button (click)="bulkUpdateStatus('INACTIF')" class="bulk-btn bulk-btn--deactivate" id="bulk-btn-deactivate">
          <i class="fa-solid fa-circle-pause"></i> Désactiver
        </button>
        <button (click)="bulkExport('csv')" class="bulk-btn bulk-btn--export" id="bulk-btn-export">
          <i class="fa-solid fa-file-csv"></i> Exporter
        </button>
        <button *appHasPermission="'PRODUCT_DELETE'"
                (click)="bulkDelete()"
                class="bulk-btn bulk-btn--delete"
                id="bulk-btn-delete">
          <i class="fa-solid fa-trash-can"></i> Supprimer ({{ selectedIds.length }})
        </button>
      </div>
    </div>

    <!-- ── Skeleton Loading ── -->
    <div *ngIf="isLoading" class="table-shell" aria-busy="true" aria-label="Chargement en cours">
      <table class="data-table" aria-hidden="true">
        <thead>
          <tr>
            <th class="col-check"></th>
            <th class="col-visual"></th>
            <th class="col-product">Produit</th>
            <th class="col-brand">Marque</th>
            <th class="col-category">Catégorie</th>
            <th class="col-price">Prix</th>
            <th class="col-status">Statut</th>
            <th class="col-date">Modifié</th>
            <th class="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let i of [1,2,3,4,5,6]" class="skel-row">
            <td><div class="sk sk-check"></div></td>
            <td><div class="sk sk-img"></div></td>
            <td>
              <div class="sk sk-text-lg" style="width:70%"></div>
              <div class="sk sk-text-sm" style="width:45%; margin-top: 6px;"></div>
            </td>
            <td><div class="sk sk-badge"></div></td>
            <td><div class="sk sk-text-sm" style="width:80%"></div></td>
            <td>
              <div class="sk sk-text-lg" style="width:60%"></div>
              <div class="sk sk-text-sm" style="width:40%; margin-top:5px;"></div>
            </td>
            <td><div class="sk sk-status"></div></td>
            <td><div class="sk sk-text-sm" style="width:70%"></div></td>
            <td><div class="sk sk-actions"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Empty State ── -->
    <div *ngIf="!isLoading && products.length === 0" class="empty-state" role="status">
      <div class="empty-state__visual">
        <div class="empty-state__icon">
          <i class="fa-regular fa-folder-open"></i>
        </div>
        <div class="empty-state__rings">
          <span></span><span></span>
        </div>
      </div>
      <h3 class="empty-state__title">Aucun produit trouvé</h3>
      <p class="empty-state__desc">
        Aucun résultat ne correspond à vos critères de recherche.<br>
        Ajustez vos filtres ou ajoutez un nouveau produit au catalogue.
      </p>
      <button *appHasPermission="'PRODUCT_CREATE'"
              (click)="createNewProduct.emit()"
              class="empty-state__cta"
              id="btn-empty-state-create">
        <i class="fa-solid fa-plus"></i>
        Créer un produit
      </button>
    </div>

    <!-- ── Desktop / Tablet Table ── -->
    <div *ngIf="!isLoading && products.length > 0" class="table-shell">
      <table class="data-table" aria-label="Catalogue des produits">
        <thead>
          <tr>
            <th class="col-check" scope="col">
              <label class="custom-checkbox" aria-label="Tout sélectionner">
                <input type="checkbox"
                       [checked]="isAllSelected"
                       [indeterminate]="selectedIds.length > 0 && !isAllSelected"
                       (change)="toggleSelectAll()"
                       aria-label="Sélectionner tous les produits visibles">
                <span class="checkmark"></span>
              </label>
            </th>
            <th class="col-visual" scope="col"></th>
            <th class="col-product sortable" scope="col" (click)="sort('name')" [attr.aria-sort]="getAriaSort('name')">
              Produit <i class="fa-solid sort-icon" [ngClass]="getSortIcon('name')"></i>
            </th>
            <th class="col-brand sortable" scope="col" (click)="sort('brandName')" [attr.aria-sort]="getAriaSort('brandName')">
              Marque <i class="fa-solid sort-icon" [ngClass]="getSortIcon('brandName')"></i>
            </th>
            <th class="col-category" scope="col">Catégorie</th>
            <th class="col-price sortable" scope="col" (click)="sort('priceTnd')" [attr.aria-sort]="getAriaSort('priceTnd')">
              Prix <i class="fa-solid sort-icon" [ngClass]="getSortIcon('priceTnd')"></i>
            </th>
            <th class="col-status" scope="col">Statut</th>
            <th class="col-date sortable" scope="col" (click)="sort('updatedAt')" [attr.aria-sort]="getAriaSort('updatedAt')">
              Modifié <i class="fa-solid sort-icon" [ngClass]="getSortIcon('updatedAt')"></i>
            </th>
            <th class="col-actions" scope="col"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of products; trackBy: trackById"
              [class.row--selected]="isSelected(p.id)"
              [id]="'product-row-' + p.id">

            <!-- Checkbox -->
            <td class="col-check">
              <label class="custom-checkbox" [attr.aria-label]="'Sélectionner ' + p.name">
                <input type="checkbox"
                       [checked]="isSelected(p.id)"
                       (change)="toggleSelect(p.id)"
                       [attr.aria-label]="'Sélectionner ' + p.name">
                <span class="checkmark"></span>
              </label>
            </td>

            <!-- Thumbnail -->
            <td class="col-visual">
              <div class="product-thumb-wrap">
                <img [src]="getPrimaryImageUrl(p)"
                     [alt]="p.name"
                     class="product-thumb"
                     loading="lazy">
                <span *ngIf="p.variants && p.variants.length > 0" class="variant-badge" [title]="p.variants.length + ' variante(s)'">
                  {{ p.variants.length }}
                </span>
              </div>
            </td>

            <!-- Product Name + SKU -->
            <td class="col-product">
              <a [routerLink]="['/admin/products', p.id]" class="product-name-link" [title]="p.name">
                {{ p.name }}
              </a>
              <div class="product-meta-row">
                <span class="product-sku">{{ p.sku }}</span>
                <span *ngIf="p.model" class="product-model">{{ p.model }}</span>
              </div>
            </td>

            <!-- Brand -->
            <td class="col-brand">
              <span class="brand-pill">{{ p.brandName }}</span>
            </td>

            <!-- Category -->
            <td class="col-category">
              <span class="category-label">{{ formatCategory(p.category) }}</span>
              <span *ngIf="p.subCategory" class="subcategory-label">{{ p.subCategory }}</span>
            </td>

            <!-- Price + Margin -->
            <td class="col-price">
              <span class="price-amount">{{ p.commercial.sellingPriceTnd | number:'1.3-3' }} <small>DT</small></span>
              <span class="price-margin" [class.price-margin--negative]="p.commercial.marginTnd < 0">
                <i class="fa-solid" [ngClass]="p.commercial.marginTnd >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'"></i>
                {{ p.commercial.marginPercentage | number:'1.1-1' }}%
              </span>
            </td>

            <!-- Status -->
            <td class="col-status">
              <button (click)="toggleStatus.emit(p.id)"
                      class="status-btn"
                      [ngClass]="getStatusClass(p.status)"
                      [title]="'Statut : ' + p.status + ' — Cliquer pour modifier'"
                      [attr.aria-label]="'Statut ' + p.status + ' — Cliquer pour changer'">
                <span class="status-dot"></span>
                {{ getStatusLabel(p.status) }}
              </button>
            </td>

            <!-- Date -->
            <td class="col-date">
              <span class="date-day">{{ p.updatedAt | date:'dd/MM/yyyy' }}</span>
              <span class="date-time">{{ p.updatedAt | date:'HH:mm' }}</span>
            </td>

            <!-- Actions (revealed on row hover) -->
            <td class="col-actions">
              <div class="row-actions">
                <a [routerLink]="['/admin/products', p.id]"
                   class="row-action row-action--view"
                   title="Voir la fiche produit"
                   [id]="'btn-view-' + p.id">
                  <i class="fa-regular fa-eye"></i>
                </a>
                <a *appHasPermission="'PRODUCT_UPDATE'"
                   [routerLink]="['/admin/products', p.id, 'edit']"
                   class="row-action row-action--edit"
                   title="Modifier le produit"
                   [id]="'btn-edit-' + p.id">
                  <i class="fa-solid fa-pen-to-square"></i>
                </a>
                <button *appHasPermission="'PRODUCT_CREATE'"
                        (click)="duplicate.emit(p.id)"
                        class="row-action row-action--copy"
                        title="Dupliquer ce produit"
                        [id]="'btn-duplicate-' + p.id">
                  <i class="fa-regular fa-copy"></i>
                </button>
                <button *appHasPermission="'PRODUCT_DELETE'"
                        (click)="delete.emit(p.id)"
                        class="row-action row-action--delete"
                        title="Supprimer ce produit"
                        [id]="'btn-delete-' + p.id">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>
            </td>

          </tr>
        </tbody>
      </table>

      <!-- Results Summary Row -->
      <div class="table-footer-info" aria-live="polite">
        <span>{{ products.length }} produit{{ products.length > 1 ? 's' : '' }} affichés</span>
        <span *ngIf="selectedIds.length > 0" class="footer-selection-hint">
          · <strong>{{ selectedIds.length }}</strong> sélectionné{{ selectedIds.length > 1 ? 's' : '' }}
        </span>
      </div>
    </div>

    <!-- ── Mobile Cards Layout ── -->
    <div *ngIf="!isLoading && products.length > 0" class="mobile-grid" aria-label="Liste des produits (mobile)">
      <article *ngFor="let p of products; trackBy: trackById"
               class="mobile-card"
               [class.mobile-card--selected]="isSelected(p.id)"
               [id]="'mobile-product-' + p.id">

        <div class="mobile-card__header">
          <label class="custom-checkbox" [attr.aria-label]="'Sélectionner ' + p.name">
            <input type="checkbox"
                   [checked]="isSelected(p.id)"
                   (change)="toggleSelect(p.id)">
            <span class="checkmark"></span>
          </label>

          <img [src]="getPrimaryImageUrl(p)" [alt]="p.name" class="mobile-thumb" loading="lazy">

          <div class="mobile-card__info">
            <span class="brand-pill">{{ p.brandName }}</span>
            <a [routerLink]="['/admin/products', p.id]" class="mobile-card__name">{{ p.name }}</a>
            <span class="product-sku">{{ p.sku }}</span>
          </div>

          <button (click)="toggleStatus.emit(p.id)"
                  class="status-btn"
                  [ngClass]="getStatusClass(p.status)"
                  [attr.aria-label]="'Statut ' + p.status">
            <span class="status-dot"></span>
            {{ getStatusLabel(p.status) }}
          </button>
        </div>

        <div class="mobile-card__details">
          <div class="detail-item">
            <span class="detail-label">Prix</span>
            <span class="detail-value price-amount">{{ p.commercial.sellingPriceTnd | number:'1.3-3' }} DT</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Catégorie</span>
            <span class="detail-value">{{ formatCategory(p.category) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Marge</span>
            <span class="detail-value" [class.price-margin--negative]="p.commercial.marginTnd < 0">
              {{ p.commercial.marginPercentage | number:'1.1-1' }}%
            </span>
          </div>
        </div>

        <div class="mobile-card__actions">
          <a [routerLink]="['/admin/products', p.id]" class="mobile-action-btn">
            <i class="fa-regular fa-eye"></i> Voir
          </a>
          <a *appHasPermission="'PRODUCT_UPDATE'"
             [routerLink]="['/admin/products', p.id, 'edit']"
             class="mobile-action-btn">
            <i class="fa-solid fa-pen-to-square"></i> Éditer
          </a>
          <button *appHasPermission="'PRODUCT_DELETE'"
                  (click)="delete.emit(p.id)"
                  class="mobile-action-btn mobile-action-btn--danger">
            <i class="fa-regular fa-trash-can"></i> Supprimer
          </button>
        </div>

      </article>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* ── Bulk Bar ── */
    .bulk-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      background: #111827;
      color: #F9FAFB;
      padding: 0.875rem 1.25rem;
      border-radius: 14px;
      margin-bottom: 0.875rem;
      box-shadow: 0 8px 24px rgba(17,24,39,0.2);
    }
    .bulk-bar__info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.875rem;
    }
    .bulk-bar__icon {
      width: 28px;
      height: 28px;
      background: #C5A880;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      flex-shrink: 0;
    }
    .bulk-deselect {
      background: rgba(255,255,255,0.12);
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      border-radius: 6px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      transition: color 0.15s;
    }
    .bulk-deselect:hover { color: #FFFFFF; }
    .bulk-bar__actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .bulk-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.875rem;
      font-size: 0.775rem;
      font-weight: 700;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .bulk-btn:hover { opacity: 0.88; }
    .bulk-btn--activate { background: #059669; color: #FFFFFF; }
    .bulk-btn--deactivate { background: #F59E0B; color: #FFFFFF; }
    .bulk-btn--export { background: #374151; color: #FFFFFF; }
    .bulk-btn--delete { background: #DC2626; color: #FFFFFF; }

    /* ── Table Shell ── */
    .table-shell {
      background: #FFFFFF;
      border: 1px solid #E9ECF0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(17,24,39,0.04);
    }

    /* ── Data Table ── */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      text-align: left;
    }
    .data-table thead tr {
      background: #FAFAFA;
      border-bottom: 1px solid #E9ECF0;
    }
    .data-table th {
      padding: 0.75rem 1rem;
      font-size: 0.7rem;
      font-weight: 700;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      white-space: nowrap;
      user-select: none;
    }
    .data-table th.sortable {
      cursor: pointer;
      transition: color 0.15s;
    }
    .data-table th.sortable:hover { color: #111827; }
    .sort-icon {
      margin-left: 0.35rem;
      font-size: 0.65rem;
      vertical-align: middle;
    }
    .data-table td {
      padding: 0.875rem 1rem;
      border-bottom: 1px solid #F3F4F6;
      vertical-align: middle;
    }
    .data-table tbody tr {
      transition: background 0.12s ease;
    }
    .data-table tbody tr:hover { background: #FAFAFA; }
    .data-table tbody tr:hover .row-actions { opacity: 1; }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .data-table tbody tr.row--selected { background: #FFFBEB; }
    .data-table tbody tr.row--selected:hover { background: #FEF9E7; }

    /* ── Column Widths ── */
    .col-check { width: 44px; }
    .col-visual { width: 60px; }
    .col-product { min-width: 200px; }
    .col-brand { width: 120px; }
    .col-category { width: 130px; }
    .col-price { width: 120px; }
    .col-status { width: 110px; }
    .col-date { width: 100px; }
    .col-actions { width: 130px; }

    /* ── Custom Checkbox ── */
    .custom-checkbox {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      position: relative;
    }
    .custom-checkbox input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }
    .checkmark {
      width: 16px;
      height: 16px;
      border: 1.5px solid #D1D5DB;
      border-radius: 4px;
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      flex-shrink: 0;
    }
    .custom-checkbox input:checked ~ .checkmark {
      background: #111827;
      border-color: #111827;
    }
    .custom-checkbox input:checked ~ .checkmark::after {
      content: '';
      width: 4px;
      height: 7px;
      border: 2px solid #FFFFFF;
      border-top: none;
      border-left: none;
      transform: rotate(45deg);
      display: block;
      margin-bottom: 1px;
    }
    .custom-checkbox input:indeterminate ~ .checkmark {
      background: #111827;
      border-color: #111827;
    }
    .custom-checkbox input:indeterminate ~ .checkmark::after {
      content: '';
      width: 8px;
      height: 2px;
      background: #FFFFFF;
      display: block;
    }

    /* ── Product Thumbnail ── */
    .product-thumb-wrap {
      position: relative;
      display: inline-block;
    }
    .product-thumb {
      width: 44px;
      height: 44px;
      object-fit: cover;
      border-radius: 10px;
      border: 1px solid #E9ECF0;
      background: #F9FAFB;
      display: block;
    }
    .variant-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      width: 18px;
      height: 18px;
      background: #2563EB;
      color: #FFFFFF;
      border-radius: 50%;
      font-size: 0.6rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid #FFFFFF;
      line-height: 1;
    }

    /* ── Product Info ── */
    .product-name-link {
      display: block;
      font-weight: 700;
      font-size: 0.875rem;
      color: #111827;
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 240px;
      transition: color 0.15s;
    }
    .product-name-link:hover { color: #C5A880; }
    .product-meta-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.2rem;
      flex-wrap: wrap;
    }
    .product-sku {
      font-family: 'Courier New', monospace;
      font-size: 0.725rem;
      font-weight: 700;
      color: #6B7280;
      background: #F3F4F6;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
    }
    .product-model {
      font-size: 0.725rem;
      color: #9CA3AF;
    }

    /* ── Brand Pill ── */
    .brand-pill {
      display: inline-block;
      padding: 0.2rem 0.625rem;
      font-size: 0.68rem;
      font-weight: 800;
      background: #111827;
      color: #FFFFFF;
      border-radius: 6px;
      letter-spacing: 0.04em;
      white-space: nowrap;
      text-transform: uppercase;
    }

    /* ── Category ── */
    .category-label {
      display: block;
      font-size: 0.8rem;
      color: #374151;
      font-weight: 500;
    }
    .subcategory-label {
      display: block;
      font-size: 0.7rem;
      color: #9CA3AF;
      margin-top: 0.1rem;
    }

    /* ── Price ── */
    .price-amount {
      display: block;
      font-weight: 800;
      font-size: 0.925rem;
      color: #111827;
    }
    .price-amount small {
      font-size: 0.7rem;
      font-weight: 600;
      color: #6B7280;
    }
    .price-margin {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: #059669;
      margin-top: 0.15rem;
    }
    .price-margin i { font-size: 0.65rem; }
    .price-margin--negative { color: #DC2626; }

    /* ── Status Badge ── */
    .status-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.75rem;
      font-size: 0.715rem;
      font-weight: 700;
      border-radius: 99px;
      border: 1px solid transparent;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.2s, box-shadow 0.2s;
    }
    .status-btn:hover {
      opacity: 0.85;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .status-btn--active {
      background: #ECFDF5;
      color: #065F46;
      border-color: #A7F3D0;
    }
    .status-btn--inactive {
      background: #FEF2F2;
      color: #991B1B;
      border-color: #FECACA;
    }
    .status-btn--draft {
      background: #FFFBEB;
      color: #92400E;
      border-color: #FDE68A;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }

    /* ── Date ── */
    .date-day {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #374151;
    }
    .date-time {
      display: block;
      font-size: 0.7rem;
      color: #9CA3AF;
      margin-top: 0.1rem;
    }

    /* ── Row Actions ── */
    .row-actions {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    .row-action {
      width: 30px;
      height: 30px;
      border-radius: 7px;
      border: 1px solid #E9ECF0;
      background: #FFFFFF;
      color: #6B7280;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      text-decoration: none;
      font-size: 0.75rem;
      transition: all 0.15s ease;
    }
    .row-action--view:hover  { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; }
    .row-action--edit:hover  { background: #FFFBEB; color: #D97706; border-color: #FDE68A; }
    .row-action--copy:hover  { background: #F5F3FF; color: #7C3AED; border-color: #DDD6FE; }
    .row-action--delete:hover { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }

    /* ── Table Footer Info ── */
    .table-footer-info {
      padding: 0.75rem 1.25rem;
      font-size: 0.775rem;
      color: #9CA3AF;
      border-top: 1px solid #F3F4F6;
      background: #FAFAFA;
    }
    .footer-selection-hint { color: #374151; }
    .footer-selection-hint strong { color: #111827; }

    /* ── Skeleton ── */
    .skel-row td { padding: 0.875rem 1rem; }
    .sk {
      background: linear-gradient(90deg, #F3F4F6 25%, #E9ECF0 50%, #F3F4F6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.6s infinite linear;
      border-radius: 6px;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .sk-check  { width: 16px; height: 16px; border-radius: 4px; }
    .sk-img    { width: 44px; height: 44px; border-radius: 10px; }
    .sk-text-lg { height: 14px; }
    .sk-text-sm { height: 10px; }
    .sk-badge  { width: 64px; height: 20px; border-radius: 6px; }
    .sk-status { width: 72px; height: 22px; border-radius: 99px; }
    .sk-actions { width: 100px; height: 30px; }

    /* ── Empty State ── */
    .empty-state {
      background: #FFFFFF;
      border: 1px solid #E9ECF0;
      border-radius: 16px;
      padding: 5rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .empty-state__visual {
      position: relative;
      margin-bottom: 0.5rem;
    }
    .empty-state__icon {
      width: 72px;
      height: 72px;
      background: #F3F4F6;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: #D1D5DB;
      position: relative;
      z-index: 1;
    }
    .empty-state__rings {
      position: absolute;
      inset: -12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .empty-state__rings span {
      position: absolute;
      border: 1px solid #F3F4F6;
      border-radius: 50%;
    }
    .empty-state__rings span:nth-child(1) { width: 96px; height: 96px; }
    .empty-state__rings span:nth-child(2) { width: 120px; height: 120px; }
    .empty-state__title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }
    .empty-state__desc {
      font-size: 0.85rem;
      color: #6B7280;
      line-height: 1.7;
      max-width: 380px;
      margin: 0;
    }
    .empty-state__cta {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      padding: 0.65rem 1.5rem;
      background: #111827;
      color: #FFFFFF;
      border: none;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
    }
    .empty-state__cta:hover {
      background: #1F2937;
      transform: translateY(-1px);
    }

    /* ── Mobile Cards ── */
    .mobile-grid {
      display: none;
      flex-direction: column;
      gap: 0.875rem;
    }
    .mobile-card {
      background: #FFFFFF;
      border: 1px solid #E9ECF0;
      border-radius: 14px;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(17,24,39,0.04);
      transition: border-color 0.15s;
    }
    .mobile-card--selected { border-color: #C5A880; background: #FFFBF5; }
    .mobile-card__header {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .mobile-thumb {
      width: 52px;
      height: 52px;
      object-fit: cover;
      border-radius: 10px;
      border: 1px solid #E9ECF0;
      flex-shrink: 0;
    }
    .mobile-card__info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .mobile-card__name {
      font-weight: 700;
      font-size: 0.9rem;
      color: #111827;
      text-decoration: none;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .mobile-card__details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      margin-top: 0.875rem;
      padding-top: 0.875rem;
      border-top: 1px solid #F3F4F6;
    }
    .detail-item { display: flex; flex-direction: column; gap: 0.15rem; }
    .detail-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .detail-value { font-size: 0.8rem; font-weight: 600; color: #111827; }
    .mobile-card__actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.875rem;
      flex-wrap: wrap;
    }
    .mobile-action-btn {
      flex: 1;
      padding: 0.525rem;
      font-size: 0.775rem;
      font-weight: 700;
      border-radius: 9px;
      border: 1px solid #E5E7EB;
      background: #F9FAFB;
      color: #374151;
      text-align: center;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .mobile-action-btn:hover { background: #F3F4F6; border-color: #D1D5DB; }
    .mobile-action-btn--danger {
      color: #DC2626;
      border-color: #FECACA;
      background: #FEF2F2;
    }
    .mobile-action-btn--danger:hover { background: #FEE2E2; }

    /* ── Responsive visibility ── */
    @media (max-width: 768px) {
      .table-shell { display: none; }
      .mobile-grid { display: flex; }
      .bulk-bar { flex-direction: column; align-items: flex-start; }
    }

    /* ── Animations ── */
    .animate-pop-in {
      animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes popIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ── Accessibility ── */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0,0,0,0);
      white-space: nowrap;
      border-width: 0;
    }
  `]
})
export class ProductTableComponent {
  @Input() products: Product[] = [];
  @Input() isLoading: boolean = false;
  @Input() sortBy: string = 'updatedAt';
  @Input() sortDirection: 'asc' | 'desc' = 'desc';

  @Output() sortChange = new EventEmitter<{ field: string; direction: 'asc' | 'desc' }>();
  @Output() toggleStatus = new EventEmitter<number>();
  @Output() duplicate = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() createNewProduct = new EventEmitter<void>();
  @Output() bulkAction = new EventEmitter<{ action: 'delete' | 'status' | 'export'; status?: ProductStatus; format?: 'csv'; ids: number[] }>();

  selectedIds: number[] = [];

  get isAllSelected(): boolean {
    return this.products.length > 0 && this.selectedIds.length === this.products.length;
  }

  toggleSelectAll(): void {
    this.selectedIds = this.isAllSelected ? [] : this.products.map(p => p.id);
  }

  toggleSelect(id: number): void {
    this.selectedIds = this.isSelected(id)
      ? this.selectedIds.filter(i => i !== id)
      : [...this.selectedIds, id];
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  clearSelection(): void {
    this.selectedIds = [];
  }

  sort(field: string): void {
    const direction = this.sortBy === field && this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ field, direction });
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return 'fa-sort text-slate-300 ml-1';
    return this.sortDirection === 'asc'
      ? 'fa-sort-up ml-1'
      : 'fa-sort-down ml-1';
  }

  getAriaSort(field: string): 'ascending' | 'descending' | 'none' {
    if (this.sortBy !== field) return 'none';
    return this.sortDirection === 'asc' ? 'ascending' : 'descending';
  }

  getStatusClass(status: ProductStatus): string {
    const map: Record<ProductStatus, string> = {
      'ACTIF': 'status-btn--active',
      'INACTIF': 'status-btn--inactive',
      'BROUILLON': 'status-btn--draft'
    };
    return map[status] || '';
  }

  getStatusLabel(status: ProductStatus): string {
    const map: Record<ProductStatus, string> = {
      'ACTIF': 'Actif',
      'INACTIF': 'Inactif',
      'BROUILLON': 'Brouillon'
    };
    return map[status] || status;
  }

  formatCategory(cat: string): string {
    const map: Record<string, string> = {
      'LUNETTES_VUE': 'Lunettes de vue',
      'LUNETTES_SOLEIL': 'Lunettes de soleil',
      'LUNETTES_ENFANT': 'Enfant',
      'LENTILLES': 'Lentilles',
      'ACCESSOIRES': 'Accessoires'
    };
    return map[cat] || cat.replaceAll('_', ' ');
  }

  getPrimaryImageUrl(p: Product): string {
    const primary = p.images?.find(i => i.isPrimary);
    if (primary) return primary.url;
    if (p.images?.length) return p.images[0].url;
    return 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&auto=format&fit=crop&q=80';
  }

  trackById(_: number, p: Product): number {
    return p.id;
  }

  bulkUpdateStatus(status: ProductStatus): void {
    this.bulkAction.emit({ action: 'status', status, ids: [...this.selectedIds] });
    this.selectedIds = [];
  }

  bulkDelete(): void {
    this.bulkAction.emit({ action: 'delete', ids: [...this.selectedIds] });
    this.selectedIds = [];
  }

  bulkExport(format: 'csv'): void {
    this.bulkAction.emit({ action: 'export', format, ids: [...this.selectedIds] });
  }
}
