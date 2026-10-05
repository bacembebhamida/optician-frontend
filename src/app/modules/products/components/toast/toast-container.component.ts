import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastMessage } from '../../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      <div *ngFor="let toast of toasts$ | async" 
           class="toast-card" 
           [ngClass]="toast.type" 
           role="alert">
        <div class="toast-icon">
          <i class="fa-solid" [ngClass]="{
            'fa-circle-check': toast.type === 'success',
            'fa-circle-xmark': toast.type === 'error',
            'fa-triangle-exclamation': toast.type === 'warning',
            'fa-circle-info': toast.type === 'info'
          }"></i>
        </div>
        <div class="toast-body">
          <span class="toast-title">{{ toast.title }}</span>
          <span class="toast-desc">{{ toast.message }}</span>
        </div>
        <button class="toast-close-btn" (click)="dismiss(toast.id)" aria-label="Fermer la notification">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 420px;
      width: calc(100vw - 3rem);
      pointer-events: none;
    }
    .toast-card {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 1rem 1.25rem;
      border-radius: 14px;
      background: #FFFFFF;
      box-shadow: 0 16px 36px -8px rgba(17, 24, 39, 0.16), 0 4px 12px rgba(17, 24, 39, 0.08);
      border: 1px solid rgba(229, 231, 235, 0.8);
      animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all 0.25s ease;
    }
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .toast-card.success { border-left: 5px solid #10B981; }
    .toast-card.error { border-left: 5px solid #EF4444; }
    .toast-card.warning { border-left: 5px solid #F59E0B; }
    .toast-card.info { border-left: 5px solid #0284C7; }

    .toast-card.success .toast-icon { color: #10B981; }
    .toast-card.error .toast-icon { color: #EF4444; }
    .toast-card.warning .toast-icon { color: #F59E0B; }
    .toast-card.info .toast-icon { color: #0284C7; }

    .toast-icon {
      font-size: 1.25rem;
      margin-top: 0.1rem;
    }
    .toast-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .toast-title {
      font-weight: 700;
      font-size: 0.875rem;
      color: #1E293B;
    }
    .toast-desc {
      font-size: 0.8rem;
      color: #64748B;
      line-height: 1.4;
    }
    .toast-close-btn {
      background: transparent;
      border: none;
      color: #94A3B8;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 0.2rem;
      border-radius: 6px;
      transition: color 0.15s;
    }
    .toast-close-btn:hover {
      color: #1E293B;
    }
  `]
})
export class ToastContainerComponent {
  toasts$: Observable<ToastMessage[]>;

  constructor(private notificationService: NotificationService) {
    this.toasts$ = this.notificationService.toasts$;
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}
