import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductVariant, ProductStatus } from '../../models/product.model';

@Component({
  selector: 'app-product-variants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="product-variants-manager">
      
      <div class="header-bar">
        <div>
          <h4 class="title"><i class="fa-solid fa-layer-group text-amber-600"></i> Variantes &amp; Déclinaisons ({{ variants.length }})</h4>
          <p class="subtitle">Gérez les couleurs, calibres/tailles, SKU et prix spécifiques par déclinaison.</p>
        </div>
        <button type="button" (click)="openAddModal()" class="btn-add-variant">
          <i class="fa-solid fa-plus"></i> Ajouter une variante
        </button>
      </div>

      <!-- Empty State -->
      <div *ngIf="variants.length === 0" class="empty-variants-box">
        <i class="fa-solid fa-tags text-slate-300 text-3xl mb-2 block"></i>
        <span class="text-sm font-bold text-slate-700 block">Aucune variante configurée pour ce produit</span>
        <span class="text-xs text-slate-500 block mb-3">Le produit fonctionnera avec sa référence SKU principale.</span>
        <button type="button" (click)="openAddModal()" class="btn-add-variant sm">
          + Créer la première variante
        </button>
      </div>

      <!-- Variants Table -->
      <div *ngIf="variants.length > 0" class="variants-table-wrap">
        <table class="variants-table">
          <thead>
            <tr>
              <th class="col-image">Image</th>
              <th>Couleur</th>
              <th>Taille / Calibre</th>
              <th>SKU Variante</th>
              <th>Code-Barres</th>
              <th>Prix (DT)</th>
              <th>Stock</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let v of variants; let i = index">

              <!-- Image du produit parent (ou pastille couleur) -->
              <td class="col-image">
                <img *ngIf="productImageUrl"
                     [src]="productImageUrl"
                     [alt]="v.colorName"
                     class="variant-thumb"
                     loading="lazy">
                <span *ngIf="!productImageUrl"
                      class="variant-thumb variant-thumb--swatch"
                      [style.background-color]="v.colorHex || '#111827'"></span>
              </td>
              
              <!-- Color Name & Color Swatch -->
              <td>
                <div class="color-cell">
                  <span class="color-swatch" [style.background-color]="v.colorHex || '#111827'"></span>
                  <span class="color-name">{{ v.colorName }}</span>
                </div>
              </td>

              <!-- Size -->
              <td class="font-mono font-bold">{{ v.size }}</td>

              <!-- SKU -->
              <td class="font-mono text-xs text-slate-700">{{ v.sku }}</td>

              <!-- Barcode -->
              <td class="font-mono text-xs text-slate-500"><i class="fa-solid fa-barcode"></i> {{ v.barcode }}</td>

              <!-- Price TND -->
              <td class="font-mono font-bold text-slate-900">{{ v.priceTnd | number:'1.3-3' }} DT</td>

              <!-- Stock disponible -->
              <td class="col-stock">
                <span class="stock-qty" [ngClass]="getStockClass(v.stockQuantity)">
                  <i class="fa-solid fa-cubes"></i> {{ v.stockQuantity || 0 }}
                </span>
              </td>

              <!-- Status -->
              <td>
                <span class="status-chip" [ngClass]="v.status.toLowerCase()">{{ v.status }}</span>
              </td>

              <!-- Actions -->
              <td>
                <div class="act-btns">
                  <button type="button" (click)="openEditModal(v, i)" class="btn-icon edit" title="Modifier">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button type="button" (click)="removeVariant(i)" class="btn-icon delete" title="Supprimer">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add / Edit Modal -->
      <div *ngIf="showModal" class="modal-overlay animate-fade-in" (click)="closeModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          
          <div class="modal-header">
            <h3>{{ editingIndex !== null ? 'Modifier la variante' : 'Nouvelle variante produit' }}</h3>
            <button (click)="closeModal()" class="close-btn"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div class="modal-body form-grid">
            <div class="field-group">
              <label class="field-label">Nom de la couleur *</label>
              <input type="text" [(ngModel)]="activeVariant.colorName" placeholder="Ex: Écaille Havane" class="modal-input" required>
            </div>

            <div class="field-group">
              <label class="field-label">Couleur Hex / Pastel *</label>
              <div class="color-input-row">
                <input type="color" [(ngModel)]="activeVariant.colorHex" class="color-picker-input">
                <input type="text" [(ngModel)]="activeVariant.colorHex" placeholder="#78350F" class="modal-input">
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Taille / Calibre (Ex: 52-18-140) *</label>
              <input type="text" [(ngModel)]="activeVariant.size" placeholder="52-18-140" class="modal-input" required>
            </div>

            <div class="field-group">
              <label class="field-label">SKU de la variante *</label>
              <input type="text" [(ngModel)]="activeVariant.sku" placeholder="RB-5228-HAV-52" class="modal-input" required>
            </div>

            <div class="field-group">
              <label class="field-label">Code-Barres EAN-13 *</label>
              <input type="text" [(ngModel)]="activeVariant.barcode" placeholder="805289307890" class="modal-input" required>
            </div>

            <div class="field-group">
              <label class="field-label">Prix de vente (DT) *</label>
              <input type="number" [(ngModel)]="activeVariant.priceTnd" placeholder="470.000" step="0.001" class="modal-input" required>
            </div>

            <div class="field-group">
              <label class="field-label">Statut</label>
              <select [(ngModel)]="activeVariant.status" class="modal-select">
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
                <option value="BROUILLON">Brouillon</option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" (click)="closeModal()" class="btn-cancel">Annuler</button>
            <button type="button" (click)="saveVariant()" class="btn-save">
              <i class="fa-solid fa-floppy-disk"></i> Enregistrer la variante
            </button>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .product-variants-manager {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .title {
      font-size: 1rem;
      font-weight: 700;
      color: #111827;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .title i { color: #C5A880; font-size: 0.95rem; }
    .count-badge {
      background: #F3F4F6;
      color: #374151;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.1rem 0.5rem;
      border-radius: 99px;
      font-family: inherit;
    }
    .subtitle {
      font-size: 0.8rem;
      color: #6B7280;
      margin-top: 0.2rem;
    }
    .btn-add-variant {
      background: #111827;
      color: #FFFFFF;
      padding: 0.55rem 1.1rem;
      border-radius: 10px;
      border: none;
      font-size: 0.825rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: background 0.15s;
    }
    .btn-add-variant:hover { background: #1F2937; }
    .btn-add-variant.sm {
      padding: 0.4rem 0.85rem;
      font-size: 0.775rem;
    }

    /* Info Banner */
    .info-banner {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 10px;
    }
    .info-banner__icon {
      color: #2563EB;
      font-size: 0.9rem;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    .info-banner__text {
      font-size: 0.8rem;
      color: #1E40AF;
      line-height: 1.6;
    }
    .info-banner__text strong { font-weight: 700; display: block; margin-bottom: 0.25rem; color: #1D4ED8; }
    .info-banner__text em { font-style: normal; font-weight: 600; color: #1E40AF; }

    .empty-variants-box {
      background: #F9FAFB;
      border: 1px dashed #D1D5DB;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
    }

    /* Table Stock column */
    .col-stock { color: #374151; }
    .col-image { width: 56px; }
    .variant-thumb {
      width: 38px;
      height: 38px;
      border-radius: 9px;
      object-fit: cover;
      border: 1px solid #E2E8F0;
      background: #F8FAFC;
      display: block;
    }
    .variant-thumb--swatch { border-color: rgba(15,23,42,0.15); }
    .stock-qty {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.775rem;
      font-weight: 700;
      padding: 0.2rem 0.625rem;
      border-radius: 99px;
    }
    .stock-qty--ok    { background: #ECFDF5; color: #059669; }
    .stock-qty--low   { background: #FFFBEB; color: #D97706; }
    .stock-qty--zero  { background: #FEF2F2; color: #DC2626; }

    .variants-table-wrap {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      overflow: hidden;
    }
    .variants-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.825rem;
    }
    .variants-table th {
      background: #F8FAFC;
      color: #475569;
      font-weight: 700;
      font-size: 0.725rem;
      text-transform: uppercase;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #E2E8F0;
    }
    .variants-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #F1F5F9;
      vertical-align: middle;
    }

    .color-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .color-swatch {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1px solid rgba(0,0,0,0.15);
      flex-shrink: 0;
    }
    .color-name {
      font-weight: 700;
      color: #0F172A;
    }

    .status-chip {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      text-transform: uppercase;
    }
    .status-chip.actif { background: #D1FAE5; color: #065F46; }
    .status-chip.inactif { background: #FEE2E2; color: #991B1B; }

    .act-btns {
      display: flex;
      gap: 0.35rem;
    }
    .btn-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: 1px solid #E2E8F0;
      background: #FFFFFF;
      font-size: 0.75rem;
      cursor: pointer;
    }
    .btn-icon.edit:hover { background: #FEF3C7; color: #D97706; }
    .btn-icon.delete:hover { background: #FEE2E2; color: #DC2626; }

    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-card {
      background: #FFFFFF;
      border-radius: 20px;
      width: 100%;
      max-width: 520px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #F1F5F9;
    }
    .modal-header h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0F172A;
    }
    .close-btn { background: transparent; border: none; font-size: 1rem; color: #94A3B8; cursor: pointer; }
    .modal-body { padding: 1.25rem 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-label { font-size: 0.75rem; font-weight: 700; color: #475569; }
    .modal-input, .modal-select { padding: 0.55rem 0.85rem; font-size: 0.85rem; border: 1px solid #E5E7EB; border-radius: 10px; outline: none; background: #F9FAFB; transition: border-color 0.2s; }
    .modal-input:focus { border-color: #C5A880; background: #FFFFFF; }
    .color-input-row { display: flex; gap: 0.5rem; align-items: center; }
    .color-picker-input { width: 38px; height: 38px; border: none; border-radius: 8px; cursor: pointer; }

    /* Stock field highlight */
    .stock-field { grid-column: span 2; }
    .modal-input--stock {
      font-size: 1.05rem;
      font-weight: 700;
      border-color: #BFDBFE;
      background: #EFF6FF;
      color: #1D4ED8;
    }
    .modal-input--stock:focus { border-color: #2563EB; background: #FFFFFF; color: #111827; }
    .field-hint {
      font-size: 0.72rem;
      color: #6B7280;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      margin-top: 0.25rem;
    }
    .field-hint i { color: #93C5FD; font-size: 0.65rem; }

    .modal-footer { padding: 1rem 1.5rem; background: #F8FAFC; border-top: 1px solid #F1F5F9; display: flex; justify-content: flex-end; gap: 0.75rem; }
    .btn-cancel { padding: 0.6rem 1.2rem; font-size: 0.85rem; font-weight: 600; color: #475569; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 10px; cursor: pointer; }
    .btn-save { padding: 0.6rem 1.35rem; font-size: 0.85rem; font-weight: 700; color: #FFFFFF; background: #C5A880; border: none; border-radius: 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; }
  `]
})
export class ProductVariantsComponent {
  @Input() variants: ProductVariant[] = [];
  /** Visuel du produit parent, affiché dans la colonne « Image » */
  @Input() productImageUrl?: string;
  @Output() variantsChange = new EventEmitter<ProductVariant[]>();

  showModal: boolean = false;
  editingIndex: number | null = null;

  activeVariant: Partial<ProductVariant> = {
    colorName: '',
    colorHex: '#111827',
    size: '52-18-140',
    sku: '',
    barcode: '',
    priceTnd: 0,
    status: 'ACTIF'
  };

  openAddModal(): void {
    this.editingIndex = null;
    this.activeVariant = {
      colorName: 'Noir Mat',
      colorHex: '#111827',
      size: '52-18-140',
      sku: `VAR-${Date.now().toString().slice(-6)}`,
      barcode: '805289307000',
      priceTnd: 450.000,
      stockQuantity: 0,
      status: 'ACTIF'
    };
    this.showModal = true;
  }

  openEditModal(variant: ProductVariant, index: number): void {
    this.editingIndex = index;
    this.activeVariant = { ...variant };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveVariant(): void {
    if (!this.activeVariant.colorName || !this.activeVariant.sku || !this.activeVariant.barcode) return;

    const variantData: ProductVariant = {
      id: this.activeVariant.id || `var-${Date.now()}`,
      sku: this.activeVariant.sku,
      barcode: this.activeVariant.barcode,
      colorName: this.activeVariant.colorName,
      colorHex: this.activeVariant.colorHex || '#111827',
      size: this.activeVariant.size || '52-18-140',
      priceTnd: this.activeVariant.priceTnd || 0,
      stockQuantity: this.activeVariant.stockQuantity ?? 0,
      status: this.activeVariant.status || 'ACTIF'
    };

    const updated = [...this.variants];
    if (this.editingIndex !== null) {
      updated[this.editingIndex] = variantData;
    } else {
      updated.push(variantData);
    }

    this.variants = updated;
    this.variantsChange.emit(this.variants);
    this.closeModal();
  }

  removeVariant(index: number): void {
    this.variants = this.variants.filter((_, i) => i !== index);
    this.variantsChange.emit(this.variants);
  }

  getStockClass(qty?: number): string {
    if (!qty || qty === 0) return 'stock-qty--zero';
    if (qty < 3) return 'stock-qty--low';
    return 'stock-qty--ok';
  }
}
