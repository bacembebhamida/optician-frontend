import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../products/services/notification.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

export interface ReplenishmentSuggestion {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  barcode: string;
  storeName: string;
  currentStock: number;
  threshold: number;
  recommendedQuantity: number;
  supplierName: string;
  unitCostTnd: number;
  selected: boolean;
}

const MOCK_REPLENISHMENTS: ReplenishmentSuggestion[] = [
  {
    id: 1,
    productId: 103,
    productName: 'Ray-Ban Aviator Classic Gold Polarized',
    sku: 'RB-3025-001-58',
    barcode: '805289004829',
    storeName: 'Sousse Centre Boutique',
    currentStock: 0,
    threshold: 4,
    recommendedQuantity: 10,
    supplierName: 'EssilorLuxottica International',
    unitCostTnd: 280,
    selected: true
  },
  {
    id: 2,
    productId: 102,
    productName: 'Tom Ford FT5634 Titanium Luxury',
    sku: 'TF-5634-001-52',
    barcode: '889214051240',
    storeName: 'Tunis Centre Flagship',
    currentStock: 3,
    threshold: 5,
    recommendedQuantity: 6,
    supplierName: 'Marcolin Eyewear Tunisia',
    unitCostTnd: 410,
    selected: true
  },
  {
    id: 3,
    productId: 106,
    productName: 'Oakley Holbrook Matte Black Prizm',
    sku: 'OK-9102-0155',
    barcode: '888392110482',
    storeName: 'Sfax Mall Branch',
    currentStock: 1,
    threshold: 3,
    recommendedQuantity: 8,
    supplierName: 'EssilorLuxottica International',
    unitCostTnd: 220,
    selected: false
  }
];

@Component({
  selector: 'app-stock-replenishment-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="replenishment-page font-sans animate-fade-in p-6">
      
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">
            <i class="fa-solid fa-arrows-spin text-amber-600 mr-2"></i> Suggestions de Réapprovisionnement Automatise
          </h1>
          <p class="text-sm text-slate-500">Calcul intelligent basé sur les seuils d'alerte, l'historique des ventes et les délais fournisseurs.</p>
        </div>

        <button 
          (click)="openConfirmModal()" 
          [disabled]="getSelectedCount() === 0"
          class="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow disabled:opacity-50">
          <i class="fa-solid fa-cart-flatbed mr-1"></i> Préparer Commande ({{ getSelectedCount() }})
        </button>
      </div>

      <!-- KPI Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white p-4 border border-slate-200 rounded-2xl">
          <span class="text-xs font-bold text-slate-500 uppercase">Articles en Alerte Réappro</span>
          <div class="text-2xl font-bold text-slate-900 mt-1">{{ suggestions.length }} Références</div>
        </div>

        <div class="bg-white p-4 border border-slate-200 rounded-2xl">
          <span class="text-xs font-bold text-slate-500 uppercase">Total Unités Recommandées</span>
          <div class="text-2xl font-bold text-amber-700 mt-1">{{ getTotalRecommendedUnits() }} Unités</div>
        </div>

        <div class="bg-white p-4 border border-slate-200 rounded-2xl">
          <span class="text-xs font-bold text-slate-500 uppercase">Budget Estimé Commande</span>
          <div class="text-2xl font-bold text-emerald-600 mt-1">{{ getTotalEstimatedCost() | number:'1.3-3' }} <small class="text-xs">DT</small></div>
        </div>
      </div>

      <!-- Suggestions Table -->
      <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase">
              <th class="p-3 w-10 text-center">
                <input type="checkbox" (change)="toggleAll($event)" [checked]="isAllSelected()">
              </th>
              <th class="p-3">Produit &amp; SKU</th>
              <th class="p-3">Boutique</th>
              <th class="p-3 text-center">Stock Actuel / Seuil</th>
              <th class="p-3 text-center">Qté Recommandée</th>
              <th class="p-3">Fournisseur Attribué</th>
              <th class="p-3 text-right">Coût Est. (DT)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of suggestions" class="border-b border-slate-100 hover:bg-slate-50">
              <td class="p-3 text-center">
                <input type="checkbox" [(ngModel)]="item.selected">
              </td>
              <td class="p-3">
                <span class="font-bold text-slate-900 block">{{ item.productName }}</span>
                <span class="text-xs font-mono text-slate-400">SKU: {{ item.sku }} • EAN: {{ item.barcode }}</span>
              </td>
              <td class="p-3 font-semibold text-slate-700 text-xs">
                <i class="fa-solid fa-store text-slate-400 mr-1"></i> {{ item.storeName }}
              </td>
              <td class="p-3 text-center font-mono">
                <span class="px-2 py-0.5 rounded font-bold text-xs" [class.bg-red-100]="item.currentStock === 0" [class.text-red-700]="item.currentStock === 0" [class.bg-amber-100]="item.currentStock > 0" [class.text-amber-800]="item.currentStock > 0">
                  {{ item.currentStock }}
                </span>
                <span class="text-xs text-slate-400 mx-1">/</span>
                <span class="text-xs text-slate-600">{{ item.threshold }}</span>
              </td>
              <td class="p-3 text-center">
                <input 
                  type="number" 
                  min="1" 
                  [(ngModel)]="item.recommendedQuantity" 
                  class="w-20 p-1 text-center font-mono font-bold border border-slate-300 rounded-lg text-sm">
              </td>
              <td class="p-3 text-xs font-semibold text-slate-800">
                {{ item.supplierName }}
              </td>
              <td class="p-3 text-right font-mono font-bold text-slate-900">
                {{ (item.recommendedQuantity * item.unitCostTnd) | number:'1.3-3' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Confirmation Modal -->
      <app-confirm-dialog
        [isOpen]="showModal"
        title="Confirmation Réapprovisionnement"
        [message]="'Êtes-vous sûr de vouloir générer la pré-commande fournisseur pour ' + getSelectedCount() + ' références (Budget Est. ' + (getSelectedCost() | number:'1.3-3') + ' DT) ?'"
        type="info"
        confirmText="Générer le Bon de Commande"
        (onConfirm)="confirmReplenishment()"
        (onCancel)="showModal = false">
      </app-confirm-dialog>

    </div>
  `,
  styles: [`
    .replenishment-page { min-height: 100vh; background: #F8FAFC; }
  `]
})
export class StockReplenishmentPageComponent implements OnInit {
  suggestions: ReplenishmentSuggestion[] = MOCK_REPLENISHMENTS;
  showModal: boolean = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {}

  getSelectedCount(): number {
    return this.suggestions.filter(s => s.selected).length;
  }

  getTotalRecommendedUnits(): number {
    return this.suggestions.reduce((acc, curr) => acc + curr.recommendedQuantity, 0);
  }

  getTotalEstimatedCost(): number {
    return this.suggestions.reduce((acc, curr) => acc + (curr.recommendedQuantity * curr.unitCostTnd), 0);
  }

  getSelectedCost(): number {
    return this.suggestions.filter(s => s.selected).reduce((acc, curr) => acc + (curr.recommendedQuantity * curr.unitCostTnd), 0);
  }

  isAllSelected(): boolean {
    return this.suggestions.length > 0 && this.suggestions.every(s => s.selected);
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.suggestions.forEach(s => s.selected = checked);
  }

  openConfirmModal(): void {
    this.showModal = true;
  }

  confirmReplenishment(): void {
    this.showModal = false;
    this.notificationService.success('Commande Générée', `Bon de commande réapprovisionnement créé avec succès pour ${this.getSelectedCount()} articles.`);
  }
}
