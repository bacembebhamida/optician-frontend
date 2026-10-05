import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { OptiVisionService } from '../../../../services/optivision.service';
import { CategoryTreeItem } from '../../../../models/optivision.models';

@Component({
  selector: 'app-category-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './category-sidebar.component.html',
  styleUrls: ['./category-sidebar.component.css']
})
export class CategorySidebarComponent implements OnInit {

  @Input() currentRoutePath: string = '';
  @Input() activeGender: string = 'ALL';
  @Input() activeBrand: string = 'ALL';
  @Input() activeType: string = 'ALL';
  
  @Output() categorySelected = new EventEmitter<{ route: string; queryParams?: Record<string, string> }>();

  categories: CategoryTreeItem[] = [];
  isLoading: boolean = true;

  constructor(
    private optiService: OptiVisionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.optiService.getCategories().subscribe(items => {
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
    const route = item.route || '/lunettes';
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
        if (key === 'type' && this.activeType === val) return true;
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

  private autoExpandActiveCategory(): void {
    this.categories.forEach(cat => {
      if (this.isParentActive(cat)) {
        cat.isOpen = true;
      }
    });
  }
}
