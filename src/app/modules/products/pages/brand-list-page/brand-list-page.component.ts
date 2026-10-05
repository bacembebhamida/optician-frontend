import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrandService } from '../../services/brand.service';
import { Brand } from '../../models/brand.model';
import { BrandCardComponent } from '../../components/brand-card/brand-card.component';
import { ToastContainerComponent } from '../../components/toast/toast-container.component';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-brand-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BrandCardComponent,
    ToastContainerComponent,
    ConfirmationDialogComponent,
    HasPermissionDirective
  ],
  template: `
    <div class="page-container">
      
      <app-toast-container></app-toast-container>

      <div class="page-header">
        <div>
          <h1 class="page-title font-bold">Gestion des Marques Partenaires</h1>
          <p class="page-subtitle">Répertoire des lunetiers et fabricants sous contrat OptiVision.</p>
        </div>

        <button *appHasPermission="'PRODUCT_CREATE'" (click)="openAddModal()" class="btn-add-brand">
          <i class="fa-solid fa-plus font-bold"></i> Nouvelle Marque
        </button>
      </div>

      <!-- Brands Cards Grid -->
      <div class="brands-grid">
        <app-brand-card
          *ngFor="let b of brands"
          [brand]="b"
          (editBrand)="openEditModal($event)"
          (toggleStatus)="onToggleStatus($event)"
          (deleteBrand)="onPromptDelete($event)">
        </app-brand-card>
      </div>

      <!-- Add / Edit Modal -->
      <div *ngIf="showModal" class="modal-overlay animate-fade-in" (click)="closeModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          
          <div class="modal-header">
            <h3>{{ editingBrand ? 'Modifier la Marque' : 'Nouvelle Marque Lunetière' }}</h3>
            <button (click)="closeModal()" class="close-btn"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div class="modal-body form-grid">
            
            <div class="field-group col-span-full">
              <label class="field-label">Nom de la Marque *</label>
              <input type="text" [(ngModel)]="activeForm.name" placeholder="Ex: RAY-BAN" class="modal-input" required>
            </div>

            <div class="field-group col-span-full">
              <label class="field-label">URL du Logo</label>
              <input type="text" [(ngModel)]="activeForm.logoUrl" placeholder="https://..." class="modal-input">
            </div>

            <div class="field-group col-span-full">
              <label class="field-label">Description &amp; Heritage</label>
              <textarea [(ngModel)]="activeForm.description" rows="3" placeholder="Présentation de la marque..." class="modal-textarea"></textarea>
            </div>

            <div class="field-group">
              <label class="field-label">Site Web Officiel</label>
              <input type="text" [(ngModel)]="activeForm.websiteUrl" placeholder="https://www.ray-ban.com" class="modal-input">
            </div>

            <div class="field-group">
              <label class="field-label">Pays d'Origine</label>
              <input type="text" [(ngModel)]="activeForm.countryOrigin" placeholder="Italie / France" class="modal-input">
            </div>

            <div class="field-group col-span-full">
              <label class="field-label">Statut</label>
              <select [(ngModel)]="activeForm.active" class="modal-select">
                <option [ngValue]="true">Actif (Produits visibles)</option>
                <option [ngValue]="false">Inactif</option>
              </select>
            </div>

          </div>

          <div class="modal-footer">
            <button (click)="closeModal()" class="btn-cancel">Annuler</button>
            <button (click)="saveBrand()" class="btn-save">
              <i class="fa-solid fa-floppy-disk"></i> Enregistrer
            </button>
          </div>

        </div>
      </div>

      <!-- Delete Confirmation -->
      <app-confirmation-dialog
        [isOpen]="isDeleteModalOpen"
        title="Supprimer la marque ?"
        [message]="'Voulez-vous supprimer la marque ' + (targetBrand?.name || '') + ' ?'"
        type="danger"
        confirmText="Supprimer"
        (confirmed)="confirmDelete()"
        (cancelled)="isDeleteModalOpen = false">
      </app-confirmation-dialog>

    </div>
  `,
  styles: [`
    .page-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding: 1.5rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .page-title { font-size: 1.5rem; color: #0F172A; }
    .page-subtitle { font-size: 0.85rem; color: #64748B; }

    .btn-add-brand {
      padding: 0.65rem 1.4rem;
      font-size: 0.85rem;
      font-weight: 700;
      color: #FFFFFF;
      background: #C5A880;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .brands-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-card {
      background: #FFFFFF;
      border-radius: 20px;
      width: 100%;
      max-width: 500px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #F1F5F9;
    }
    .modal-header h3 { font-size: 1.05rem; font-weight: 700; color: #0F172A; }
    .close-btn { background: transparent; border: none; font-size: 1rem; color: #94A3B8; cursor: pointer; }
    
    .modal-body { padding: 1.25rem 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-label { font-size: 0.75rem; font-weight: 700; color: #475569; }
    .modal-input, .modal-select, .modal-textarea { padding: 0.55rem 0.85rem; font-size: 0.85rem; border: 1px solid #CBD5E1; border-radius: 10px; outline: none; font-family: inherit; }
    
    .modal-footer { padding: 1rem 1.5rem; background: #F8FAFC; border-top: 1px solid #F1F5F9; display: flex; justify-content: flex-end; gap: 0.75rem; }
    .btn-cancel { padding: 0.6rem 1.2rem; font-size: 0.85rem; font-weight: 600; color: #475569; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 10px; cursor: pointer; }
    .btn-save { padding: 0.6rem 1.35rem; font-size: 0.85rem; font-weight: 700; color: #FFFFFF; background: #C5A880; border: none; border-radius: 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; }
  `]
})
export class BrandListPageComponent implements OnInit {
  brands: Brand[] = [];

  showModal: boolean = false;
  editingBrand: Brand | null = null;
  activeForm: Partial<Brand> = {
    name: '',
    logoUrl: '',
    description: '',
    websiteUrl: '',
    active: true,
    countryOrigin: ''
  };

  isDeleteModalOpen: boolean = false;
  targetBrand: Brand | null = null;

  constructor(private brandService: BrandService) {}

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.brandService.getBrands().subscribe(b => this.brands = b);
  }

  openAddModal(): void {
    this.editingBrand = null;
    this.activeForm = {
      name: '',
      logoUrl: '',
      description: '',
      websiteUrl: '',
      active: true,
      countryOrigin: ''
    };
    this.showModal = true;
  }

  openEditModal(brand: Brand): void {
    this.editingBrand = brand;
    this.activeForm = { ...brand };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveBrand(): void {
    if (!this.activeForm.name?.trim()) return;

    if (this.editingBrand) {
      this.brandService.updateBrand(this.editingBrand.id, this.activeForm).subscribe(() => {
        this.loadBrands();
        this.closeModal();
      });
    } else {
      this.brandService.createBrand(this.activeForm).subscribe(() => {
        this.loadBrands();
        this.closeModal();
      });
    }
  }

  onToggleStatus(id: number): void {
    this.brandService.toggleBrandStatus(id).subscribe(() => this.loadBrands());
  }

  onPromptDelete(brand: Brand): void {
    this.targetBrand = brand;
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    if (this.targetBrand) {
      this.brandService.deleteBrand(this.targetBrand.id).subscribe(() => {
        this.loadBrands();
        this.isDeleteModalOpen = false;
        this.targetBrand = null;
      });
    }
  }
}
