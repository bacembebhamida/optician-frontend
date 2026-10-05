import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockMovement, MovementType } from '../../models/movement.model';

@Component({
  selector: 'app-movement-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-wrapper font-sans">
      
      <!-- Skeleton Loading State -->
      <div *ngIf="isLoading" class="skeleton-container">
        <div *ngFor="let i of [1,2,3,4,5]" class="skeleton-row">
          <div class="skeleton-box text-sk"></div>
          <div class="skeleton-box text-sk flex-2"></div>
          <div class="skeleton-box badge-sk"></div>
          <div class="skeleton-box text-sk"></div>
        </div>
      </div>

      <ng-container *ngIf="!isLoading">

        <!-- Empty State -->
        <div *ngIf="!movements || movements.length === 0" class="empty-state">
          <div class="empty-icon-box">
            <i class="fa-solid fa-clock-rotate-left"></i>
          </div>
          <h3 class="empty-title font-bold">Aucun mouvement de stock enregistré</h3>
          <p class="empty-sub">L'historique des opérations de stock apparaîtra ici.</p>
        </div>

        <!-- Movements Table -->
        <div *ngIf="movements && movements.length > 0" class="responsive-table-container">
          <table class="movement-table">
            <thead>
              <tr>
                <th>Date &amp; Heure</th>
                <th>Produit / SKU</th>
                <th>Magasin</th>
                <th>Type de Mouvement</th>
                <th class="text-center">Quantité</th>
                <th class="text-center">Avant → Après</th>
                <th>Opérateur</th>
                <th>Référence</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of movements" class="m-tr">
                
                <!-- Date -->
                <td class="font-mono text-xs text-slate-600">
                  {{ m.date | date:'dd/MM/yyyy HH:mm' }}
                </td>

                <!-- Product -->
                <td>
                  <div class="product-cell">
                    <span class="product-name font-bold">{{ m.productName }}</span>
                    <span class="sku-tag font-mono">SKU: {{ m.sku }}</span>
                  </div>
                </td>

                <!-- Store -->
                <td class="text-sm font-semibold text-slate-700">
                  <i class="fa-solid fa-store text-slate-400 mr-1"></i> {{ m.storeName }}
                </td>

                <!-- Movement Type -->
                <td>
                  <span class="type-badge" [ngClass]="typeBadgeClass(m.type)">
                    {{ typeLabel(m.type) }}
                  </span>
                </td>

                <!-- Quantity Delta -->
                <td class="text-center font-mono font-bold" [class.text-emerald-600]="m.quantity > 0" [class.text-red-600]="m.quantity < 0">
                  {{ m.quantity > 0 ? '+' : '' }}{{ m.quantity }}
                </td>

                <!-- Stock Before -> After -->
                <td class="text-center font-mono text-xs">
                  <span class="text-slate-500">{{ m.stockBefore }}</span>
                  <i class="fa-solid fa-arrow-right text-slate-300 mx-1"></i>
                  <span class="font-bold text-slate-900">{{ m.stockAfter }}</span>
                </td>

                <!-- User -->
                <td class="text-sm text-slate-700">
                  <i class="fa-regular fa-user text-slate-400 mr-1"></i> {{ m.userFullName }}
                </td>

                <!-- Reference -->
                <td class="font-mono text-xs">
                  <span class="ref-badge">{{ m.referenceNumber }}</span>
                  <p *ngIf="m.notes" class="text-[11px] text-slate-500 mt-0.5 italic">{{ m.notes }}</p>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

      </ng-container>

    </div>
  `,
  styles: [`
    .table-wrapper {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
    }

    .skeleton-container {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .skeleton-row { display: flex; gap: 1rem; }
    .skeleton-box {
      height: 40px;
      background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 8px;
    }
    .text-sk { flex: 1; }
    .badge-sk { width: 120px; }
    @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .empty-icon-box {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: #EDE9FE;
      color: #7C3AED;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }

    .responsive-table-container { width: 100%; overflow-x: auto; }
    .movement-table { width: 100%; border-collapse: collapse; text-align: left; }
    .movement-table th {
      background: #F8FAFC;
      padding: 0.85rem 1rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #E2E8F0;
    }
    .m-tr { border-bottom: 1px solid #F1F5F9; }
    .m-tr:hover { background: #F8FAFC; }
    .movement-table td { padding: 0.85rem 1rem; vertical-align: middle; }

    .product-cell { display: flex; flex-direction: column; }
    .product-name { font-size: 0.875rem; color: #0F172A; }
    .sku-tag { font-size: 0.7rem; color: #64748B; }

    .type-badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 8px;
      font-size: 0.725rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .tb-green { background: #DCFCE7; color: #15803D; }
    .tb-red { background: #FEE2E2; color: #B91C1C; }
    .tb-orange { background: #FEF3C7; color: #B45309; }
    .tb-purple { background: #EDE9FE; color: #6D28D9; }
    .tb-blue { background: #DBEAFE; color: #1E40AF; }

    .ref-badge {
      background: #F1F5F9;
      color: #334155;
      padding: 0.15rem 0.4rem;
      border-radius: 6px;
      border: 1px solid #CBD5E1;
    }
  `]
})
export class MovementTableComponent {
  @Input() movements: StockMovement[] = [];
  @Input() isLoading: boolean = false;

  typeLabel(type: MovementType): string {
    const map: Record<MovementType, string> = {
      ENTREE: 'Entrée Fournisseur',
      SORTIE_VENTE: 'Sortie Vente',
      SORTIE_PERTE: 'Perte / Casse',
      SORTIE_DOMMAGE: 'Dommage Monture',
      SORTIE_CORRECTION: 'Correction Stock',
      TRANSFERT_ENTRANT: 'Transfert Entrant',
      TRANSFERT_SORTANT: 'Transfert Sortant',
      AJUSTEMENT_INVENTAIRE: 'Ajustement Inventaire'
    };
    return map[type] || type;
  }

  typeBadgeClass(type: MovementType): string {
    if (type === 'ENTREE' || type === 'TRANSFERT_ENTRANT') return 'tb-green';
    if (type === 'SORTIE_VENTE') return 'tb-blue';
    if (type === 'SORTIE_PERTE' || type === 'SORTIE_DOMMAGE') return 'tb-red';
    if (type === 'SORTIE_CORRECTION') return 'tb-orange';
    if (type === 'TRANSFERT_SORTANT' || type === 'AJUSTEMENT_INVENTAIRE') return 'tb-purple';
    return '';
  }
}
