import { Routes } from '@angular/router';
import { productPermissionGuard } from './guards/product-permission.guard';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/product-list-page/product-list-page.component').then(m => m.ProductListPageComponent),
        canActivate: [productPermissionGuard],
        data: { permission: 'PRODUCT_VIEW' }
      },
      {
        path: 'variants',
        loadComponent: () => import('./pages/variant-list-page/variant-list-page.component').then(m => m.VariantListPageComponent),
        canActivate: [productPermissionGuard],
        data: { permission: 'PRODUCT_VIEW' }
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/product-form-page/product-form-page.component').then(m => m.ProductFormPageComponent),
        canActivate: [productPermissionGuard],
        data: { permission: 'PRODUCT_CREATE' }
      },
      {
        path: 'categories',
        loadComponent: () => import('./pages/category-list-page/category-list-page.component').then(m => m.CategoryListPageComponent),
        canActivate: [productPermissionGuard],
        data: { permission: 'PRODUCT_VIEW' }
      },
      {
        path: 'brands',
        loadComponent: () => import('./pages/brand-list-page/brand-list-page.component').then(m => m.BrandListPageComponent),
        canActivate: [productPermissionGuard],
        data: { permission: 'PRODUCT_VIEW' }
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./pages/supplier-list-page/supplier-list-page.component').then(m => m.SupplierListPageComponent),
        canActivate: [productPermissionGuard],
        data: { permission: 'PRODUCT_VIEW' }
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/product-detail-page/product-detail-page.component').then(m => m.ProductDetailPageComponent),
        canActivate: [productPermissionGuard],
        data: { permission: 'PRODUCT_VIEW' }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/product-form-page/product-form-page.component').then(m => m.ProductFormPageComponent),
        canActivate: [productPermissionGuard],
        data: { permission: 'PRODUCT_UPDATE' }
      }
    ]
  }
];
