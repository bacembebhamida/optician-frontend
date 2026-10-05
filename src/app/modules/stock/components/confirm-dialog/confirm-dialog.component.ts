import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="dialog-backdrop font-sans">
      <div class="dialog-card animate-fade-in">
        
        <div class="dialog-header">
          <div class="dialog-icon-box" [ngClass]="iconBoxClass">
            <i class="fa-solid" [ngClass]="iconClass"></i>
          </div>
          <div>
            <h3 class="dialog-title font-bold">{{ title }}</h3>
            <p class="dialog-message">{{ message }}</p>
          </div>
        </div>

        <div class="dialog-actions">
          <button (click)="onCancel.emit()" class="btn-dialog-cancel font-semibold">
            {{ cancelText }}
          </button>

          <button (click)="onConfirm.emit()" class="btn-dialog-confirm font-bold" [ngClass]="confirmBtnClass">
            {{ confirmText }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dialog-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(6px);
      z-index: 1100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .dialog-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      width: 100%;
      max-width: 440px;
      padding: 1.5rem;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.2);
    }

    .dialog-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .dialog-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    .ic-warning { background: #FEF3C7; color: #D97706; }
    .ic-danger { background: #FEE2E2; color: #DC2626; }
    .ic-info { background: #DBEAFE; color: #2563EB; }
    .ic-success { background: #DCFCE7; color: #16A34A; }

    .dialog-title { font-size: 1.1rem; color: #0F172A; }
    .dialog-message { font-size: 0.85rem; color: #64748B; margin-top: 0.25rem; line-height: 1.4; }

    .dialog-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn-dialog-cancel {
      padding: 0.6rem 1.1rem;
      border-radius: 10px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #334155;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .btn-dialog-confirm {
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      border: none;
      color: #FFFFFF;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-confirm-danger { background: #DC2626; }
    .btn-confirm-warning { background: #D97706; }
    .btn-confirm-info { background: #2563EB; }
    .btn-confirm-success { background: #16A34A; }
  `]
})
export class ConfirmDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirmation';
  @Input() message: string = 'Êtes-vous sûr de vouloir effectuer cette action ?';
  @Input() type: 'warning' | 'danger' | 'info' | 'success' = 'warning';
  @Input() confirmText: string = 'Confirmer';
  @Input() cancelText: string = 'Annuler';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  get iconBoxClass(): string {
    return `ic-${this.type}`;
  }

  get iconClass(): string {
    const map = {
      warning: 'fa-triangle-exclamation',
      danger: 'fa-triangle-exclamation',
      info: 'fa-circle-info',
      success: 'fa-circle-check'
    };
    return map[this.type];
  }

  get confirmBtnClass(): string {
    return `btn-confirm-${this.type}`;
  }
}
