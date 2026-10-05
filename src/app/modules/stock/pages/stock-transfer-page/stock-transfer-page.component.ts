import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { StockTransferService } from '../../services/stock-transfer.service';
import { StockTransfer, TransferStatus, CreateTransferRequest } from '../../models/transfer.model';
import { TransferFormComponent } from '../../components/transfer-form/transfer-form.component';
import { StockService } from '../../services/stock.service';
import { StockItem } from '../../models/stock.model';

@Component({
  selector: 'app-stock-transfer-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TransferFormComponent],
  template: `
    <div class="transfers-page font-sans animate-fade-in">
      
      <!-- Page Header -->
      <div class="page-header mb-6">
        <div>
          <h1 class="page-title font-bold text-2xl text-slate-900">
            <i class="fa-solid fa-truck-ramp-box text-amber-600 mr-2"></i> Transferts Inter-magasins
          </h1>
          <p class="page-sub text-sm text-slate-500">Gestion et suivi des rééquilibrages de stock entre boutiques OptiVision.</p>
        </div>

        <button (click)="showTransferWizard = true" class="btn-new-transfer font-bold">
          <i class="fa-solid fa-plus mr-1"></i> Nouveau Transfert
        </button>
      </div>

      <!-- Transfer Wizard Collapsible Card / Modal -->
      <div *ngIf="showTransferWizard" class="mb-6">
        <app-transfer-form
          [initialStockItems]="allStockItems"
          (onSubmit)="onTransferCreated($event)"
          (onCancel)="showTransferWizard = false">
        </app-transfer-form>
      </div>

      <!-- Transfers List Table -->
      <div class="transfers-table-card">
        
        <table class="transfers-table">
          <thead>
            <tr>
              <th>N° Bon Transfert</th>
              <th>Magasin Source</th>
              <th>Magasin Destination</th>
              <th>Statut Workflow</th>
              <th class="text-center">Total Articles</th>
              <th>Créé par / Date</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of transfers" class="t-row">
              
              <!-- Transfer Number -->
              <td class="font-mono font-bold text-slate-900">
                <a [routerLink]="['/admin/stock/transfers', t.id]" class="t-num-link">
                  {{ t.transferNumber }}
                </a>
              </td>

              <!-- Source -->
              <td class="text-sm font-semibold text-slate-700">
                <i class="fa-solid fa-store text-slate-400 mr-1"></i> {{ t.sourceStoreName }}
              </td>

              <!-- Destination -->
              <td class="text-sm font-semibold text-slate-700">
                <i class="fa-solid fa-location-dot text-slate-400 mr-1"></i> {{ t.targetStoreName }}
              </td>

              <!-- Status Badge -->
              <td>
                <span class="status-badge" [ngClass]="statusBadgeClass(t.status)">
                  <i class="fa-solid" [ngClass]="statusIconClass(t.status)"></i>
                  {{ statusLabel(t.status) }}
                </span>
              </td>

              <!-- Total Units -->
              <td class="text-center font-mono font-bold text-amber-700">
                {{ t.totalQuantity }} unités
              </td>

              <!-- Created By -->
              <td class="text-xs text-slate-500">
                <span class="block font-semibold text-slate-700">{{ t.createdBy }}</span>
                <span>{{ t.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </td>

              <!-- Action -->
              <td class="text-right">
                <a [routerLink]="['/admin/stock/transfers', t.id]" class="btn-detail font-bold">
                  Consulter <i class="fa-solid fa-chevron-right ml-1"></i>
                </a>
              </td>

            </tr>

            <tr *ngIf="transfers.length === 0">
              <td colspan="7" class="empty-cell text-center py-8 text-slate-400">Aucun bon de transfert enregistré.</td>
            </tr>
          </tbody>
        </table>

      </div>

    </div>
  `,
  styles: [`
    .transfers-page { padding: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }

    .btn-new-transfer {
      padding: 0.65rem 1.25rem;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #FFFFFF;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .transfers-table-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
    }
    .transfers-table { width: 100%; border-collapse: collapse; text-align: left; }
    .transfers-table th {
      background: #F8FAFC;
      padding: 0.85rem 1rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      border-bottom: 1px solid #E2E8F0;
    }
    .t-row { border-bottom: 1px solid #F1F5F9; }
    .t-row:hover { background: #F8FAFC; }
    .transfers-table td { padding: 0.9rem 1rem; vertical-align: middle; }

    .t-num-link { color: #0F172A; text-decoration: none; }
    .t-num-link:hover { color: #C5A880; }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .sb-draft { background: #F1F5F9; color: #475569; }
    .sb-requested { background: #FEF3C7; color: #B45309; }
    .sb-approved { background: #DBEAFE; color: #1E40AF; }
    .sb-intransit { background: #EDE9FE; color: #6D28D9; }
    .sb-received { background: #DCFCE7; color: #15803D; }
    .sb-cancelled { background: #FEE2E2; color: #B91C1C; }

    .btn-detail {
      padding: 0.4rem 0.75rem;
      border-radius: 8px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #334155;
      font-size: 0.75rem;
      text-decoration: none;
    }
  `]
})
export class StockTransferPageComponent implements OnInit {
  transfers: StockTransfer[] = [];
  allStockItems: StockItem[] = [];
  showTransferWizard: boolean = false;

  constructor(
    private transferService: StockTransferService,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    this.transferService.getTransfers().subscribe(t => this.transfers = t);
    this.stockService.getStockProducts({ page: 1, pageSize: 100 }).subscribe(res => this.allStockItems = res.items);
  }

  onTransferCreated(req: CreateTransferRequest): void {
    this.transferService.createTransfer(req).subscribe(() => {
      this.showTransferWizard = false;
      this.transferService.getTransfers().subscribe(t => this.transfers = t);
    });
  }

  statusLabel(status: TransferStatus): string {
    const map: Record<TransferStatus, string> = {
      DRAFT: 'Brouillon',
      REQUESTED: 'Demandé',
      APPROVED: 'Approuvé',
      IN_TRANSIT: 'En Transit',
      RECEIVED: 'Reçu / Livré',
      CANCELLED: 'Annulé'
    };
    return map[status] || status;
  }

  statusBadgeClass(status: TransferStatus): string {
    const map: Record<TransferStatus, string> = {
      DRAFT: 'sb-draft',
      REQUESTED: 'sb-requested',
      APPROVED: 'sb-approved',
      IN_TRANSIT: 'sb-intransit',
      RECEIVED: 'sb-received',
      CANCELLED: 'sb-cancelled'
    };
    return map[status] || '';
  }

  statusIconClass(status: TransferStatus): string {
    const map: Record<TransferStatus, string> = {
      DRAFT: 'fa-pencil',
      REQUESTED: 'fa-clock',
      APPROVED: 'fa-thumbs-up',
      IN_TRANSIT: 'fa-truck',
      RECEIVED: 'fa-check',
      CANCELLED: 'fa-xmark'
    };
    return map[status] || 'fa-circle';
  }
}
