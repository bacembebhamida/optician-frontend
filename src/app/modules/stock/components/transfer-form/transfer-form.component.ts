import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateTransferRequest } from '../../models/transfer.model';
import { StockItem } from '../../models/stock.model';

export interface TransferDraftItem {
  productId: number;
  productName: string;
  sku: string;
  sourceAvailableStock: number;
  quantity: number;
}

@Component({
  selector: 'app-transfer-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="transfer-wizard font-sans">
      
      <!-- Wizard Step Pipeline Bar -->
      <div class="wizard-steps-bar">
        
        <div class="step-item" [class.active]="currentStep === 1" [class.completed]="currentStep > 1">
          <div class="step-num">1</div>
          <span class="step-title">Source</span>
        </div>

        <div class="step-line" [class.active]="currentStep > 1"></div>

        <div class="step-item" [class.active]="currentStep === 2" [class.completed]="currentStep > 2">
          <div class="step-num">2</div>
          <span class="step-title">Destination</span>
        </div>

        <div class="step-line" [class.active]="currentStep > 2"></div>

        <div class="step-item" [class.active]="currentStep === 3" [class.completed]="currentStep > 3">
          <div class="step-num">3</div>
          <span class="step-title">Produits</span>
        </div>

        <div class="step-line" [class.active]="currentStep > 3"></div>

        <div class="step-item" [class.active]="currentStep === 4" [class.completed]="currentStep === 4">
          <div class="step-num">4</div>
          <span class="step-title">Résumé</span>
        </div>

      </div>

      <!-- STEP 1: Source Store -->
      <div *ngIf="currentStep === 1" class="step-pane animate-fade-in">
        <h3 class="pane-title font-bold"><i class="fa-solid fa-store-slash text-amber-600"></i> Sélectionner le Magasin Source</h3>
        <p class="pane-sub">Sélectionnez la boutique qui fournira le stock.</p>

        <div class="stores-grid">
          <div 
            *ngFor="let s of stores" 
            (click)="selectSourceStore(s.id)" 
            [class.selected]="sourceStoreId === s.id" 
            class="store-choice-card">
            <i class="fa-solid fa-store store-icon"></i>
            <span class="store-name font-bold">{{ s.name }}</span>
            <span class="store-city">{{ s.city }}</span>
          </div>
        </div>

        <div class="pane-actions">
          <button (click)="onCancel.emit()" class="btn-cancel">Annuler</button>
          <button (click)="goToStep(2)" [disabled]="!sourceStoreId" class="btn-next font-bold">
            Suivant : Destination <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- STEP 2: Target Store -->
      <div *ngIf="currentStep === 2" class="step-pane animate-fade-in">
        <h3 class="pane-title font-bold"><i class="fa-solid fa-truck-ramp-box text-amber-600"></i> Sélectionner le Magasin Destination</h3>
        <p class="pane-sub">Sélectionnez la boutique qui recevra le stock.</p>

        <div class="stores-grid">
          <div 
            *ngFor="let s of stores" 
            (click)="selectTargetStore(s.id)" 
            [class.disabled]="s.id === sourceStoreId"
            [class.selected]="targetStoreId === s.id" 
            class="store-choice-card">
            <i class="fa-solid fa-location-dot store-icon"></i>
            <span class="store-name font-bold">{{ s.name }}</span>
            <span class="store-city">{{ s.city }}</span>
            <span *ngIf="s.id === sourceStoreId" class="same-store-tag">(Magasin Source)</span>
          </div>
        </div>

        <div class="pane-actions">
          <button (click)="goToStep(1)" class="btn-prev"><i class="fa-solid fa-arrow-left"></i> Retour</button>
          <button (click)="goToStep(3)" [disabled]="!targetStoreId || targetStoreId === sourceStoreId" class="btn-next font-bold">
            Suivant : Sélectionner Produits <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- STEP 3: Products & Quantities -->
      <div *ngIf="currentStep === 3" class="step-pane animate-fade-in">
        <h3 class="pane-title font-bold"><i class="fa-solid fa-boxes-stacked text-amber-600"></i> Ajouter les Produits au Transfert</h3>
        <p class="pane-sub">Choisissez les articles et spécifiez les quantités à transférer depuis {{ getStoreName(sourceStoreId) }}.</p>

        <!-- Product Selector Box -->
        <div class="add-item-bar">
          <select [(ngModel)]="selectedProductId" class="product-select">
            <option [ngValue]="null">-- Sélectionner une référence disponible --</option>
            <option *ngFor="let p of availableSourceStockItems" [ngValue]="p.productId">
              {{ p.productName }} (SKU: {{ p.sku }} - Disponible: {{ p.availableStock }})
            </option>
          </select>
          <input type="number" [(ngModel)]="selectedQuantity" min="1" placeholder="Qté" class="qty-input">
          <button (click)="addItemToDraft()" [disabled]="!selectedProductId || selectedQuantity < 1" class="btn-add-item font-bold">
            <i class="fa-solid fa-plus"></i> Ajouter
          </button>
        </div>

        <!-- Draft Items Table -->
        <div class="draft-items-table-wrap">
          <table class="draft-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>SKU</th>
                <th class="text-center">Disp. Source</th>
                <th class="text-center">Quantité à Transferer</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of draftItems; let i = index">
                <td class="font-bold">{{ item.productName }}</td>
                <td class="font-mono text-xs">{{ item.sku }}</td>
                <td class="text-center font-mono">{{ item.sourceAvailableStock }}</td>
                <td class="text-center">
                  <input type="number" [(ngModel)]="item.quantity" [max]="item.sourceAvailableStock" min="1" class="qty-table-input">
                </td>
                <td class="text-right">
                  <button (click)="removeItem(i)" class="btn-remove-item" title="Retirer"><i class="fa-solid fa-trash-can"></i></button>
                </td>
              </tr>
              <tr *ngIf="draftItems.length === 0">
                <td colspan="5" class="empty-cell text-center text-slate-400 py-6">Aucun produit ajouté au transfert.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pane-actions">
          <button (click)="goToStep(2)" class="btn-prev"><i class="fa-solid fa-arrow-left"></i> Retour</button>
          <button (click)="goToStep(4)" [disabled]="draftItems.length === 0" class="btn-next font-bold">
            Suivant : Résumé <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- STEP 4: Summary & Confirmation -->
      <div *ngIf="currentStep === 4" class="step-pane animate-fade-in">
        <h3 class="pane-title font-bold"><i class="fa-solid fa-clipboard-check text-amber-600"></i> Résumé &amp; Confirmation du Transfert</h3>
        <p class="pane-sub">Veuillez vérifier toutes les informations avant de créer le bon de transfert.</p>

        <div class="summary-card">
          
          <div class="summary-route-box">
            <div class="route-store">
              <span class="r-label">Magasin Source</span>
              <span class="r-name font-bold">{{ getStoreName(sourceStoreId) }}</span>
            </div>

            <div class="route-arrow">
              <i class="fa-solid fa-arrow-right-long text-amber-600 text-xl"></i>
            </div>

            <div class="route-store">
              <span class="r-label">Magasin Destination</span>
              <span class="r-name font-bold">{{ getStoreName(targetStoreId) }}</span>
            </div>
          </div>

          <div class="summary-items-list">
            <h4 class="font-bold text-slate-800 text-sm mb-2">Articles à expédier ({{ totalTransferQuantity }} unités au total) :</h4>
            <div *ngFor="let item of draftItems" class="summary-item-row">
              <span class="font-semibold">{{ item.productName }}</span>
              <span class="font-mono text-xs text-slate-500">SKU: {{ item.sku }}</span>
              <span class="font-mono font-bold text-amber-700">{{ item.quantity }} unité(s)</span>
            </div>
          </div>

          <div class="field-group mt-4">
            <label class="field-label font-bold text-slate-700">Notes / Motif du transfert (optionnel)</label>
            <textarea [(ngModel)]="transferNotes" rows="2" placeholder="Ex: Rééquilibrage stock de la saison..." class="notes-textarea"></textarea>
          </div>

        </div>

        <div class="pane-actions">
          <button (click)="goToStep(3)" class="btn-prev"><i class="fa-solid fa-arrow-left"></i> Retour</button>
          <button (click)="submitTransfer()" class="btn-submit-transfer font-bold">
            <i class="fa-solid fa-paper-plane mr-1"></i> Valider et Envoyer la Demande
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .transfer-wizard {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
    }

    .wizard-steps-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid #F1F5F9;
    }
    .step-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #94A3B8;
    }
    .step-item.active { color: #C5A880; }
    .step-item.completed { color: #0F172A; }
    .step-num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #F1F5F9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .step-item.active .step-num { background: #FEF3C7; color: #D97706; }
    .step-item.completed .step-num { background: #C5A880; color: #FFFFFF; }
    .step-title { font-size: 0.85rem; font-weight: 600; }

    .step-line {
      flex: 1;
      height: 2px;
      background: #E2E8F0;
      margin: 0 0.75rem;
    }
    .step-line.active { background: #C5A880; }

    .pane-title { font-size: 1.15rem; color: #0F172A; }
    .pane-sub { font-size: 0.85rem; color: #64748B; margin-bottom: 1.25rem; }

    .stores-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .store-choice-card {
      background: #F8FAFC;
      border: 2px solid #E2E8F0;
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .store-choice-card:hover { border-color: #CBD5E1; }
    .store-choice-card.selected { border-color: #C5A880; background: #FFFDF9; }
    .store-choice-card.disabled { opacity: 0.4; cursor: not-allowed; }
    .store-icon { font-size: 1.5rem; color: #C5A880; margin-bottom: 0.5rem; }
    .same-store-tag { font-size: 0.7rem; color: #EF4444; margin-top: 0.2rem; }

    .add-item-bar {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .product-select {
      flex: 1;
      padding: 0.6rem 0.85rem;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      font-size: 0.85rem;
    }
    .qty-input {
      width: 90px;
      padding: 0.6rem 0.85rem;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      font-size: 0.85rem;
    }
    .btn-add-item {
      padding: 0.6rem 1.1rem;
      background: #0F172A;
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
    }

    .draft-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;
    }
    .draft-table th {
      background: #F8FAFC;
      padding: 0.75rem 0.85rem;
      font-size: 0.75rem;
      color: #64748B;
      text-transform: uppercase;
    }
    .draft-table td {
      padding: 0.75rem 0.85rem;
      border-bottom: 1px solid #F1F5F9;
      font-size: 0.85rem;
    }
    .qty-table-input {
      width: 70px;
      padding: 0.3rem 0.5rem;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      text-align: center;
    }
    .btn-remove-item {
      background: none;
      border: none;
      color: #EF4444;
      cursor: pointer;
    }

    .summary-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .summary-route-box {
      display: flex;
      align-items: center;
      justify-content: space-around;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .route-store { display: flex; flex-direction: column; }
    .r-label { font-size: 0.725rem; color: #64748B; }

    .summary-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px dashed #E2E8F0;
      font-size: 0.85rem;
    }

    .notes-textarea {
      width: 100%;
      padding: 0.6rem;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      font-size: 0.85rem;
    }

    .pane-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #F1F5F9;
    }
    .btn-prev {
      padding: 0.6rem 1.1rem;
      border-radius: 10px;
      border: 1px solid #CBD5E1;
      background: white;
      cursor: pointer;
    }
    .btn-next {
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      border: none;
      background: #0F172A;
      color: white;
      cursor: pointer;
    }
    .btn-next:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-submit-transfer {
      padding: 0.65rem 1.4rem;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #C5A880 0%, #A3865E 100%);
      color: white;
      cursor: pointer;
    }
    .btn-cancel {
      padding: 0.6rem 1.1rem;
      border-radius: 10px;
      border: 1px solid #CBD5E1;
      background: white;
      color: #64748B;
      cursor: pointer;
    }
  `]
})
export class TransferFormComponent implements OnInit {
  @Input() initialStockItems: StockItem[] = [];
  @Output() onSubmit = new EventEmitter<CreateTransferRequest>();
  @Output() onCancel = new EventEmitter<void>();

  currentStep: number = 1;
  sourceStoreId?: number;
  targetStoreId?: number;

  stores = [
    { id: 1, name: 'Tunis Centre Flagship', city: 'Tunis' },
    { id: 2, name: 'Sousse Centre Boutique', city: 'Sousse' },
    { id: 3, name: 'Sfax Mall Branch', city: 'Sfax' }
  ];

  availableSourceStockItems: StockItem[] = [];
  selectedProductId: number | null = null;
  selectedQuantity: number = 1;
  draftItems: TransferDraftItem[] = [];
  transferNotes: string = '';

  ngOnInit(): void {}

  selectSourceStore(id: number): void {
    this.sourceStoreId = id;
    this.availableSourceStockItems = this.initialStockItems.filter(i => i.storeId === id && i.availableStock > 0);
  }

  selectTargetStore(id: number): void {
    if (id !== this.sourceStoreId) {
      this.targetStoreId = id;
    }
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  getStoreName(id?: number): string {
    return this.stores.find(s => s.id === id)?.name || `Magasin #${id}`;
  }

  addItemToDraft(): void {
    if (!this.selectedProductId) return;
    const found = this.availableSourceStockItems.find(i => i.productId === this.selectedProductId);
    if (!found) return;

    const existing = this.draftItems.find(i => i.productId === found.productId);
    if (existing) {
      existing.quantity = Math.min(found.availableStock, existing.quantity + this.selectedQuantity);
    } else {
      this.draftItems.push({
        productId: found.productId,
        productName: found.productName,
        sku: found.sku,
        sourceAvailableStock: found.availableStock,
        quantity: Math.min(found.availableStock, this.selectedQuantity)
      });
    }

    this.selectedProductId = null;
    this.selectedQuantity = 1;
  }

  removeItem(index: number): void {
    this.draftItems.splice(index, 1);
  }

  get totalTransferQuantity(): number {
    return this.draftItems.reduce((acc, curr) => acc + curr.quantity, 0);
  }

  submitTransfer(): void {
    if (!this.sourceStoreId || !this.targetStoreId || this.draftItems.length === 0) return;

    const req: CreateTransferRequest = {
      sourceStoreId: this.sourceStoreId,
      targetStoreId: this.targetStoreId,
      items: this.draftItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
      notes: this.transferNotes
    };

    this.onSubmit.emit(req);
  }
}
