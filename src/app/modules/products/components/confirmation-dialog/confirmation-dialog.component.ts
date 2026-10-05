import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="dialog-overlay animate-fade-in" (click)="onOverlayClick($event)">
      <div class="dialog-card" role="dialog" aria-modal="true" [attr.aria-labelledby]="'dialog-title'">
        
        <div class="dialog-header">
          <div class="dialog-icon-box" [ngClass]="type">
            <i class="fa-solid" [ngClass]="{
              'fa-triangle-exclamation': type === 'danger' || type === 'warning',
              'fa-circle-info': type === 'info',
              'fa-circle-question': type === 'question'
            }"></i>
          </div>
          <div class="dialog-title-group">
            <h3 id="dialog-title" class="dialog-title">{{ title }}</h3>
            <p *ngIf="subtitle" class="dialog-subtitle">{{ subtitle }}</p>
          </div>
          <button class="dialog-close" (click)="cancel()" aria-label="Fermer la boîte de dialogue">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="dialog-body">
          <p class="dialog-message">{{ message }}</p>
          <div *ngIf="warningBox" class="warning-alert-box">
            <i class="fa-solid fa-ban text-red-600 mr-2"></i>
            <span>{{ warningBox }}</span>
          </div>
        </div>

        <div class="dialog-footer">
          <button type="button" class="btn-cancel" (click)="cancel()">{{ cancelText }}</button>
          <button type="button" 
                  class="btn-confirm" 
                  [ngClass]="type"
                  [disabled]="disableConfirm"
                  (click)="confirm()">
            <i *ngIf="confirmIcon" class="fa-solid" [ngClass]="confirmIcon"></i>
            {{ confirmText }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      inset: 0;
      z-index: 9998;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .dialog-card {
      background: #FFFFFF;
      width: 100%;
      max-width: 480px;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #E2E8F0;
      overflow: hidden;
      animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes popIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .dialog-header {
      padding: 1.25rem 1.5rem 1rem 1.5rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      border-bottom: 1px solid #F1F5F9;
    }
    .dialog-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .dialog-icon-box.danger { background: #FEE2E2; color: #DC2626; }
    .dialog-icon-box.warning { background: #FEF3C7; color: #D97706; }
    .dialog-icon-box.info { background: #E0F2FE; color: #0284C7; }
    .dialog-icon-box.question { background: #F3E8FF; color: #7E22CE; }

    .dialog-title-group {
      flex: 1;
    }
    .dialog-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0F172A;
      line-height: 1.3;
    }
    .dialog-subtitle {
      font-size: 0.8rem;
      color: #64748B;
      margin-top: 0.15rem;
    }
    .dialog-close {
      background: transparent;
      border: none;
      color: #94A3B8;
      font-size: 1rem;
      cursor: pointer;
      padding: 0.3rem;
      border-radius: 6px;
    }
    .dialog-close:hover { color: #0F172A; }

    .dialog-body {
      padding: 1.25rem 1.5rem;
    }
    .dialog-message {
      font-size: 0.925rem;
      color: #334155;
      line-height: 1.5;
    }
    .warning-alert-box {
      margin-top: 0.85rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      background: #FEF2F2;
      border: 1px solid #FCA5A5;
      color: #991B1B;
      font-size: 0.825rem;
      font-weight: 600;
      display: flex;
      align-items: flex-start;
    }

    .dialog-footer {
      padding: 1rem 1.5rem 1.25rem 1.5rem;
      background: #F8FAFC;
      border-top: 1px solid #F1F5F9;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    .btn-cancel {
      padding: 0.6rem 1.2rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-cancel:hover {
      background: #F1F5F9;
      color: #0F172A;
    }
    .btn-confirm {
      padding: 0.6rem 1.35rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #FFFFFF;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }
    .btn-confirm.danger { background: #DC2626; }
    .btn-confirm.danger:hover:not(:disabled) { background: #B91C1C; }
    .btn-confirm.warning { background: #D97706; }
    .btn-confirm.warning:hover:not(:disabled) { background: #B45309; }
    .btn-confirm.info { background: #0284C7; }
    .btn-confirm.info:hover:not(:disabled) { background: #0369A1; }
    .btn-confirm.question { background: #7E22CE; }
    .btn-confirm.question:hover:not(:disabled) { background: #6B21A8; }
    .btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class ConfirmationDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirmation';
  @Input() subtitle?: string;
  @Input() message: string = 'Êtes-vous sûr de vouloir effectuer cette action ?';
  @Input() warningBox?: string;
  @Input() type: 'danger' | 'warning' | 'info' | 'question' = 'danger';
  @Input() confirmText: string = 'Confirmer';
  @Input() cancelText: string = 'Annuler';
  @Input() confirmIcon?: string;
  @Input() disableConfirm: boolean = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.cancel();
    }
  }

  confirm(): void {
    if (!this.disableConfirm) {
      this.confirmed.emit();
      this.isOpen = false;
    }
  }

  cancel(): void {
    this.cancelled.emit();
    this.isOpen = false;
  }
}
