import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { CategoryTreeComponent } from '../../components/category-tree/category-tree.component';
import { ToastContainerComponent } from '../../components/toast/toast-container.component';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-category-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CategoryTreeComponent,
    ToastContainerComponent,
    ConfirmationDialogComponent,
    HasPermissionDirective
  ],
  template: `
    <div class="page-container">
      
      <app-toast-container></app-toast-container>

      <div class="page-header">
        <div>
          <h1 class="page-title font-bold">Gestion des Catégories Produits</h1>
          <p class="page-subtitle">Arborescence hiérarchique et classification des références catalogue.</p>
        </div>

        <button *appHasPermission="'PRODUCT_CREATE'" (click)="openAddCategoryModal()" class="btn-add-cat">
          <i class="fa-solid fa-plus font-bold"></i> Nouvelle Catégorie
        </button>
      </div>

      <!-- Category Tree Component -->
      <app-category-tree
        [categories]="categories"
        (addSubCategory)="openAddSubCategoryModal($event)"
        (editCategory)="openEditModal($event)"
        (toggleStatus)="onToggleStatus($event)"
        (deleteCategory)="onPromptDeleteCategory($event)">
      </app-category-tree>

      <!-- Add / Edit Modal -->
      <div *ngIf="showFormModal" class="modal-overlay animate-fade-in" (click)="closeFormModal()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          
          <div class="modal-header">
            <h3>{{ editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie' }}</h3>
            <button (click)="closeFormModal()" class="close-btn"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div class="modal-body form-grid">
            
            <div class="field-group col-span-full">
              <label class="field-label">Nom de la Catégorie *</label>
              <input type="text" [(ngModel)]="activeCategoryForm.name" placeholder="Ex: Lunettes de soleil" class="modal-input" required>
            </div>

            <div class="field-group col-span-full">
              <label class="field-label">Catégorie Parent (Laissez vide si racine)</label>
              <select [(ngModel)]="activeCategoryForm.parentId" class="modal-select">
                <option [value]="null">-- Aucune (Catégorie Racine) --</option>
                <option *ngFor="let c of parentOptions" [value]="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div class="field-group col-span-full">
              <label class="field-label">Description</label>
              <textarea [(ngModel)]="activeCategoryForm.description" rows="3" placeholder="Description de la catégorie..." class="modal-textarea"></textarea>
            </div>

            <div class="field-group">
              <label class="field-label">Icône FontAwesome</label>
              <input type="text" [(ngModel)]="activeCategoryForm.icon" placeholder="fa-glasses" class="modal-input">
            </div>

            <div class="field-group">
              <label class="field-label">Statut</label>
              <select [(ngModel)]="activeCategoryForm.active" class="modal-select">
                <option [ngValue]="true">Actif</option>
                <option [ngValue]="false">Inactif</option>
              </select>
            </div>

          </div>

          <div class="modal-footer">
            <button (click)="closeFormModal()" class="btn-cancel">Annuler</button>
            <button (click)="saveCategory()" class="btn-save">
              <i class="fa-solid fa-floppy-disk"></i> Enregistrer
            </button>
          </div>

        </div>
      </div>

      <!-- Delete Confirmation Modal with Dependency Warning -->
      <app-confirmation-dialog
        [isOpen]="isDeleteModalOpen"
        title="Supprimer la catégorie ?"
        subtitle="Vérification des dépendances catalogue..."
        [message]="deleteMessage"
        [warningBox]="deleteWarningBox"
        [disableConfirm]="!canDeleteTarget"
        type="danger"
        confirmText="Supprimer"
        (confirmed)="confirmDeleteCategory()"
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

    .btn-add-cat {
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
export class CategoryListPageComponent implements OnInit {
  categories: Category[] = [];
  parentOptions: Category[] = [];

  showFormModal: boolean = false;
  editingCategory: Category | null = null;
  activeCategoryForm: Partial<Category> = {
    name: '',
    description: '',
    parentId: null,
    active: true,
    icon: 'fa-glasses'
  };

  isDeleteModalOpen: boolean = false;
  targetCategoryId: number | null = null;
  deleteMessage: string = '';
  deleteWarningBox?: string;
  canDeleteTarget: boolean = true;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(cats => {
      this.categories = cats;
      this.parentOptions = cats;
    });
  }

  openAddCategoryModal(): void {
    this.editingCategory = null;
    this.activeCategoryForm = {
      name: '',
      description: '',
      parentId: null,
      active: true,
      icon: 'fa-glasses'
    };
    this.showFormModal = true;
  }

  openAddSubCategoryModal(parent: Category): void {
    this.editingCategory = null;
    this.activeCategoryForm = {
      name: '',
      description: '',
      parentId: parent.id,
      parentName: parent.name,
      active: true,
      icon: 'fa-folder'
    };
    this.showFormModal = true;
  }

  openEditModal(cat: Category): void {
    this.editingCategory = cat;
    this.activeCategoryForm = { ...cat };
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  saveCategory(): void {
    if (!this.activeCategoryForm.name?.trim()) return;

    if (this.editingCategory) {
      this.categoryService.updateCategory(this.editingCategory.id, this.activeCategoryForm).subscribe(() => {
        this.loadCategories();
        this.closeFormModal();
      });
    } else {
      this.categoryService.createCategory(this.activeCategoryForm).subscribe(() => {
        this.loadCategories();
        this.closeFormModal();
      });
    }
  }

  onToggleStatus(id: number): void {
    this.categoryService.toggleCategoryStatus(id).subscribe(() => this.loadCategories());
  }

  onPromptDeleteCategory(cat: Category): void {
    this.targetCategoryId = cat.id;
    this.categoryService.checkCategoryDependency(cat.id).subscribe(check => {
      this.canDeleteTarget = check.canDelete;
      this.deleteMessage = `Voulez-vous supprimer la catégorie "${cat.name}" ?`;
      this.deleteWarningBox = check.reason;
      this.isDeleteModalOpen = true;
    });
  }

  confirmDeleteCategory(): void {
    if (this.targetCategoryId !== null && this.canDeleteTarget) {
      this.categoryService.deleteCategory(this.targetCategoryId).subscribe(() => {
        this.loadCategories();
        this.isDeleteModalOpen = false;
        this.targetCategoryId = null;
      });
    }
  }
}
