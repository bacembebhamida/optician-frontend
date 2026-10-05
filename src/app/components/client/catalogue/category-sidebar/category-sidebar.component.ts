import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../../services/category.service';
import { CategoryTreeItem, Gender, FrameShape, Material } from '../../../../models/optivision.models';
import { FilterState } from '../filter-panel/filter-panel.component';

@Component({
  selector: 'app-category-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './category-sidebar.component.html',
  styleUrls: ['./category-sidebar.component.css']
})
export class CategorySidebarComponent implements OnInit {

  @Input() currentRoutePath: string = '/catalogue';
  @Input() activeGender: string = 'ALL';
  @Input() activeBrand: string = 'ALL';

  @Input() filters: FilterState = {
    searchQuery: '',
    gender: 'ALL',
    brand: 'ALL',
    shape: 'ALL',
    material: 'ALL',
    maxPrice: 1500,
    only3dAvailable: false,
    inStockOnly: false
  };

  @Input() brandsList: string[] = ['Ray-Ban', 'Gucci', 'Tom Ford', 'Oakley', 'Persol', 'Air Optix', 'Prada'];

  @Output() categorySelected = new EventEmitter<{ route: string; queryParams?: Record<string, string> }>();
  @Output() filterChange = new EventEmitter<FilterState>();
  @Output() resetFilters = new EventEmitter<void>();

  categories: CategoryTreeItem[] = [];
  isLoading: boolean = true;

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(items => {
      this.categories = items;
      this.isLoading = false;
      this.autoExpandActiveCategory();
    });
  }

  toggleExpand(category: CategoryTreeItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    category.isOpen = !category.isOpen;
  }

  onSelectCategory(item: CategoryTreeItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const route = item.route || '/catalogue';
    const queryParams = item.queryParams || {};
    this.categorySelected.emit({ route, queryParams });
    this.router.navigate([route], { queryParams });
  }

  isCategoryActive(item: CategoryTreeItem): boolean {
    const currentUrl = this.router.url;
    if (item.queryParams) {
      const paramKeys = Object.keys(item.queryParams);
      if (paramKeys.length > 0) {
        const key = paramKeys[0];
        const val = item.queryParams[key];
        if (key === 'gender' && this.activeGender === val) return true;
        if (key === 'brand' && this.activeBrand === val) return true;
      }
    }

    if (item.route && currentUrl.includes(item.route) && (!item.queryParams || Object.keys(item.queryParams).length === 0)) {
      return true;
    }
    return false;
  }

  isParentActive(parent: CategoryTreeItem): boolean {
    if (this.isCategoryActive(parent)) return true;
    if (parent.children) {
      return parent.children.some(child => this.isCategoryActive(child));
    }
    return false;
  }

  onModelChange(): void {
    this.filterChange.emit(this.filters);
  }

  onReset(): void {
    this.resetFilters.emit();
  }

  private autoExpandActiveCategory(): void {
    this.categories.forEach(cat => {
      if (this.isParentActive(cat)) {
        cat.isOpen = true;
      }
    });
  }
}
