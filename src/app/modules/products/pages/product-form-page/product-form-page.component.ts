import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { ToastContainerComponent } from '../../components/toast/toast-container.component';

@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductFormComponent, ToastContainerComponent],
  template: `
    <div class="page-container">
      
      <app-toast-container></app-toast-container>

      <div class="breadcrumb-row">
        <a routerLink="/admin/products" class="back-link">
          <i class="fa-solid fa-arrow-left"></i> Retour au Catalogue
        </a>
        <span class="sep">/</span>
        <span class="crumb-active">{{ isEditMode ? 'Édition Produit #' + productId : 'Nouveau Produit' }}</span>
      </div>

      <div *ngIf="isLoading" class="loading-box">
        <i class="fa-solid fa-spinner fa-spin text-2xl text-amber-600 mb-2"></i>
        <span>Chargement des données du produit...</span>
      </div>

      <app-product-form
        *ngIf="!isLoading"
        [initialProduct]="product"
        [isEditMode]="isEditMode"
        [backendError]="backendError"
        [isSubmitting]="isSubmitting"
        (formSubmit)="onFormSubmit($event)"
        (onCancel)="navigateBack()">
      </app-product-form>

    </div>
  `,
  styles: [`
    .page-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding: 1.5rem;
    }
    .breadcrumb-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }
    .back-link {
      color: #C5A880;
      font-weight: 700;
      text-decoration: none;
    }
    .crumb-active { color: #64748B; }

    .loading-box {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 3rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #64748B;
    }
  `]
})
export class ProductFormPageComponent implements OnInit {
  isEditMode: boolean = false;
  productId: number | null = null;
  product?: Product;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  backendError?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.isEditMode = true;
      this.productId = Number(idParam);
      this.loadProductData(this.productId);
    }
  }

  private loadProductData(id: number): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (p) => {
        this.product = p;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.navigateBack();
      }
    });
  }

  onFormSubmit(payload: Partial<Product>): void {
    this.isSubmitting = true;
    this.backendError = undefined;

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, payload).subscribe({
        next: (updated) => {
          this.isSubmitting = false;
          this.router.navigate(['/admin/products', updated.id]);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.backendError = err?.error?.message || 'Une erreur serveur est survenue lors de la mise à jour.';
        }
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: (created) => {
          this.isSubmitting = false;
          this.router.navigate(['/admin/products', created.id]);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.backendError = err?.error?.message || 'Une erreur serveur est survenue lors de la création.';
        }
      });
    }
  }

  navigateBack(): void {
    if (this.productId) {
      this.router.navigate(['/admin/products', this.productId]);
    } else {
      this.router.navigate(['/admin/products']);
    }
  }
}
