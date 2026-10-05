import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StockFilterParams, StockStatus } from '../../models/stock.model';

@Component({
  selector: 'app-stock-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filters-container font-sans">
      
      <!-- Top Row: Search & Barcode & Actions -->
      <div class="filter-top-row">
        
        <!-- Text Search -->
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="onSearchChange($event)"
            placeholder="Rechercher par produit, SKU ou code-barres..."
            class="search-input">
          <button *ngIf="searchQuery" (click)="clearSearch()" class="clear-btn" title="Effacer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Barcode Quick Input -->
        <div class="barcode-box">
          <i class="fa-solid fa-barcode barcode-icon"></i>
          <input 
            type="text" 
            [(ngModel)]="barcodeQuery"
            (keyup.enter)="applyBarcodeFilter()"
            placeholder="Code-barres..."
            class="barcode-input">
          <button (click)="applyBarcodeFilter()" class="btn-barcode-go" title="Filtrer code-barres">
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        <!-- Barcode Scanner Trigger Button -->
        <button (click)="openScannerModal.emit()" class="btn-scan-trigger font-bold">
          <i class="fa-solid fa-camera font-normal"></i> Scanner Code
        </button>

      </div>

      <!-- Bottom Row: Dropdown Filters & Toggles -->
      <div class="filter-bottom-row">

        <!-- Store Filter -->
        <div class="select-group">
          <label class="select-label"><i class="fa-solid fa-store"></i> Magasin</label>
          <select [ngModel]="filters.storeId" (ngModelChange)="updateFilter('storeId', $event)" class="filter-select">
            <option [value]="'ALL'">Tous les Magasins</option>
            <option [value]="1">Tunis Centre Flagship</option>
            <option [value]="2">Sousse Centre Boutique</option>
            <option [value]="3">Sfax Mall Branch</option>
          </select>
        </div>

        <!-- Category Filter -->
        <div class="select-group">
          <label class="select-label"><i class="fa-solid fa-tags"></i> Catégorie</label>
          <select [ngModel]="filters.category" (ngModelChange)="updateFilter('category', $event)" class="filter-select">
            <option value="ALL">Toutes les Catégories</option>
            <option value="Lunettes de vue">Lunettes de vue</option>
            <option value="Lunettes de soleil">Lunettes de soleil</option>
            <option value="Lentilles de contact">Lentilles</option>
            <option value="Accessoires">Accessoires</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="select-group">
          <label class="select-label"><i class="fa-solid fa-signal"></i> Statut Stock</label>
          <select [ngModel]="filters.status" (ngModelChange)="updateFilter('status', $event)" class="filter-select">
            <option value="ALL">Tous les Statuts</option>
            <option value="AVAILABLE">Disponible</option>
            <option value="LOW_STOCK">Stock Faible</option>
            <option value="OUT_OF_STOCK">Rupture de Stock</option>
            <option value="OVER_STOCK">Surstock</option>
          </select>
        </div>

        <!-- Quick Toggles -->
        <div class="toggles-group">
          <button 
            (click)="toggleLowStock()" 
            [class.active]="filters.lowStockOnly" 
            class="toggle-btn warning font-semibold">
            <i class="fa-solid fa-arrow-down-short-wide"></i> Stock Faible
          </button>
          
          <button 
            (click)="toggleOutOfStock()" 
            [class.active]="filters.outOfStockOnly" 
            class="toggle-btn danger font-semibold">
            <i class="fa-solid fa-triangle-exclamation"></i> Ruptures
          </button>
        </div>

        <!-- Reset Button -->
        <button (click)="resetAllFilters()" class="btn-reset-filters" title="Réinitialiser tous les filtres">
          <i class="fa-solid fa-rotate-left"></i> Réinitialiser
        </button>

      </div>

    </div>
  `,
  styles: [`
    .filters-container {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
    }
    
    .filter-top-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }

    .search-box, .barcode-box {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 240px;
    }

    .search-icon, .barcode-icon {
      position: absolute;
      left: 0.85rem;
      color: #94A3B8;
      font-size: 0.9rem;
    }

    .search-input, .barcode-input {
      width: 100%;
      padding: 0.6rem 2.2rem 0.6rem 2.4rem;
      border: 1px solid #CBD5E1;
      border-radius: 12px;
      font-size: 0.875rem;
      background: #F8FAFC;
      color: #0F172A;
      transition: all 0.2s;
    }
    .search-input:focus, .barcode-input:focus {
      outline: none;
      border-color: #C5A880;
      background: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.15);
    }

    .clear-btn {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: #94A3B8;
      cursor: pointer;
    }

    .btn-barcode-go {
      position: absolute;
      right: 0.4rem;
      background: #334155;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.3rem 0.6rem;
      cursor: pointer;
      font-size: 0.75rem;
    }

    .btn-scan-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #F8FAFC;
      border: none;
      border-radius: 12px;
      padding: 0.65rem 1.1rem;
      font-size: 0.85rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
      transition: all 0.2s ease;
    }
    .btn-scan-trigger:hover {
      background: #C5A880;
      color: #FFFFFF;
      transform: translateY(-1px);
    }

    .filter-bottom-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.85rem;
      align-items: flex-end;
    }

    .select-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      flex: 1;
      min-width: 150px;
    }

    .select-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748B;
    }

    .filter-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      font-size: 0.825rem;
      background: #FFFFFF;
      color: #1E293B;
    }

    .toggles-group {
      display: flex;
      gap: 0.5rem;
    }

    .toggle-btn {
      padding: 0.5rem 0.85rem;
      border-radius: 10px;
      border: 1px solid #CBD5E1;
      background: #F8FAFC;
      color: #475569;
      font-size: 0.8rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .toggle-btn.warning.active {
      background: #FEF3C7;
      border-color: #F59E0B;
      color: #B45309;
    }
    .toggle-btn.danger.active {
      background: #FEE2E2;
      border-color: #EF4444;
      color: #B91C1C;
    }

    .btn-reset-filters {
      padding: 0.5rem 0.85rem;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
      background: #FFFFFF;
      color: #64748B;
      font-size: 0.8rem;
      cursor: pointer;
    }
    .btn-reset-filters:hover {
      background: #F1F5F9;
      color: #0F172A;
    }

    @media (max-width: 768px) {
      .filter-top-row, .filter-bottom-row {
        flex-direction: column;
        align-items: stretch;
      }
      .search-box, .barcode-box, .select-group {
        width: 100%;
      }
    }
  `]
})
export class StockFiltersComponent implements OnInit, OnDestroy {
  @Input() filters: StockFilterParams = { page: 1, pageSize: 10 };
  @Output() filterChange = new EventEmitter<StockFilterParams>();
  @Output() openScannerModal = new EventEmitter<void>();

  searchQuery: string = '';
  barcodeQuery: string = '';

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  ngOnInit(): void {
    this.searchQuery = this.filters.query || '';
    this.barcodeQuery = this.filters.barcode || '';

    this.searchSub = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(query => {
      this.filters.query = query;
      this.filters.page = 1;
      this.filterChange.emit(this.filters);
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSearchChange(text: string): void {
    this.searchSubject.next(text);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  applyBarcodeFilter(): void {
    this.filters.barcode = this.barcodeQuery.trim();
    this.filters.page = 1;
    this.filterChange.emit(this.filters);
  }

  updateFilter(key: keyof StockFilterParams, value: any): void {
    (this.filters as any)[key] = value;
    this.filters.page = 1;
    this.filterChange.emit(this.filters);
  }

  toggleLowStock(): void {
    this.filters.lowStockOnly = !this.filters.lowStockOnly;
    if (this.filters.lowStockOnly) this.filters.outOfStockOnly = false;
    this.filters.page = 1;
    this.filterChange.emit(this.filters);
  }

  toggleOutOfStock(): void {
    this.filters.outOfStockOnly = !this.filters.outOfStockOnly;
    if (this.filters.outOfStockOnly) this.filters.lowStockOnly = false;
    this.filters.page = 1;
    this.filterChange.emit(this.filters);
  }

  resetAllFilters(): void {
    this.searchQuery = '';
    this.barcodeQuery = '';
    this.filters = {
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
    this.filterChange.emit(this.filters);
  }
}
