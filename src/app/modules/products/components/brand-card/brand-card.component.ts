import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Brand } from '../../models/brand.model';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-brand-card',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective],
  template: `
    <div class="brand-card-item" [class.inactive]="!brand.active">
      
      <!-- Top Logo & Status Row -->
      <div class="card-head-row">
        <div class="logo-box">
          <img [src]="brand.logoUrl" [alt]="brand.name" class="brand-logo-img">
        </div>

        <div class="head-badges">
          <button (click)="toggleStatus.emit(brand.id)" class="status-badge-chip" [class.active]="brand.active">
            {{ brand.active ? 'Actif' : 'Inactif' }}
          </button>
          <span class="product-count-chip">
            <i class="fa-solid fa-glasses"></i> {{ brand.productCount }} produit(s)
          </span>
        </div>
      </div>

      <!-- Brand Content -->
      <div class="card-body-content">
        <h3 class="brand-title font-bold">{{ brand.name }}</h3>
        <span *ngIf="brand.countryOrigin" class="origin-tag"><i class="fa-solid fa-earth-americas"></i> {{ brand.countryOrigin }}</span>
        <p class="brand-desc">{{ brand.description }}</p>
        
        <a *ngIf="brand.websiteUrl" [href]="brand.websiteUrl" target="_blank" rel="noopener noreferrer" class="website-link">
          <i class="fa-solid fa-globe"></i> {{ brand.websiteUrl }}
        </a>
      </div>

      <!-- Card Actions Footer -->
      <div class="card-footer-actions">
        <button (click)="editBrand.emit(brand)" class="btn-brand-act edit">
          <i class="fa-solid fa-pen"></i> Modifier
        </button>
        <button *appHasPermission="'PRODUCT_DELETE'" (click)="deleteBrand.emit(brand)" class="btn-brand-act delete">
          <i class="fa-regular fa-trash-can"></i> Supprimer
        </button>
      </div>

    </div>
  `,
  styles: [`
    .brand-card-item {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.03);
      transition: all 0.25s ease;
    }
    .brand-card-item:hover {
      border-color: #C5A880;
      transform: translateY(-3px);
      box-shadow: 0 12px 28px -6px rgba(17, 24, 39, 0.08);
    }
    .brand-card-item.inactive { opacity: 0.65; background: #F8FAFC; }

    .card-head-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .logo-box {
      width: 54px;
      height: 54px;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      background: #FFFFFF;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
    }
    .brand-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }

    .head-badges {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }
    .status-badge-chip {
      padding: 0.2rem 0.55rem;
      font-size: 0.675rem;
      font-weight: 800;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      background: #FEE2E2;
      color: #991B1B;
      text-transform: uppercase;
    }
    .status-badge-chip.active { background: #D1FAE5; color: #065F46; }

    .product-count-chip {
      background: #F1F5F9;
      color: #334155;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
    }

    .card-body-content {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .brand-title {
      font-size: 1.1rem;
      color: #0F172A;
      letter-spacing: 0.02em;
    }
    .origin-tag {
      font-size: 0.725rem;
      color: #64748B;
      font-weight: 600;
    }
    .brand-desc {
      font-size: 0.825rem;
      color: #475569;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .website-link {
      font-size: 0.75rem;
      color: #C5A880;
      font-weight: 700;
      text-decoration: none;
      margin-top: 0.25rem;
    }
    .website-link:hover { text-decoration: underline; }

    .card-footer-actions {
      display: flex;
      gap: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid #F1F5F9;
    }
    .btn-brand-act {
      flex: 1;
      padding: 0.45rem;
      font-size: 0.775rem;
      font-weight: 700;
      border-radius: 8px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #334155;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
    }
    .btn-brand-act.edit:hover { background: #FEF3C7; color: #D97706; border-color: #FCD34D; }
    .btn-brand-act.delete:hover { background: #FEE2E2; color: #DC2626; border-color: #F87171; }
  `]
})
export class BrandCardComponent {
  @Input() brand!: Brand;

  @Output() editBrand = new EventEmitter<Brand>();
  @Output() toggleStatus = new EventEmitter<number>();
  @Output() deleteBrand = new EventEmitter<Brand>();
}
