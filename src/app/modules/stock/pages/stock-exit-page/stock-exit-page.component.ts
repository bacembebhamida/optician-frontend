import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StockService } from '../../services/stock.service';
import { StockExitRequest, ExitReason, StockItem } from '../../models/stock.model';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-stock-exit-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmDialogComponent],
  template: `
    <div class="stock-exit-page font-sans animate-fade-in">
      
      <!-- Page Header -->
      <div class="page-header mb-6">
        <div>
          <h1 class="page-title font-bold text-2xl text-slate-900">
            <i class="fa-solid fa-square-minus text-red-600 mr-2"></i> Formulaire de Sortie de Stock
          </h1>
          <p class="page-sub text-sm text-slate-500">Vente directe, perte, dommage/casse ou correction de stock.</p>
        </div>

        <a routerLink="/admin/stock/products" class="btn-back font-semibold">
          <i class="fa-solid fa-arrow-left mr-1"></i> Retour au Stock
        </a>
      </div>

      <!-- Success Confirmation Banner -->
      <div *ngIf="lastExitResult" class="success-banner mb-6">
        <div class="s-icon">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <div class="s-body">
          <h3 class="s-title font-bold">Mouvement de sortie déduit avec succès !</h3>
          <p class="s-text">
            Nouveau stock restants pour <strong>{{ lastExitResult.productName }}</strong> ({{ lastExitResult.storeName }}) : 
            <span class="font-mono font-bold text-slate-900">{{ lastExitResult.currentStock }} unités</span>.
          </p>
        </div>
        <a routerLink="/admin/stock/movements" class="btn-view-mvt font-bold">
          Voir Historique
        </a>
      </div>

      <!-- Main Form & Realtime Stock Calculation -->
      <div class="exit-layout-grid">
        
        <!-- Form -->
        <div class="form-card">
          <h2 class="card-title font-bold text-slate-800 mb-4 border-b pb-2">
            Informations de la Sortie
          </h2>

          <form (ngSubmit)="openConfirmModal()" class="exit-form">
            
            <!-- Store Selection -->
            <div class="field-group">
              <label class="field-label font-semibold">Magasin Source *</label>
              <select [(ngModel)]="exitReq.storeId" (change)="onStoreOrProductChange()" name="storeId" class="form-select" required>
                <option [ngValue]="1">Tunis Centre Flagship</option>
                <option [ngValue]="2">Sousse Centre Boutique</option>
                <option [ngValue]="3">Sfax Mall Branch</option>
              </select>
            </div>

            <!-- Product Selection -->
            <div class="field-group">
              <label class="field-label font-semibold">Produit à Déduire *</label>
              <select [(ngModel)]="exitReq.productId" (change)="onStoreOrProductChange()" name="productId" class="form-select" required>
                <option *ngFor="let p of availableProducts" [ngValue]="p.productId">
                  {{ p.productName }} (SKU: {{ p.sku }} - Disponible: {{ p.availableStock }})
                </option>
              </select>
            </div>

            <!-- Reason Selection -->
            <div class="field-group">
              <label class="field-label font-semibold">Motif de la Sortie *</label>
              <select [(ngModel)]="exitReq.reason" name="reason" class="form-select" required>
                <option value="VENTE">VENTE - Vente au comptoir / Facture</option>
                <option value="PERTE">PERTE - Article manquant ou vol</option>
                <option value="DOMMAGE">DOMMAGE - Casse monture ou verre défectueux</option>
                <option value="CORRECTION">CORRECTION - Ajustement négatif inventaire</option>
              </select>
            </div>

            <!-- Quantity & Reference Number -->
            <div class="field-row">
              <div class="field-group flex-1">
                <label class="field-label font-semibold">Quantité à Retirer *</label>
                <input 
                  type="number" 
                  [(ngModel)]="exitReq.quantity" 
                  min="1" 
                  [max]="selectedStockItem?.availableStock || 9999"
                  name="quantity" 
                  class="form-input font-mono font-bold"
                  [class.border-red-500]="isQuantityExceeded"
                  required>
              </div>

              <div class="field-group flex-1">
                <label class="field-label font-semibold">Référence Facture / Pièce *</label>
                <input type="text" [(ngModel)]="exitReq.referenceNumber" name="referenceNumber" placeholder="Ex: FAC-2026-0042" class="form-input font-mono" required>
              </div>
            </div>

            <!-- Notes -->
            <div class="field-group">
              <label class="field-label font-semibold">Observations / Justification</label>
              <textarea [(ngModel)]="exitReq.notes" name="notes" rows="2" placeholder="Explication du motif..." class="form-textarea"></textarea>
            </div>

            <!-- Error Notice if Exceeded Available Stock -->
            <div *ngIf="isQuantityExceeded" class="exceeded-alert font-semibold">
              <i class="fa-solid fa-triangle-exclamation mr-1"></i>
              La quantité demandée ({{ exitReq.quantity }}) dépasse le stock disponible ({{ selectedStockItem?.availableStock || 0 }}).
            </div>

            <div class="form-actions mt-4">
              <button type="submit" [disabled]="!isFormValid || isQuantityExceeded" class="btn-submit-exit font-bold">
                <i class="fa-solid fa-minus mr-1"></i> Valider et Déduire du Stock
              </button>
            </div>

          </form>
        </div>

        <!-- Realtime Stock Impact Box -->
        <div class="summary-card">
          <h2 class="card-title font-bold text-slate-800 mb-4 border-b pb-2">
            Impact Direct sur le Stock
          </h2>

          <div *ngIf="selectedStockItem" class="summary-preview">
            
            <div class="item-preview-head">
              <img [src]="selectedStockItem.productImageUrl" [alt]="selectedStockItem.productName" class="preview-img">
              <div>
                <span class="brand font-mono font-bold text-xs text-amber-700">{{ selectedStockItem.brandName }}</span>
                <h4 class="name font-bold text-slate-900 text-sm">{{ selectedStockItem.productName }}</h4>
                <span class="store font-mono text-xs text-slate-500"><i class="fa-solid fa-store"></i> {{ selectedStockItem.storeName }}</span>
              </div>
            </div>

            <!-- Live Calculation Block -->
            <div class="stock-calc-box font-mono my-4">
              <div class="calc-row">
                <span class="c-label">Stock Actuel :</span>
                <span class="c-val font-bold text-slate-700">{{ selectedStockItem.currentStock }} unités</span>
              </div>

              <div class="calc-row text-red-600">
                <span class="c-label">Quantité Demandée :</span>
                <span class="c-val font-bold">-{{ exitReq.quantity }} unités</span>
              </div>

              <div class="calc-row total border-t pt-2 mt-2">
                <span class="c-label font-bold text-slate-900">Stock Après Opération :</span>
                <span class="c-val font-bold text-lg" [class.text-red-600]="stockAfterOperation === 0" [class.text-amber-600]="stockAfterOperation > 0 && stockAfterOperation <= selectedStockItem.minimumThreshold" [class.text-emerald-700]="stockAfterOperation > selectedStockItem.minimumThreshold">
                  {{ stockAfterOperation }} unités
                </span>
              </div>
            </div>

            <div class="details-box text-xs text-slate-600">
              <p><strong>Motif retenu :</strong> {{ exitReq.reason }}</p>
              <p><strong>Pièce justificative :</strong> {{ exitReq.referenceNumber || 'Non renseignée' }}</p>
            </div>

          </div>

        </div>

      </div>

      <!-- Confirm Dialog Modal -->
      <app-confirm-dialog
        [isOpen]="showConfirmModal"
        title="Confirmation de la Sortie de Stock"
        [message]="'Voulez-vous déduire ' + exitReq.quantity + ' unité(s) pour ' + (selectedStockItem?.productName || '') + ' ?'"
        type="danger"
        confirmText="Déduire le stock"
        (onConfirm)="confirmStockExit()"
        (onCancel)="showConfirmModal = false">
      </app-confirm-dialog>

    </div>
  `,
  styles: [`
    .stock-exit-page { padding: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .btn-back {
      padding: 0.5rem 1rem;
      border-radius: 10px;
      border: 1px solid #CBD5E1;
      background: white;
      color: #334155;
      text-decoration: none;
      font-size: 0.85rem;
    }

    .success-banner {
      background: #FEE2E2;
      border: 1px solid #FCA5A5;
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .s-icon { font-size: 1.75rem; color: #DC2626; }
    .s-body { flex: 1; }
    .s-title { color: #7F1D1D; font-size: 1rem; }
    .s-text { color: #991B1B; font-size: 0.85rem; }
    .btn-view-mvt {
      padding: 0.5rem 0.85rem;
      background: #B91C1C;
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.775rem;
    }

    .exit-layout-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .form-card, .summary-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
    }

    .exit-form { display: flex; flex-direction: column; gap: 1rem; }
    .field-group { display: flex; flex-direction: column; gap: 0.3rem; }
    .field-row { display: flex; gap: 1rem; }
    .field-label { font-size: 0.8rem; color: #475569; }
    
    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 0.6rem 0.85rem;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      font-size: 0.875rem;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: #C5A880;
    }

    .exceeded-alert {
      background: #FEE2E2;
      border: 1px solid #EF4444;
      color: #991B1B;
      padding: 0.75rem;
      border-radius: 10px;
      font-size: 0.825rem;
    }

    .btn-submit-exit {
      width: 100%;
      padding: 0.75rem;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      color: white;
      font-size: 0.95rem;
      cursor: pointer;
    }
    .btn-submit-exit:disabled { opacity: 0.5; cursor: not-allowed; }

    .summary-preview { display: flex; flex-direction: column; }
    .item-preview-head { display: flex; gap: 0.85rem; align-items: center; }
    .preview-img { width: 56px; height: 56px; border-radius: 12px; object-fit: cover; }

    .stock-calc-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .calc-row { display: flex; justify-content: space-between; font-size: 0.85rem; }

    @media (max-width: 900px) {
      .exit-layout-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class StockExitPageComponent implements OnInit {
  exitReq: StockExitRequest = {
    storeId: 1,
    productId: 101,
    quantity: 1,
    referenceNumber: '',
    reason: 'VENTE'
  };

  availableProducts: StockItem[] = [];
  selectedStockItem?: StockItem;
  lastExitResult?: StockItem;
  showConfirmModal: boolean = false;

  constructor(
    private stockService: StockService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.stockService.getStockProducts({ page: 1, pageSize: 100 }).subscribe(res => {
      this.availableProducts = res.items;

      this.route.queryParams.subscribe(params => {
        if (params['productId']) this.exitReq.productId = Number(params['productId']);
        if (params['storeId']) this.exitReq.storeId = Number(params['storeId']);
        this.exitReq.referenceNumber = `FAC-2026-0${Math.floor(Math.random() * 900) + 100}`;
        this.onStoreOrProductChange();
      });
    });
  }

  onStoreOrProductChange(): void {
    this.selectedStockItem = this.availableProducts.find(
      p => p.productId === this.exitReq.productId && p.storeId === this.exitReq.storeId
    ) || this.availableProducts[0];
  }

  get stockAfterOperation(): number {
    if (!this.selectedStockItem) return 0;
    return Math.max(0, this.selectedStockItem.currentStock - this.exitReq.quantity);
  }

  get isQuantityExceeded(): boolean {
    if (!this.selectedStockItem) return false;
    return this.exitReq.quantity > this.selectedStockItem.availableStock;
  }

  get isFormValid(): boolean {
    return !!(this.exitReq.productId && this.exitReq.storeId && this.exitReq.quantity > 0 && this.exitReq.referenceNumber.trim());
  }

  openConfirmModal(): void {
    if (this.isFormValid && !this.isQuantityExceeded) {
      this.showConfirmModal = true;
    }
  }

  confirmStockExit(): void {
    this.showConfirmModal = false;
    this.stockService.createStockExit(this.exitReq).subscribe(res => {
      this.lastExitResult = res;
    });
  }
}
