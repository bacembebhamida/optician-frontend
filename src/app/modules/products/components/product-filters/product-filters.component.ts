import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ProductCategory, ProductType, Gender, FrameShape,
  Material, ProductStatus, ProductFilterParams
} from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Brand } from '../../models/brand.model';
import { CategoryService } from '../../services/category.service';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-shell">

      <!-- ── Ligne principale: Recherche + Filtres essentiels ── -->
      <div class="filter-primary-row">

        <!-- Search Bar -->
        <div class="search-wrap" [class.focused]="searchFocused" id="filter-search-wrap">
          <i class="fa-solid fa-magnifying-glass search-ico"></i>
          <input
            type="text"
            id="filter-global-search"
            [(ngModel)]="filters.query"
            (ngModelChange)="onFilterChange()"
            (focus)="searchFocused = true"
            (blur)="searchFocused = false"
            placeholder="Rechercher par nom, SKU, modèle..."
            class="search-field"
            aria-label="Recherche globale dans le catalogue"
            autocomplete="off">
          <button *ngIf="filters.query"
                  (click)="clearSearch()"
                  class="search-clear-btn"
                  aria-label="Effacer la recherche"
                  title="Effacer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Quick Selects -->
        <div class="quick-filters-row">

          <div class="select-field-wrap">
            <label class="select-field-label" for="filter-cat">Catégorie</label>
            <select id="filter-cat"
                    [(ngModel)]="filters.category"
                    (ngModelChange)="onFilterChange()"
                    class="select-field"
                    aria-label="Filtrer par catégorie">
              <option value="ALL">Toutes</option>
              <option value="LUNETTES_VUE">Lunettes de vue</option>
              <option value="LUNETTES_SOLEIL">Lunettes de soleil</option>
              <option value="LENTILLES">Lentilles</option>
              <option value="ACCESSOIRES">Accessoires</option>
            </select>
          </div>

          <div class="select-field-wrap">
            <label class="select-field-label" for="filter-brand">Marque</label>
            <select id="filter-brand"
                    [(ngModel)]="filters.brandId"
                    (ngModelChange)="onFilterChange()"
                    class="select-field"
                    aria-label="Filtrer par marque">
              <option value="ALL">Toutes les marques</option>
              <option *ngFor="let b of brands" [ngValue]="b.id">{{ b.name }}</option>
            </select>
          </div>

          <div class="select-field-wrap">
            <label class="select-field-label" for="filter-status">Statut</label>
            <select id="filter-status"
                    [(ngModel)]="filters.status"
                    (ngModelChange)="onFilterChange()"
                    class="select-field"
                    aria-label="Filtrer par statut">
              <option value="ALL">Tous</option>
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
              <option value="BROUILLON">Brouillon</option>
            </select>
          </div>

        </div>

        <!-- Filter Control Buttons -->
        <div class="filter-ctrl-group">

          <button type="button"
                  class="btn-advanced"
                  [class.btn-advanced--active]="isExpanded"
                  (click)="isExpanded = !isExpanded"
                  [attr.aria-expanded]="isExpanded"
                  aria-controls="advanced-filters-panel"
                  id="btn-toggle-advanced-filters">
            <i class="fa-solid fa-sliders"></i>
            <span>Avancé</span>
            <span *ngIf="advancedFiltersCount > 0" class="adv-count">{{ advancedFiltersCount }}</span>
          </button>

          <button *ngIf="activeFiltersCount > 0"
                  type="button"
                  class="btn-reset"
                  (click)="resetFilters()"
                  title="Réinitialiser tous les filtres actifs"
                  id="btn-reset-all-filters">
            <i class="fa-solid fa-rotate-left"></i>
            <span>{{ activeFiltersCount }} filtre{{ activeFiltersCount > 1 ? 's' : '' }}</span>
          </button>

        </div>
      </div>

      <!-- ── Filtres Avancés (collapsible) ── -->
      <div *ngIf="isExpanded"
           id="advanced-filters-panel"
           class="advanced-panel animate-slide-down"
           role="region"
           aria-label="Filtres avancés">

        <div class="advanced-grid">

          <div class="adv-field">
            <label class="adv-label" for="filter-type">Type de produit</label>
            <select id="filter-type"
                    [(ngModel)]="filters.type"
                    (ngModelChange)="onFilterChange()"
                    class="adv-select">
              <option value="ALL">Tous les types</option>
              <option value="MONTURE">Monture</option>
              <option value="VERRE">Verre</option>
              <option value="LENTILLE_CONTACT">Lentille de contact</option>
              <option value="ACCESSOIRE">Accessoire</option>
            </select>
          </div>

          <div class="adv-field">
            <label class="adv-label" for="filter-gender">Genre</label>
            <select id="filter-gender"
                    [(ngModel)]="filters.gender"
                    (ngModelChange)="onFilterChange()"
                    class="adv-select">
              <option value="ALL">Tous les genres</option>
              <option value="HOMME">Homme</option>
              <option value="FEMME">Femme</option>
              <option value="UNISEX">Mixte / Unisex</option>
              <option value="ENFANT">Enfant</option>
            </select>
          </div>

          <div class="adv-field">
            <label class="adv-label" for="filter-material">Matériau</label>
            <select id="filter-material"
                    [(ngModel)]="filters.material"
                    (ngModelChange)="onFilterChange()"
                    class="adv-select">
              <option value="ALL">Tous les matériaux</option>
              <option value="TITANE">Titane</option>
              <option value="ACETATE">Acétate</option>
              <option value="METAL">Métal</option>
              <option value="BOIS">Bois</option>
              <option value="INJECTE">Injecté</option>
              <option value="COMBINE">Combiné</option>
            </select>
          </div>

          <div class="adv-field">
            <label class="adv-label" for="filter-color">Couleur</label>
            <input
              type="text"
              id="filter-color"
              [(ngModel)]="filters.color"
              (ngModelChange)="onFilterChange()"
              placeholder="Noir, Écaille, Or..."
              class="adv-input"
              aria-label="Filtrer par couleur">
          </div>

          <div class="adv-field adv-field--wide">
            <label class="adv-label">Fourchette de prix (DT)</label>
            <div class="price-range-row">
              <input
                type="number"
                id="filter-price-min"
                [(ngModel)]="filters.minPrice"
                (ngModelChange)="onFilterChange()"
                placeholder="Min"
                class="adv-input price-input"
                min="0"
                aria-label="Prix minimum">
              <span class="price-range-sep"><i class="fa-solid fa-arrow-right-long"></i></span>
              <input
                type="number"
                id="filter-price-max"
                [(ngModel)]="filters.maxPrice"
                (ngModelChange)="onFilterChange()"
                placeholder="Max"
                class="adv-input price-input"
                min="0"
                aria-label="Prix maximum">
              <span class="price-currency">DT</span>
            </div>
          </div>

        </div>
      </div>

      <!-- ── Chips des filtres actifs ── -->
      <div *ngIf="activeFiltersCount > 0" class="active-filters-chips">
        <span class="chips-label">Filtres actifs :</span>
        <span *ngIf="filters.query" class="filter-chip">
          <i class="fa-solid fa-magnifying-glass"></i> "{{ filters.query }}"
          <button (click)="filters.query = ''; onFilterChange()" class="chip-remove" aria-label="Retirer ce filtre">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </span>
        <span *ngIf="filters.category && filters.category !== 'ALL'" class="filter-chip">
          <i class="fa-solid fa-tag"></i> {{ getCategoryLabel(filters.category) }}
          <button (click)="filters.category = 'ALL'; onFilterChange()" class="chip-remove" aria-label="Retirer ce filtre">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </span>
        <span *ngIf="filters.status && filters.status !== 'ALL'" class="filter-chip">
          <i class="fa-solid fa-circle-dot"></i> {{ filters.status }}
          <button (click)="filters.status = 'ALL'; onFilterChange()" class="chip-remove" aria-label="Retirer ce filtre">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </span>
        <button (click)="resetFilters()" class="chip-reset-all">
          <i class="fa-solid fa-rotate-left"></i> Tout effacer
        </button>
      </div>

    </div>
  `,
  styles: [`
    /* ── Shell ── */
    .filter-shell {
      background: #FFFFFF;
      border: 1px solid #E9ECF0;
      border-radius: 16px;
      padding: 1.125rem 1.375rem;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      box-shadow: 0 1px 4px rgba(17,24,39,0.04);
    }

    /* ── Primary Row ── */
    .filter-primary-row {
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    /* ── Search ── */
    .search-wrap {
      flex: 1 1 260px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 11px;
      padding: 0.6rem 0.875rem;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }
    .search-wrap.focused {
      background: #FFFFFF;
      border-color: #C5A880;
      box-shadow: 0 0 0 3px rgba(197,168,128,0.14);
    }
    .search-ico {
      color: #9CA3AF;
      font-size: 0.875rem;
      flex-shrink: 0;
    }
    .search-field {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 0.85rem;
      color: #111827;
      font-family: inherit;
    }
    .search-field::placeholder { color: #D1D5DB; }
    .search-clear-btn {
      background: none;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      padding: 0.1rem;
      line-height: 1;
      transition: color 0.15s;
    }
    .search-clear-btn:hover { color: #374151; }

    /* ── Quick Filters ── */
    .quick-filters-row {
      display: flex;
      align-items: flex-end;
      gap: 0.625rem;
      flex-wrap: wrap;
    }
    .select-field-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      min-width: 150px;
    }
    .select-field-label {
      font-size: 0.68rem;
      font-weight: 700;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }
    .select-field {
      padding: 0.575rem 0.875rem;
      font-size: 0.825rem;
      font-weight: 600;
      color: #1F2937;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      outline: none;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }
    .select-field:focus {
      border-color: #C5A880;
      background: #FFFFFF;
    }

    /* ── Filter Control Buttons ── */
    .filter-ctrl-group {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      margin-left: auto;
    }
    .btn-advanced {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.575rem 1rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: #374151;
      background: #F3F4F6;
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .btn-advanced:hover {
      background: #E5E7EB;
    }
    .btn-advanced--active {
      background: #111827;
      color: #FFFFFF;
      border-color: #111827;
    }
    .btn-advanced--active:hover {
      background: #1F2937;
    }
    .adv-count {
      background: #C5A880;
      color: #FFFFFF;
      font-size: 0.65rem;
      padding: 0.1rem 0.4rem;
      border-radius: 99px;
      font-weight: 800;
      line-height: 1.4;
    }
    .btn-reset {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.575rem 0.875rem;
      font-size: 0.795rem;
      font-weight: 600;
      color: #B91C1C;
      background: #FEF2F2;
      border: 1px solid #FCA5A5;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .btn-reset:hover {
      background: #FEE2E2;
      border-color: #F87171;
    }

    /* ── Advanced Panel ── */
    .advanced-panel {
      padding-top: 0.875rem;
      border-top: 1px solid #F3F4F6;
    }
    .advanced-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(168px, 1fr));
      gap: 1rem;
    }
    .adv-field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .adv-field--wide {
      grid-column: span 2;
    }
    .adv-label {
      font-size: 0.68rem;
      font-weight: 700;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }
    .adv-select, .adv-input {
      padding: 0.525rem 0.75rem;
      font-size: 0.82rem;
      font-weight: 500;
      color: #1F2937;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 9px;
      outline: none;
      font-family: inherit;
      transition: border-color 0.2s;
    }
    .adv-select:focus, .adv-input:focus {
      border-color: #C5A880;
      background: #FFFFFF;
    }
    .price-range-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .price-input { flex: 1; }
    .price-range-sep {
      color: #D1D5DB;
      font-size: 0.75rem;
      flex-shrink: 0;
    }
    .price-currency {
      font-size: 0.75rem;
      font-weight: 700;
      color: #9CA3AF;
      flex-shrink: 0;
    }

    /* ── Active Filter Chips ── */
    .active-filters-chips {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      padding-top: 0.625rem;
      border-top: 1px dashed #F3F4F6;
    }
    .chips-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
    }
    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.625rem 0.25rem 0.625rem;
      background: #EFF6FF;
      color: #1D4ED8;
      border: 1px solid #BFDBFE;
      border-radius: 99px;
      font-size: 0.725rem;
      font-weight: 600;
    }
    .filter-chip i { font-size: 0.65rem; }
    .chip-remove {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      color: #93C5FD;
      padding: 0;
      line-height: 1;
      margin-left: 0.2rem;
      font-size: 0.6rem;
      transition: color 0.15s;
    }
    .chip-remove:hover { color: #1D4ED8; }
    .chip-reset-all {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.25rem 0.6rem;
      font-size: 0.7rem;
      font-weight: 600;
      color: #6B7280;
      background: none;
      border: 1px dashed #D1D5DB;
      border-radius: 99px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .chip-reset-all:hover { color: #111827; border-color: #9CA3AF; }

    /* Slide-down animation */
    .animate-slide-down {
      animation: slideDown 0.2s ease forwards;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .filter-primary-row { flex-direction: column; align-items: stretch; }
      .quick-filters-row { justify-content: stretch; }
      .select-field-wrap { min-width: unset; flex: 1; }
      .filter-ctrl-group { margin-left: 0; justify-content: flex-end; }
      .adv-field--wide { grid-column: span 1; }
    }
  `]
})
export class ProductFiltersComponent implements OnInit {
  isExpanded: boolean = false;
  searchFocused: boolean = false;
  categories: Category[] = [];
  brands: Brand[] = [];

  @Input() filters: ProductFilterParams = {
    query: '',
    category: 'ALL',
    brandId: 'ALL',
    type: 'ALL',
    gender: 'ALL',
    material: 'ALL',
    status: 'ALL',
    minPrice: null,
    maxPrice: null,
    color: '',
    page: 1,
    pageSize: 10
  };

  @Output() filterChange = new EventEmitter<ProductFilterParams>();

  constructor(
    private categoryService: CategoryService,
    private brandService: BrandService
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(cats => this.categories = cats);
    this.brandService.getBrands().subscribe(bList => this.brands = bList);
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.filters.query) count++;
    if (this.filters.category && this.filters.category !== 'ALL') count++;
    if (this.filters.brandId && this.filters.brandId !== 'ALL') count++;
    if (this.filters.type && this.filters.type !== 'ALL') count++;
    if (this.filters.gender && this.filters.gender !== 'ALL') count++;
    if (this.filters.material && this.filters.material !== 'ALL') count++;
    if (this.filters.status && this.filters.status !== 'ALL') count++;
    if (this.filters.minPrice != null) count++;
    if (this.filters.maxPrice != null) count++;
    if (this.filters.color) count++;
    return count;
  }

  get advancedFiltersCount(): number {
    let count = 0;
    if (this.filters.type && this.filters.type !== 'ALL') count++;
    if (this.filters.gender && this.filters.gender !== 'ALL') count++;
    if (this.filters.material && this.filters.material !== 'ALL') count++;
    if (this.filters.minPrice != null) count++;
    if (this.filters.maxPrice != null) count++;
    if (this.filters.color) count++;
    return count;
  }

  getCategoryLabel(value: string): string {
    const map: Record<string, string> = {
      'LUNETTES_VUE': 'Lunettes de vue',
      'LUNETTES_SOLEIL': 'Lunettes de soleil',
      'LENTILLES': 'Lentilles',
      'ACCESSOIRES': 'Accessoires'
    };
    return map[value] || value;
  }

  clearSearch(): void {
    this.filters.query = '';
    this.onFilterChange();
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.filterChange.emit({ ...this.filters });
  }

  resetFilters(): void {
    this.filters.query = '';
    this.filters.category = 'ALL';
    this.filters.brandId = 'ALL';
    this.filters.type = 'ALL';
    this.filters.gender = 'ALL';
    this.filters.material = 'ALL';
    this.filters.status = 'ALL';
    this.filters.minPrice = null;
    this.filters.maxPrice = null;
    this.filters.color = '';
    this.onFilterChange();
  }
}
