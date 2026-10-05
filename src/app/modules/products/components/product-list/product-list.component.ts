import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import {
  Product,
  ProductFilterParams,
  PagedResult,
  ProductStatus,
  ProductCategory
} from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 p-6 font-sans">

      <!-- ═══════════════════════════════════════════════════════════════
           HEADER : Titre + Actions principales
           ═══════════════════════════════════════════════════════════════ -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Catalogue Produits</h1>
          <p class="text-sm text-slate-500 mt-0.5">
            {{ pagedResult.totalItems }} référence(s) — Gestion centralisée du stock optique
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Export -->
          <button
            (click)="onExport()"
            class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
            <i class="fa-solid fa-file-export text-slate-400"></i>
            Exporter
          </button>

          <!-- Nouveau Produit (CTA principal) -->
          <a
            routerLink="/admin/products/new"
            class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <i class="fa-solid fa-plus"></i>
            Nouveau Produit
          </a>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════
           TOOLBAR : Recherche + Filtres rapides
           ═══════════════════════════════════════════════════════════════ -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-5">
        <div class="flex flex-wrap items-center gap-3">

          <!-- Recherche globale -->
          <div class="relative flex-1 min-w-[240px]">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              placeholder="Rechercher par nom, SKU, modèle, marque..."
              class="w-full pl-10 pr-10 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all placeholder:text-slate-400">
            <button
              *ngIf="searchQuery"
              (click)="clearSearch()"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Filtre Catégorie -->
          <div class="relative">
            <select
              [(ngModel)]="selectedCategory"
              (ngModelChange)="onFilterChange()"
              class="appearance-none pl-4 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl outline-none cursor-pointer hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all">
              <option value="ALL">Toutes catégories</option>
              <option value="LUNETTES_VUE">Lunettes de vue</option>
              <option value="LUNETTES_SOLEIL">Lunettes de soleil</option>
              <option value="LUNETTES_ENFANT">Lunettes enfant</option>
              <option value="LENTILLES">Lentilles</option>
              <option value="ACCESSOIRES">Accessoires</option>
            </select>
            <i class="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
          </div>

          <!-- Filtre Marque -->
          <div class="relative">
            <select
              [(ngModel)]="selectedBrand"
              (ngModelChange)="onFilterChange()"
              class="appearance-none pl-4 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl outline-none cursor-pointer hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all">
              <option value="ALL">Toutes marques</option>
              <option *ngFor="let brand of brands" [value]="brand">{{ brand }}</option>
            </select>
            <i class="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
          </div>

          <!-- Filtre Statut -->
          <div class="relative">
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="onFilterChange()"
              class="appearance-none pl-4 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl outline-none cursor-pointer hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all">
              <option value="ALL">Tous statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
              <option value="BROUILLON">Brouillon</option>
            </select>
            <i class="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
          </div>

          <!-- Reset filtres -->
          <button
            *ngIf="hasActiveFilters"
            (click)="resetFilters()"
            class="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors">
            <i class="fa-solid fa-rotate-left text-xs"></i>
            Réinitialiser
          </button>

        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════
           TABLEAU PRINCIPAL
           ═══════════════════════════════════════════════════════════════ -->

      <!-- Skeleton Loading -->
      <div *ngIf="isLoading" class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-b-0 animate-pulse">
          <div class="w-10 h-10 bg-slate-100 rounded-lg"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3.5 bg-slate-100 rounded w-1/3"></div>
            <div class="h-3 bg-slate-100 rounded w-1/4"></div>
          </div>
          <div class="w-20 h-6 bg-slate-100 rounded-full"></div>
          <div class="w-16 h-4 bg-slate-100 rounded"></div>
          <div class="w-24 h-4 bg-slate-100 rounded"></div>
          <div class="w-28 h-8 bg-slate-100 rounded"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && pagedResult.items.length === 0" class="bg-white border border-dashed border-slate-300 rounded-2xl py-16 px-6 text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
          <i class="fa-solid fa-glasses text-amber-500 text-2xl"></i>
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-1">Aucun produit trouvé</h3>
        <p class="text-sm text-slate-500 mb-5">Modifiez vos critères de recherche ou ajoutez un nouveau produit au catalogue.</p>
        <a routerLink="/admin/products/new" class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors">
          <i class="fa-solid fa-plus"></i>
          Ajouter un produit
        </a>
      </div>

      <!-- Data Table -->
      <div *ngIf="!isLoading && pagedResult.items.length > 0" class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-14">Visuel</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 transition-colors select-none" (click)="sortBy('sku')">
                  <span class="inline-flex items-center gap-1">
                    SKU
                    <i class="fa-solid text-[9px]" [ngClass]="getSortIcon('sku')"></i>
                  </span>
                </th>
                <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 transition-colors select-none" (click)="sortBy('name')">
                  <span class="inline-flex items-center gap-1">
                    Produit
                    <i class="fa-solid text-[9px]" [ngClass]="getSortIcon('name')"></i>
                  </span>
                </th>
                <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 transition-colors select-none" (click)="sortBy('brandName')">
                  <span class="inline-flex items-center gap-1">
                    Marque
                    <i class="fa-solid text-[9px]" [ngClass]="getSortIcon('brandName')"></i>
                  </span>
                </th>
                <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Catégorie</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 transition-colors select-none" (click)="sortBy('priceTnd')">
                  <span class="inline-flex items-center gap-1 justify-end">
                    Prix
                    <i class="fa-solid text-[9px]" [ngClass]="getSortIcon('priceTnd')"></i>
                  </span>
                </th>
                <th class="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th class="px-5 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let p of pagedResult.items"
                class="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors group"
                style="height: 56px;">

                <!-- Visuel -->
                <td class="px-5 py-2">
                  <img
                    [src]="getPrimaryImageUrl(p)"
                    [alt]="p.name"
                    class="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-white"
                    loading="lazy">
                </td>

                <!-- SKU -->
                <td class="px-4 py-2">
                  <span class="font-mono text-[12px] font-bold text-slate-800">{{ p.sku }}</span>
                  <span class="block text-[10px] text-slate-400 font-mono mt-0.5">
                    <i class="fa-solid fa-barcode mr-1"></i>{{ p.barcode }}
                  </span>
                </td>

                <!-- Produit (Nom + Description courte) -->
                <td class="px-4 py-2">
                  <a [routerLink]="['/admin/products', p.id]" class="font-semibold text-slate-900 hover:text-amber-600 transition-colors line-clamp-1">
                    {{ p.name }}
                  </a>
                  <span class="block text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-[260px]">
                    {{ p.description }}
                  </span>
                </td>

                <!-- Marque (badge) -->
                <td class="px-4 py-2">
                  <span class="inline-flex items-center px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white bg-slate-800 rounded-md">
                    {{ p.brandName }}
                  </span>
                </td>

                <!-- Catégorie -->
                <td class="px-4 py-2">
                  <span class="inline-flex items-center px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 rounded-md">
                    {{ formatCategory(p.category) }}
                  </span>
                </td>

                <!-- Prix + Marge -->
                <td class="px-4 py-2 text-right">
                  <span class="block font-bold text-slate-900 text-[13px]">
                    {{ p.commercial.sellingPriceTnd | number:'1.3-3' }} <span class="text-[10px] font-semibold text-slate-400">DT</span>
                  </span>
                  <span class="block text-[10px] font-semibold mt-0.5" [ngClass]="p.commercial.marginTnd < 0 ? 'text-red-500' : 'text-emerald-600'">
                    Marge {{ p.commercial.marginPercentage | number:'1.1-1' }}%
                  </span>
                </td>

                <!-- Statut (badge coloré) -->
                <td class="px-4 py-2 text-center">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full"
                    [ngClass]="getStatusClasses(p.status)">
                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {{ p.status }}
                  </span>
                </td>

                <!-- Actions (icônes avec tooltips) -->
                <td class="px-5 py-2">
                  <div class="flex items-center justify-end gap-1.5">

                    <!-- Voir -->
                    <a
                      [routerLink]="['/admin/products', p.id]"
                      title="Voir la fiche produit"
                      class="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 border border-transparent hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-all">
                      <i class="fa-regular fa-eye text-[13px]"></i>
                    </a>

                    <!-- Éditer -->
                    <a
                      [routerLink]="['/admin/products', p.id, 'edit']"
                      title="Modifier le produit"
                      class="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 border border-transparent hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all">
                      <i class="fa-solid fa-pen text-[12px]"></i>
                    </a>

                    <!-- Supprimer -->
                    <button
                      (click)="onDelete(p.id)"
                      title="Supprimer le produit"
                      class="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 border border-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
                      <i class="fa-regular fa-trash-can text-[13px]"></i>
                    </button>

                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════
             PAGINATION
             ═══════════════════════════════════════════════════════════════ -->
        <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/50 border-t border-slate-200">
          <p class="text-xs text-slate-500">
            Affichage de
            <span class="font-bold text-slate-700">{{ getStartIndex() }}</span>
            à
            <span class="font-bold text-slate-700">{{ getEndIndex() }}</span>
            sur
            <span class="font-bold text-slate-700">{{ pagedResult.totalItems }}</span>
            produits
          </p>

          <div class="flex items-center gap-3">
            <!-- Taille de page -->
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">Par page :</span>
              <select
                [ngModel]="pageSize"
                (ngModelChange)="onPageSizeChange($event)"
                class="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer focus:border-slate-400">
                <option [ngValue]="10">10</option>
                <option [ngValue]="25">25</option>
                <option [ngValue]="50">50</option>
                <option [ngValue]="100">100</option>
              </select>
            </div>

            <!-- Navigation -->
            <div class="flex items-center gap-1.5">
              <button
                (click)="goToPage(currentPage - 1)"
                [disabled]="currentPage <= 1"
                class="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Page précédente">
                <i class="fa-solid fa-chevron-left text-[10px]"></i>
              </button>

              <!-- Pages numérotées -->
              <ng-container *ngFor="let page of getPageNumbers()">
                <button
                  *ngIf="page !== '...'"
                  (click)="goToPageSafe(page)"
                  class="min-w-8 h-8 px-2 inline-flex items-center justify-center rounded-lg text-xs font-bold transition-colors"
                  [ngClass]="page === currentPage
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'">
                  {{ page }}
                </button>
                <span *ngIf="page === '...'" class="px-1 text-slate-400 text-xs">…</span>
              </ng-container>

              <button
                (click)="goToPage(currentPage + 1)"
                [disabled]="currentPage >= pagedResult.totalPages"
                class="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Page suivante">
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Line clamp utility (fallback si Tailwind Play ne le fournit pas) */
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Scrollbar fine pour le tableau */
    .overflow-x-auto::-webkit-scrollbar {
      height: 6px;
    }
    .overflow-x-auto::-webkit-scrollbar-track {
      background: #F1F5F9;
    }
    .overflow-x-auto::-webkit-scrollbar-thumb {
      background: #CBD5E1;
      border-radius: 3px;
    }
    .overflow-x-auto::-webkit-scrollbar-thumb:hover {
      background: #94A3B8;
    }
  `]
})
export class ProductListComponent implements OnInit {
  // ── État ──────────────────────────────────────────────────────────────
  isLoading: boolean = true;
  pagedResult: PagedResult<Product> = {
    items: [],
    totalItems: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1
  };

  // ── Filtres ───────────────────────────────────────────────────────────
  searchQuery: string = '';
  selectedCategory: ProductCategory | 'ALL' = 'ALL';
  selectedBrand: string = 'ALL';
  selectedStatus: ProductStatus | 'ALL' = 'ALL';

  // ── Tri & Pagination ─────────────────────────────────────────────────
  sortField: string = 'updatedAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  currentPage: number = 1;
  pageSize: number = 10;

  // ── Données dérivées ─────────────────────────────────────────────────
  brands: string[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.extractBrands();
    this.loadProducts();
  }

  // ── Chargement des données ────────────────────────────────────────────
  loadProducts(): void {
    this.isLoading = true;

    const params: ProductFilterParams = {
      query: this.searchQuery,
      category: this.selectedCategory,
      brandId: this.selectedBrand === 'ALL' ? 'ALL' : this.getBrandIdByName(this.selectedBrand),
      status: this.selectedStatus,
      sortBy: this.sortField as any,
      sortDirection: this.sortDirection,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.productService.getProducts(params).subscribe(result => {
      this.pagedResult = result;
      this.currentPage = result.page;
      this.isLoading = false;
    });
  }

  // ── Filtres ─────────────────────────────────────────────────────────
  onSearchChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchChange();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'ALL';
    this.selectedBrand = 'ALL';
    this.selectedStatus = 'ALL';
    this.currentPage = 1;
    this.loadProducts();
  }

  get hasActiveFilters(): boolean {
    return !!this.searchQuery
      || this.selectedCategory !== 'ALL'
      || this.selectedBrand !== 'ALL'
      || this.selectedStatus !== 'ALL';
  }

  // ── Tri ──────────────────────────────────────────────────────────────
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.loadProducts();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'fa-sort text-slate-300';
    return this.sortDirection === 'asc' ? 'fa-sort-up text-slate-700' : 'fa-sort-down text-slate-700';
  }

  // ── Pagination ──────────────────────────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || page > this.pagedResult.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  goToPageSafe(page: number | string): void {
    if (typeof page === 'number') {
      this.goToPage(page);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadProducts();
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.pagedResult.totalItems);
  }

  getPageNumbers(): (number | string)[] {
    const total = this.pagedResult.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current > 3) pages.push('...');

    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push('...');
    pages.push(total);

    return pages;
  }

  // ── Helpers ─────────────────────────────────────────────────────────
  getPrimaryImageUrl(p: Product): string {
    const primary = p.images?.find(i => i.isPrimary);
    if (primary) return primary.url;
    if (p.images?.length) return p.images[0].url;
    return 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&auto=format&fit=crop&q=80';
  }

  formatCategory(category: string): string {
    return category.replaceAll('_', ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getStatusClasses(status: ProductStatus): string {
    switch (status) {
      case 'ACTIF':
        return 'bg-emerald-50 text-emerald-700';
      case 'INACTIF':
        return 'bg-red-50 text-red-600';
      case 'BROUILLON':
        return 'bg-amber-50 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  extractBrands(): void {
    // Récupère les marques uniques depuis le service (fallback local)
    this.productService.products$.subscribe(products => {
      this.brands = [...new Set(products.map(p => p.brandName))].sort();
    });
  }

  getBrandIdByName(name: string): number | 'ALL' {
    // Fallback : on cherche dans les produits mockés
    let brandId: number | 'ALL' = 'ALL';
    this.productService.products$.subscribe(products => {
      const found = products.find(p => p.brandName === name);
      if (found) brandId = found.brandId;
    });
    return brandId;
  }

  // ── Actions ──────────────────────────────────────────────────────────
  onDelete(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  onExport(): void {
    this.productService.exportProducts([], 'csv').subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `catalogue-produits-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}