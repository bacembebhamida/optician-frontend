// OptiVision Category Models

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId: number | null;
  parentName?: string;
  children?: Category[];
  productCount: number;
  active: boolean;
  sortOrder: number;
  icon?: string;
}

export interface CategoryFlatNode {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId: number | null;
  parentName?: string;
  level: number;
  expandable: boolean;
  isExpanded?: boolean;
  productCount: number;
  active: boolean;
  sortOrder: number;
}

export interface CategoryDependencyCheck {
  categoryId: number;
  canDelete: boolean;
  productCount: number;
  subCategoryCount: number;
  reason?: string;
}
