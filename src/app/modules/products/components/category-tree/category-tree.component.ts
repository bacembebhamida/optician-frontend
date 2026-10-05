import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category.model';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-category-tree',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective],
  template: `
    <div class="category-tree-container">
      
      <div *ngFor="let cat of categories" class="tree-node-group">
        
        <!-- Parent Node Row -->
        <div class="node-row parent-row" [class.inactive]="!cat.active">
          
          <button (click)="toggleExpand(cat.id)" class="expand-btn">
            <i class="fa-solid" [class.fa-chevron-down]="isExpanded(cat.id)" [class.fa-chevron-right]="!isExpanded(cat.id)"></i>
          </button>

          <div class="cat-icon-box">
            <i class="fa-solid" [ngClass]="cat.icon || 'fa-folder'"></i>
          </div>

          <div class="cat-info">
            <span class="cat-name font-bold">{{ cat.name }}</span>
            <span class="cat-desc" *ngIf="cat.description">{{ cat.description }}</span>
          </div>

          <div class="cat-meta">
            <span class="product-count-chip">
              <i class="fa-solid fa-glasses"></i> {{ cat.productCount }} produit(s)
            </span>
          </div>

          <div class="cat-status">
            <button (click)="toggleStatus.emit(cat.id)" class="status-badge" [class.active]="cat.active">
              {{ cat.active ? 'Actif' : 'Inactif' }}
            </button>
          </div>

          <div class="cat-actions">
            <!-- Add Subcategory -->
            <button (click)="addSubCategory.emit(cat)" class="btn-node-act add" title="Ajouter sous-catégorie">
              <i class="fa-solid fa-plus"></i> Sous-catégorie
            </button>
            <!-- Edit -->
            <button (click)="editCategory.emit(cat)" class="btn-node-act edit" title="Modifier">
              <i class="fa-solid fa-pen"></i>
            </button>
            <!-- Delete -->
            <button *appHasPermission="'PRODUCT_DELETE'" (click)="deleteCategory.emit(cat)" class="btn-node-act delete" title="Supprimer">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>

        </div>

        <!-- Children Tree Nodes (Collapsible Sub-Level) -->
        <div *ngIf="isExpanded(cat.id) && cat.children && cat.children.length > 0" class="children-nodes-list animate-fade-in">
          
          <div *ngFor="let sub of cat.children" class="node-row child-row" [class.inactive]="!sub.active">
            
            <div class="tree-line-indent"></div>

            <div class="cat-icon-box sub">
              <i class="fa-solid fa-turn-up text-slate-400 rotate-90"></i>
            </div>

            <div class="cat-info">
              <span class="cat-name font-semibold">{{ sub.name }}</span>
              <span class="parent-label">Rattaché à : {{ cat.name }}</span>
            </div>

            <div class="cat-meta">
              <span class="product-count-chip sm">
                {{ sub.productCount }} produit(s)
              </span>
            </div>

            <div class="cat-status">
              <button (click)="toggleStatus.emit(sub.id)" class="status-badge sm" [class.active]="sub.active">
                {{ sub.active ? 'Actif' : 'Inactif' }}
              </button>
            </div>

            <div class="cat-actions">
              <button (click)="editCategory.emit(sub)" class="btn-node-act edit" title="Modifier">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button *appHasPermission="'PRODUCT_DELETE'" (click)="deleteCategory.emit(sub)" class="btn-node-act delete" title="Supprimer">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    .category-tree-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .tree-node-group {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(17, 24, 39, 0.02);
    }
    .node-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1.25rem;
      transition: background 0.2s ease;
    }
    .node-row:hover { background: #FAF9F6; }
    .node-row.inactive { opacity: 0.65; background: #F8FAFC; }

    .expand-btn {
      background: transparent;
      border: none;
      color: #64748B;
      font-size: 0.85rem;
      cursor: pointer;
      width: 24px;
      height: 24px;
    }
    .cat-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #FEF3C7;
      color: #D97706;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .cat-icon-box.sub {
      width: 32px;
      height: 32px;
      background: transparent;
      font-size: 0.85rem;
    }
    .cat-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .cat-name {
      font-size: 0.925rem;
      color: #0F172A;
    }
    .cat-desc {
      font-size: 0.775rem;
      color: #64748B;
    }
    .parent-label {
      font-size: 0.725rem;
      color: #94A3B8;
    }

    .product-count-chip {
      background: #F1F5F9;
      color: #334155;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
    }
    .product-count-chip.sm { font-size: 0.7rem; }

    .status-badge {
      padding: 0.25rem 0.65rem;
      font-size: 0.725rem;
      font-weight: 800;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      background: #FEE2E2;
      color: #991B1B;
      text-transform: uppercase;
    }
    .status-badge.active {
      background: #D1FAE5;
      color: #065F46;
    }

    .cat-actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-node-act {
      padding: 0.35rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 8px;
      border: 1px solid #CBD5E1;
      background: #FFFFFF;
      color: #334155;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .btn-node-act.add:hover { background: #FEF3C7; color: #D97706; border-color: #FCD34D; }
    .btn-node-act.edit:hover { background: #E0F2FE; color: #0284C7; border-color: #38BDF8; }
    .btn-node-act.delete:hover { background: #FEE2E2; color: #DC2626; border-color: #F87171; }

    .children-nodes-list {
      background: #F8FAFC;
      border-top: 1px solid #F1F5F9;
      padding-left: 2.5rem;
    }
    .child-row {
      border-top: 1px solid #F1F5F9;
      padding: 0.65rem 1rem;
    }
  `]
})
export class CategoryTreeComponent {
  @Input() categories: Category[] = [];
  
  @Output() addSubCategory = new EventEmitter<Category>();
  @Output() editCategory = new EventEmitter<Category>();
  @Output() toggleStatus = new EventEmitter<number>();
  @Output() deleteCategory = new EventEmitter<Category>();

  expandedIds: Set<number> = new Set([1, 2, 3]); // Expand top nodes by default

  toggleExpand(id: number): void {
    if (this.expandedIds.has(id)) {
      this.expandedIds.delete(id);
    } else {
      this.expandedIds.add(id);
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedIds.has(id);
  }
}
