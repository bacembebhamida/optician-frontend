import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockMovementService } from '../../services/stock-movement.service';
import { StockMovement, MovementFilterParams, MovementType } from '../../models/movement.model';
import { MovementTableComponent } from '../../components/movement-table/movement-table.component';
import { StockPagedResult } from '../../models/stock.model';

@Component({
  selector: 'app-movements-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MovementTableComponent],
  template: `
    <div class="movements-page font-sans animate-fade-in">
      
      <!-- Page Header -->
      <div class="page-header mb-6">
        <div>
          <h1 class="page-title font-bold text-2xl text-slate-900">
            <i class="fa-solid fa-clock-rotate-left text-amber-600 mr-2"></i> Historique des Mouvements de Stock
          </h1>
          <p class="page-sub text-sm text-slate-500">Journal d'audit inaltérable traçant chaque entrée, sortie, vente ou transfert en boutique.</p>
        </div>
      </div>

      <!-- Movement Filters Box -->
      <div class="filter-box mb-6">
        
        <div class="filter-row">
          
          <!-- Type Filter -->
          <div class="f-group">
            <label class="f-label">Type Mouvement</label>
            <select [(ngModel)]="filterParams.type" (change)="loadMovements()" class="f-select">
              <option value="ALL">Tous les types</option>
              <option value="ENTREE">Entrée Fournisseur</option>
              <option value="SORTIE_VENTE">Sortie Vente</option>
              <option value="SORTIE_PERTE">Perte / Vol</option>
              <option value="SORTIE_DOMMAGE">Casse / Dommage</option>
              <option value="TRANSFERT_ENTRANT">Transfert Entrant</option>
              <option value="TRANSFERT_SORTANT">Transfert Sortant</option>
              <option value="AJUSTEMENT_INVENTAIRE">Ajustement Inventaire</option>
            </select>
          </div>

          <!-- Store Filter -->
          <div class="f-group">
            <label class="f-label">Magasin</label>
            <select [(ngModel)]="filterParams.storeId" (change)="loadMovements()" class="f-select">
              <option [value]="'ALL'">Tous les magasins</option>
              <option [value]="1">Tunis Centre Flagship</option>
              <option [value]="2">Sousse Centre Boutique</option>
              <option [value]="3">Sfax Mall Branch</option>
            </select>
          </div>

          <!-- Search Query -->
          <div class="f-group flex-1">
            <label class="f-label">Produit, SKU ou Référence BL</label>
            <input 
              type="text" 
              [(ngModel)]="filterParams.query" 
              (keyup.enter)="loadMovements()" 
              placeholder="Rechercher..."
              class="f-input">
          </div>

          <!-- Refresh Button -->
          <button (click)="loadMovements()" class="btn-refresh-mvt font-bold">
            <i class="fa-solid fa-rotate"></i> Filtrer
          </button>

        </div>

      </div>

      <!-- Movement Audit Table -->
      <div class="mb-6">
        <app-movement-table
          [movements]="pagedResult?.items || []"
          [isLoading]="isLoading">
        </app-movement-table>
      </div>

      <!-- Pagination -->
      <div *ngIf="pagedResult && pagedResult.totalPages > 1" class="pagination-bar">
        <span class="text-xs text-slate-500 font-mono">Page {{ filterParams.page }} sur {{ pagedResult.totalPages }}</span>
        
        <div class="flex gap-2">
          <button 
            (click)="changePage(filterParams.page - 1)" 
            [disabled]="filterParams.page <= 1"
            class="px-3 py-1 border rounded text-xs">
            Précédent
          </button>
          <button 
            (click)="changePage(filterParams.page + 1)" 
            [disabled]="filterParams.page >= pagedResult.totalPages"
            class="px-3 py-1 border rounded text-xs">
            Suivant
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .movements-page { padding: 1.5rem; }
    
    .filter-box {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 1.25rem;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
    }
    .filter-row { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
    .f-group { display: flex; flex-direction: column; gap: 0.3rem; min-width: 160px; }
    .f-label { font-size: 0.75rem; font-weight: 700; color: #64748B; }
    .f-select, .f-input {
      padding: 0.55rem 0.75rem;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      font-size: 0.85rem;
    }
    .btn-refresh-mvt {
      padding: 0.55rem 1.1rem;
      border-radius: 10px;
      border: none;
      background: #0F172A;
      color: white;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 0.85rem;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
    }
  `]
})
export class MovementsPageComponent implements OnInit {
  filterParams: MovementFilterParams = {
    storeId: 'ALL',
    type: 'ALL',
    query: '',
    page: 1,
    pageSize: 10
  };

  pagedResult?: StockPagedResult<StockMovement>;
  isLoading: boolean = false;

  constructor(private movementService: StockMovementService) {}

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.isLoading = true;
    this.movementService.getMovements(this.filterParams).subscribe({
      next: (res) => {
        this.pagedResult = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  changePage(page: number): void {
    if (this.pagedResult && page >= 1 && page <= this.pagedResult.totalPages) {
      this.filterParams.page = page;
      this.loadMovements();
    }
  }
}
