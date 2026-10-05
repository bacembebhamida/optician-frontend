import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StockTransferService } from '../../services/stock-transfer.service';
import { StockTransfer, TransferStatus } from '../../models/transfer.model';
import { HasStockPermissionDirective } from '../../directives/has-stock-permission.directive';

@Component({
  selector: 'app-stock-transfer-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, HasStockPermissionDirective],
  template: `
    <div class="transfer-detail-page font-sans animate-fade-in" *ngIf="transfer">
      
      <!-- Page Header -->
      <div class="page-header mb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <a routerLink="/admin/stock/transfers" class="text-xs text-slate-500 hover:text-slate-800">
              <i class="fa-solid fa-arrow-left"></i> Transferts
            </a>
            <span class="text-xs text-slate-400">/</span>
            <span class="text-xs font-mono font-bold text-amber-700">#{{ transfer.transferNumber }}</span>
          </div>

          <h1 class="page-title font-bold text-2xl text-slate-900">
            Fiche Bon de Transfert : {{ transfer.transferNumber }}
          </h1>
        </div>

        <!-- Status Workflow Actions Bar -->
        <div class="status-actions-bar" *appHasStockPermission="'STOCK_TRANSFER'">
          
          <button 
            *ngIf="transfer.status === 'REQUESTED'" 
            (click)="updateStatus('APPROVED')" 
            class="btn-act btn-approve font-bold">
            <i class="fa-solid fa-thumbs-up"></i> Approuver
          </button>

          <button 
            *ngIf="transfer.status === 'APPROVED'" 
            (click)="updateStatus('IN_TRANSIT')" 
            class="btn-act btn-transit font-bold">
            <i class="fa-solid fa-truck"></i> Expédier / Marquer en Transit
          </button>

          <button 
            *ngIf="transfer.status === 'IN_TRANSIT'" 
            (click)="updateStatus('RECEIVED')" 
            class="btn-act btn-receive font-bold">
            <i class="fa-solid fa-circle-check"></i> Confirmer Réception
          </button>

          <button 
            *ngIf="transfer.status !== 'RECEIVED' && transfer.status !== 'CANCELLED'" 
            (click)="updateStatus('CANCELLED')" 
            class="btn-act btn-cancel font-semibold">
            <i class="fa-solid fa-ban"></i> Annuler Transfert
          </button>

        </div>
      </div>

      <!-- Workflow Timeline Status Bar -->
      <div class="timeline-card mb-6">
        <div class="timeline-steps">
          
          <div class="t-step" [class.done]="isStepPassed('REQUESTED')" [class.current]="transfer.status === 'REQUESTED'">
            <div class="t-dot"><i class="fa-solid fa-paper-plane"></i></div>
            <span class="t-label font-bold">Demandé</span>
          </div>

          <div class="t-line" [class.done]="isStepPassed('APPROVED')"></div>

          <div class="t-step" [class.done]="isStepPassed('APPROVED')" [class.current]="transfer.status === 'APPROVED'">
            <div class="t-dot"><i class="fa-solid fa-clipboard-check"></i></div>
            <span class="t-label font-bold">Approuvé</span>
          </div>

          <div class="t-line" [class.done]="isStepPassed('IN_TRANSIT')"></div>

          <div class="t-step" [class.done]="isStepPassed('IN_TRANSIT')" [class.current]="transfer.status === 'IN_TRANSIT'">
            <div class="t-dot"><i class="fa-solid fa-truck-fast"></i></div>
            <span class="t-label font-bold">En Transit</span>
          </div>

          <div class="t-line" [class.done]="isStepPassed('RECEIVED')"></div>

          <div class="t-step" [class.done]="isStepPassed('RECEIVED')" [class.current]="transfer.status === 'RECEIVED'">
            <div class="t-dot"><i class="fa-solid fa-boxes-packing"></i></div>
            <span class="t-label font-bold">Réceptionné</span>
          </div>

        </div>
      </div>

      <!-- Main Info & Items Grid -->
      <div class="detail-grid">
        
        <!-- Left: Items List -->
        <div class="items-card">
          <h3 class="card-title font-bold text-slate-800 mb-4 border-b pb-2">
            Articles Inclus dans le Bon de Transfert ({{ transfer.totalQuantity }} unités)
          </h3>

          <table class="items-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>SKU / Barcode</th>
                <th class="text-center">Quantité à Transférer</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of transfer.items">
                <td>
                  <span class="font-bold text-slate-900 block">{{ item.productName }}</span>
                </td>
                <td class="font-mono text-xs">
                  <span class="block text-slate-700">{{ item.sku }}</span>
                  <span class="text-slate-400">{{ item.barcode }}</span>
                </td>
                <td class="text-center font-mono font-bold text-amber-700 text-base">
                  {{ item.quantity }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Right: Routing & Metadata Box -->
        <div class="info-card">
          <h3 class="card-title font-bold text-slate-800 mb-4 border-b pb-2">
            Détails de l'Expédition
          </h3>

          <div class="route-box mb-4">
            <div class="r-store">
              <span class="r-tag font-semibold text-xs text-slate-500">Magasin Source</span>
              <span class="r-name font-bold text-slate-900">{{ transfer.sourceStoreName }}</span>
            </div>

            <div class="r-icon text-amber-600 text-xl py-2">
              <i class="fa-solid fa-arrow-down"></i>
            </div>

            <div class="r-store">
              <span class="r-tag font-semibold text-xs text-slate-500">Magasin Destination</span>
              <span class="r-name font-bold text-slate-900">{{ transfer.targetStoreName }}</span>
            </div>
          </div>

          <div class="meta-list text-xs text-slate-600">
            <p><strong>Statut :</strong> <span class="font-bold text-slate-900">{{ transfer.status }}</span></p>
            <p><strong>Créé par :</strong> {{ transfer.createdBy }}</p>
            <p><strong>Date de création :</strong> {{ transfer.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
            <p><strong>Dernière mise à jour :</strong> {{ transfer.updatedAt | date:'dd/MM/yyyy HH:mm' }}</p>
            <p *ngIf="transfer.notes" class="mt-2 text-slate-700 italic"><strong>Notes :</strong> {{ transfer.notes }}</p>
          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    .transfer-detail-page { padding: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; }

    .status-actions-bar { display: flex; gap: 0.6rem; }
    .btn-act {
      padding: 0.55rem 1rem;
      border-radius: 10px;
      border: none;
      font-size: 0.825rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-approve { background: #3B82F6; color: white; }
    .btn-transit { background: #8B5CF6; color: white; }
    .btn-receive { background: #10B981; color: white; }
    .btn-cancel { background: #F1F5F9; color: #EF4444; border: 1px solid #FCA5A5; }

    .timeline-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
    }
    .timeline-steps { display: flex; align-items: center; justify-content: space-around; }
    .t-step { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; color: #94A3B8; }
    .t-step.done { color: #0F172A; }
    .t-step.current { color: #C5A880; }
    .t-dot {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #F1F5F9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }
    .t-step.done .t-dot { background: #C5A880; color: white; }
    .t-step.current .t-dot { background: #FEF3C7; color: #D97706; border: 2px solid #F59E0B; }
    .t-line { flex: 1; height: 3px; background: #E2E8F0; margin: 0 1rem; }
    .t-line.done { background: #C5A880; }

    .detail-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
    .items-card, .info-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
    }

    .items-table { width: 100%; border-collapse: collapse; text-align: left; }
    .items-table th {
      background: #F8FAFC;
      padding: 0.75rem 0.85rem;
      font-size: 0.75rem;
      color: #64748B;
      text-transform: uppercase;
    }
    .items-table td { padding: 0.75rem 0.85rem; border-bottom: 1px solid #F1F5F9; font-size: 0.85rem; }

    .route-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 1rem;
      text-align: center;
    }

    @media (max-width: 900px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class StockTransferDetailPageComponent implements OnInit {
  transfer?: StockTransfer;

  constructor(
    private route: ActivatedRoute,
    private transferService: StockTransferService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (id) {
        this.transferService.getTransferById(id).subscribe(t => this.transfer = t);
      }
    });
  }

  isStepPassed(step: TransferStatus): boolean {
    if (!this.transfer) return false;
    const order: TransferStatus[] = ['DRAFT', 'REQUESTED', 'APPROVED', 'IN_TRANSIT', 'RECEIVED'];
    return order.indexOf(this.transfer.status) >= order.indexOf(step);
  }

  updateStatus(newStatus: TransferStatus): void {
    if (this.transfer) {
      this.transferService.updateTransferStatus(this.transfer.id, newStatus).subscribe(updated => {
        this.transfer = updated;
      });
    }
  }
}
