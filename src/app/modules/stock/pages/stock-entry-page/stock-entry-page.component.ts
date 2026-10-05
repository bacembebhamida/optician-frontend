import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StockService } from '../../services/stock.service';
import { StockEntryRequest, StockItem } from '../../models/stock.model';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-stock-entry-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmDialogComponent],
  template: `
    <div class="stock-entry-page font-sans animate-fade-in">
      
      <!-- Page Header -->
      <div class="page-header mb-6">
        <div>
          <h1 class="page-title font-bold text-2xl text-slate-900">
            <i class="fa-solid fa-square-plus text-emerald-600 mr-2"></i> Formulaire d'Entrée en Stock
          </h1>
          <p class="page-sub text-sm text-slate-500">Réception fournisseur, réapprovisionnement ou retour client dans l'inventaire.</p>
        </div>

        <a routerLink="/admin/stock/products" class="btn-back font-semibold">
          <i class="fa-solid fa-arrow-left mr-1"></i> Retour au Stock
        </a>
      </div>

      <!-- Success Confirmation Banner -->
      <div *ngIf="lastEntryResult" class="success-banner mb-6">
        <div class="s-icon">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <div class="s-body">
          <h3 class="s-title font-bold">Mouvement d'entrée enregistré avec succès !</h3>
          <p class="s-text">
            Nouveau stock actuel pour <strong>{{ lastEntryResult.productName }}</strong> ({{ lastEntryResult.storeName }}) : 
            <span class="font-mono font-bold text-slate-900">{{ lastEntryResult.currentStock }} unités</span>.
          </p>
        </div>
        <a routerLink="/admin/stock/movements" class="btn-view-mvt font-bold">
          Voir Historique
        </a>
      </div>

      <!-- Main Form & Summary Container -->
      <div class="entry-layout-grid">
        
        <!-- Left: Form -->
        <div class="form-card">
          <h2 class="card-title font-bold text-slate-800 mb-4 border-b pb-2">
            Informations de l'Entrée
          </h2>

          <form (ngSubmit)="openConfirmModal()" class="entry-form">
            
            <!-- Store Selection -->
            <div class="field-group">
              <label class="field-label font-semibold">Magasin Destination *</label>
              <select [(ngModel)]="entryReq.storeId" (change)="onStoreOrProductChange()" name="storeId" class="form-select" required>
                <option [ngValue]="1">Tunis Centre Flagship</option>
                <option [ngValue]="2">Sousse Centre Boutique</option>
                <option [ngValue]="3">Sfax Mall Branch</option>
              </select>
            </div>

            <!-- Product Selection -->
            <div class="field-group">
              <label class="field-label font-semibold">Produit / Référence *</label>
              <select [(ngModel)]="entryReq.productId" (change)="onStoreOrProductChange()" name="productId" class="form-select" required>
                <option *ngFor="let p of availableProducts" [ngValue]="p.productId">
                  {{ p.productName }} (SKU: {{ p.sku }})
                </option>
              </select>
            </div>

            <!-- Variant Option -->
            <div class="field-group">
              <label class="field-label font-semibold">Variante (Optionnel)</label>
              <input type="text" [(ngModel)]="entryReq.variantId" name="variantId" placeholder="Ex: Taille 53 - Noir Mat" class="form-input">
            </div>

            <!-- Quantity & Reference Number -->
            <div class="field-row">
              <div class="field-group flex-1">
                <label class="field-label font-semibold">Quantité à Ajouter *</label>
                <input type="number" [(ngModel)]="entryReq.quantity" min="1" name="quantity" class="form-input font-mono font-bold" required>
              </div>

              <div class="field-group flex-1">
                <label class="field-label font-semibold">Référence Bon de Livraison / Facture *</label>
                <input type="text" [(ngModel)]="entryReq.referenceNumber" name="referenceNumber" placeholder="Ex: BL-2026-0891" class="form-input font-mono" required>
              </div>
            </div>

            <!-- Reason & Supplier -->
            <div class="field-row">
              <div class="field-group flex-1">
                <label class="field-label font-semibold">Motif de l'Entrée *</label>
                <select [(ngModel)]="entryReq.reason" name="reason" class="form-select" required>
                  <option value="Réception Fournisseur">Réception Fournisseur</option>
                  <option value="Retour Client">Retour Client</option>
                  <option value="Ajustement Positif">Ajustement Positif</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div class="field-group flex-1">
                <label class="field-label font-semibold">Fournisseur</label>
                <input type="text" [(ngModel)]="entryReq.supplierName" name="supplierName" placeholder="Ex: Luxottica, Safilo..." class="form-input">
              </div>
            </div>

            <!-- Notes -->
            <div class="field-group">
              <label class="field-label font-semibold">Remarques / Notes internes</label>
              <textarea [(ngModel)]="entryReq.notes" name="notes" rows="2" placeholder="Observations..." class="form-textarea"></textarea>
            </div>

            <div class="form-actions mt-4">
              <button type="submit" [disabled]="!isFormValid" class="btn-submit-entry font-bold">
                <i class="fa-solid fa-check mr-1"></i> Vérifier &amp; Valider l'Entrée
              </button>
            </div>

          </form>
        </div>

        <!-- Right: Summary Before Validation -->
        <div class="summary-card">
          <h2 class="card-title font-bold text-slate-800 mb-4 border-b pb-2">
            Résumé Avant Validation
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

            <div class="stock-calc-box font-mono my-4">
              <div class="calc-row">
                <span class="c-label">Stock Actuel :</span>
                <span class="c-val font-bold text-slate-700">{{ selectedStockItem.currentStock }}</span>
              </div>
              <div class="calc-row text-emerald-600">
                <span class="c-label">Quantité Ajoutée :</span>
                <span class="c-val font-bold">+{{ entryReq.quantity }}</span>
              </div>
              <div class="calc-row total border-t pt-2 mt-2">
                <span class="c-label font-bold text-slate-900">Nouveau Stock Estimé :</span>
                <span class="c-val font-bold text-emerald-700 text-lg">{{ selectedStockItem.currentStock + entryReq.quantity }}</span>
              </div>
            </div>

            <div class="details-box text-xs text-slate-600">
              <p><strong>Référence :</strong> {{ entryReq.referenceNumber || 'Non renseignée' }}</p>
              <p><strong>Motif :</strong> {{ entryReq.reason }}</p>
              <p *ngIf="entryReq.supplierName"><strong>Fournisseur :</strong> {{ entryReq.supplierName }}</p>
            </div>

          </div>

          <div *ngIf="!selectedStockItem" class="empty-summary text-center text-slate-400 py-8">
            <i class="fa-solid fa-receipt text-3xl mb-2"></i>
            <p class="text-xs">Sélectionnez un magasin et un produit pour prévisualiser l'impact sur le stock.</p>
          </div>

        </div>

      </div>

      <!-- Confirmation Dialog Modal -->
      <app-confirm-dialog
        [isOpen]="showConfirmModal"
        title="Confirmation de l'Entrée de Stock"
        [message]="'Voulez-vous vraiment ajouter ' + entryReq.quantity + ' unité(s) pour ' + (selectedStockItem?.productName || '') + ' ?'"
        type="success"
        confirmText="Valider l'entrée"
        (onConfirm)="confirmStockEntry()"
        (onCancel)="showConfirmModal = false">
      </app-confirm-dialog>

    </div>
  `,
  styles: [`
    .stock-entry-page { padding: 1.5rem; }
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
      background: #DCFCE7;
      border: 1px solid #86EFAC;
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .s-icon { font-size: 1.75rem; color: #16A34A; }
    .s-body { flex: 1; }
    .s-title { color: #14532D; font-size: 1rem; }
    .s-text { color: #166534; font-size: 0.85rem; }
    .btn-view-mvt {
      padding: 0.5rem 0.85rem;
      background: #15803D;
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.775rem;
    }

    .entry-layout-grid {
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

    .entry-form { display: flex; flex-direction: column; gap: 1rem; }
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

    .btn-submit-entry {
      width: 100%;
      padding: 0.75rem;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      font-size: 0.95rem;
      cursor: pointer;
    }
    .btn-submit-entry:disabled { opacity: 0.5; cursor: not-allowed; }

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
      .entry-layout-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class StockEntryPageComponent implements OnInit {
  entryReq: StockEntryRequest = {
    storeId: 1,
    productId: 101,
    quantity: 1,
    referenceNumber: '',
    reason: 'Réception Fournisseur',
    supplierName: 'Luxottica'
  };

  availableProducts: StockItem[] = [];
  selectedStockItem?: StockItem;
  lastEntryResult?: StockItem;
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
        if (params['productId']) this.entryReq.productId = Number(params['productId']);
        if (params['storeId']) this.entryReq.storeId = Number(params['storeId']);
        this.entryReq.referenceNumber = `BL-2026-0${Math.floor(Math.random() * 900) + 100}`;
        this.onStoreOrProductChange();
      });
    });
  }

  onStoreOrProductChange(): void {
    this.selectedStockItem = this.availableProducts.find(
      p => p.productId === this.entryReq.productId && p.storeId === this.entryReq.storeId
    ) || this.availableProducts[0];
  }

  get isFormValid(): boolean {
    return !!(this.entryReq.productId && this.entryReq.storeId && this.entryReq.quantity > 0 && this.entryReq.referenceNumber.trim());
  }

  openConfirmModal(): void {
    if (this.isFormValid) {
      this.showConfirmModal = true;
    }
  }

  confirmStockEntry(): void {
    this.showConfirmModal = false;
    this.stockService.createStockEntry(this.entryReq).subscribe(res => {
      this.lastEntryResult = res;
    });
  }
}
