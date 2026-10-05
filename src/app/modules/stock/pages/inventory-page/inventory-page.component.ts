import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { StockInventory, InventoryItemCount, CreateInventoryRequest } from '../../models/inventory.model';
import { InventoryTableComponent } from '../../components/inventory-table/inventory-table.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule, InventoryTableComponent, ConfirmDialogComponent],
  template: `
    <div class="inventory-page font-sans animate-fade-in">
      
      <!-- Page Header -->
      <div class="page-header mb-6">
        <div>
          <h1 class="page-title font-bold text-2xl text-slate-900">
            <i class="fa-solid fa-clipboard-check text-amber-600 mr-2"></i> Inventaires Physiques &amp; Audit
          </h1>
          <p class="page-sub text-sm text-slate-500">Comptage physique des lunettes et montures, calcul des écarts et régularisation du stock.</p>
        </div>

        <button *ngIf="!activeInventory" (click)="showNewModal = true" class="btn-new-inv font-bold">
          <i class="fa-solid fa-plus mr-1"></i> Démarrer une Session d'Inventaire
        </button>
      </div>

      <!-- Active Session Highlight Box -->
      <div *ngIf="activeInventory" class="active-session-banner mb-6">
        <div class="a-header">
          <div>
            <span class="active-badge font-mono font-bold"><span class="pulse-dot"></span> SESSION EN COURS</span>
            <h2 class="a-title font-bold text-xl text-slate-900 mt-1">{{ activeInventory.title || activeInventory.inventoryNumber }}</h2>
            <p class="a-sub text-xs text-slate-500">
              <i class="fa-solid fa-store"></i> {{ activeInventory.storeName }} • Ouvert le {{ activeInventory.startedAt | date:'dd/MM/yyyy HH:mm' }} par {{ activeInventory.performedBy }}
            </p>
          </div>

          <button (click)="openValidateConfirmModal()" class="btn-finish-session font-bold">
            <i class="fa-solid fa-check-double mr-1"></i> Clôturer &amp; Régulariser le Stock
          </button>
        </div>

        <!-- Inventory Physical Counting Table Component -->
        <div class="mt-4">
          <app-inventory-table
            [items]="activeInventory.items"
            (onSaveDraft)="saveDraft($event)"
            (onValidate)="openValidateConfirmModal()">
          </app-inventory-table>
        </div>
      </div>

      <!-- Past / Completed Inventories List -->
      <div class="past-inventories-card">
        <h3 class="card-title font-bold text-slate-800 p-4 border-b">
          Historique des Sessions d'Inventaire Clôturées
        </h3>

        <table class="inv-list-table">
          <thead>
            <tr>
              <th>Nom / Référence</th>
              <th>Magasin</th>
              <th>Date Début → Fin</th>
              <th class="text-center">Écart Unités Total</th>
              <th>Responsable</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let inv of inventoryHistory" class="inv-row">
              <td class="font-bold text-slate-900">{{ inv.inventoryNumber }}</td>
              <td class="text-sm font-semibold text-slate-700">{{ inv.storeName }}</td>
              <td class="font-mono text-xs text-slate-600">
                {{ inv.startedAt | date:'dd/MM/yyyy' }} {{ inv.completedAt ? ('→ ' + (inv.completedAt | date:'dd/MM/yyyy')) : '' }}
              </td>
              <td class="text-center font-mono font-bold" [class.text-emerald-600]="(inv.totalDifferenceUnits || 0) === 0" [class.text-red-600]="(inv.totalDifferenceUnits || 0) < 0">
                {{ (inv.totalDifferenceUnits || 0) > 0 ? '+' : '' }}{{ inv.totalDifferenceUnits || 0 }}
              </td>
              <td class="text-xs text-slate-700">{{ inv.performedBy }}</td>
              <td>
                <span class="status-badge" [class.sb-done]="inv.status==='COMPLETED'" [class.sb-inprog]="inv.status==='IN_PROGRESS'">
                  {{ inv.status === 'COMPLETED' ? 'Clôturé & Validé' : 'En Cours' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal to Create New Inventory Session -->
      <div *ngIf="showNewModal" class="modal-backdrop">
        <div class="modal-card animate-fade-in">
          <h3 class="font-bold text-lg text-slate-900 mb-2">Nouvelle Session d'Inventaire</h3>
          <p class="text-xs text-slate-500 mb-4">Initialisez le comptage physique pour une boutique spécifiée.</p>

          <div class="flex flex-col gap-3">
            <div>
              <label class="text-xs font-semibold text-slate-600">Intitulé de l'Inventaire *</label>
              <input type="text" [(ngModel)]="newReq.title" class="w-full p-2 border rounded-lg text-sm mt-1">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-600">Magasin Concerné *</label>
              <select [(ngModel)]="newReq.storeId" class="w-full p-2 border rounded-lg text-sm mt-1">
                <option [ngValue]="1">Tunis Centre Flagship</option>
                <option [ngValue]="2">Sousse Centre Boutique</option>
                <option [ngValue]="3">Sfax Mall Branch</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-600">Notes / Instructions</label>
              <textarea [(ngModel)]="newReq.notes" rows="2" class="w-full p-2 border rounded-lg text-sm mt-1"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <button (click)="showNewModal = false" class="px-4 py-2 border rounded-lg text-sm">Annuler</button>
            <button (click)="createNewInventory()" class="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold text-sm">
              Lancer le Comptage
            </button>
          </div>
        </div>
      </div>

      <!-- Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="showValidateModal"
        title="Validation & Clôture d'Inventaire"
        message="Êtes-vous sûr de vouloir valider cette session d'inventaire ? Les ajustements de stock nécessaires seront automatiquement générés."
        type="success"
        confirmText="Régulariser et Clôturer"
        (onConfirm)="validateActiveInventory()"
        (onCancel)="showValidateModal = false">
      </app-confirm-dialog>

    </div>
  `,
  styles: [`
    .inventory-page { padding: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }

    .btn-new-inv {
      padding: 0.65rem 1.25rem;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #FFFFFF;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .active-session-banner {
      background: #FFFFFF;
      border: 2px solid #C5A880;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 8px 24px rgba(197, 168, 128, 0.15);
    }
    .a-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .active-badge {
      background: #FEF3C7;
      color: #B45309;
      font-size: 0.7rem;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #D97706;
      box-shadow: 0 0 6px #D97706;
    }
    .btn-finish-session {
      padding: 0.65rem 1.25rem;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .past-inventories-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      overflow: hidden;
    }
    .inv-list-table { width: 100%; border-collapse: collapse; text-align: left; }
    .inv-list-table th {
      background: #F8FAFC;
      padding: 0.85rem 1rem;
      font-size: 0.75rem;
      color: #64748B;
      text-transform: uppercase;
      border-bottom: 1px solid #E2E8F0;
    }
    .inv-row { border-bottom: 1px solid #F1F5F9; }
    .inv-list-table td { padding: 0.9rem 1rem; font-size: 0.85rem; }

    .status-badge { padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.725rem; font-weight: 700; }
    .sb-done { background: #DCFCE7; color: #15803D; }
    .sb-inprog { background: #FEF3C7; color: #B45309; }

    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-card {
      background: white;
      padding: 1.5rem;
      border-radius: 20px;
      width: 100%;
      max-width: 440px;
    }
  `]
})
export class InventoryPageComponent implements OnInit {
  activeInventory?: StockInventory;
  inventoryHistory: StockInventory[] = [];

  showNewModal: boolean = false;
  showValidateModal: boolean = false;

  newReq: CreateInventoryRequest = {
    storeId: 1,
    title: 'Inventaire Trimestriel Tunis Flagship',
    categories: ['Lunettes de vue', 'Lunettes de soleil'],
    notes: 'Comptage physique des montures et verres'
  };

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadInventories();
  }

  loadInventories(): void {
    this.inventoryService.getInventories().subscribe(list => {
      this.activeInventory = list.find(i => i.status === 'IN_PROGRESS');
      this.inventoryHistory = list.filter(i => i.status === 'COMPLETED');
    });
  }

  createNewInventory(): void {
    this.showNewModal = false;
    this.inventoryService.createInventory(this.newReq).subscribe(inv => {
      this.activeInventory = inv;
      this.loadInventories();
    });
  }

  saveDraft(items: InventoryItemCount[]): void {
    if (this.activeInventory) {
      this.inventoryService.savePhysicalCounts(this.activeInventory.id, items).subscribe(updated => {
        this.activeInventory = updated;
      });
    }
  }

  openValidateConfirmModal(): void {
    this.showValidateModal = true;
  }

  validateActiveInventory(): void {
    this.showValidateModal = false;
    if (this.activeInventory) {
      this.inventoryService.validateInventory(this.activeInventory.id).subscribe(() => {
        this.activeInventory = undefined;
        this.loadInventories();
      });
    }
  }
}
