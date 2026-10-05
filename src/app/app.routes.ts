import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CatalogueComponent } from './components/client/catalogue/catalogue.component';
import { TryOnComponent } from './components/client/try-on/try-on.component';
import { RdvComponent } from './components/client/rdv/rdv.component';
import { PrescriptionComponent } from './components/client/ordonnance/prescription.component';
import { CartCheckoutComponent } from './components/client/panier/cart-checkout.component';
import { ClientDashboardComponent } from './components/client/dashboard/client-dashboard.component';
import { StoresComponent } from './components/stores/stores.component';
import { AdminDashboardComponent } from './components/admin/dashboard/admin-dashboard.component';
import { AuthComponent } from './components/auth/auth.component';
import { adminAuthGuard, clientAuthGuard } from './guards/auth.guard';
import { AdminLayoutComponent } from './components/admin/layout/admin-layout.component';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'lunettes', component: CatalogueComponent },
  { path: 'soleil', component: CatalogueComponent },
  { path: 'lentilles', component: CatalogueComponent },
  { path: 'marques', component: CatalogueComponent },
  { path: 'try-on', component: TryOnComponent },
  { path: 'rdv', component: RdvComponent },
  { path: 'ordonnance', component: PrescriptionComponent },
  { path: 'panier', component: CartCheckoutComponent },
  { path: 'connexion', component: AuthComponent },
  { path: 'login', redirectTo: 'connexion', pathMatch: 'full' },
  { path: 'mon-compte', component: ClientDashboardComponent, canActivate: [clientAuthGuard] },
  { path: 'magasins', component: StoresComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminAuthGuard], pathMatch: 'full' },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminAuthGuard] },

  // ── Modules d'administration encapsulés dans le shell professionnel (sidebar + top bar) ──
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminAuthGuard],
    children: [
      {
        path: 'products',
        loadChildren: () => import('./modules/products/products.routes').then(m => m.PRODUCT_ROUTES)
      },
      {
        path: 'categories',
        loadComponent: () => import('./modules/products/pages/category-list-page/category-list-page.component').then(m => m.CategoryListPageComponent)
      },
      {
        path: 'brands',
        loadComponent: () => import('./modules/products/pages/brand-list-page/brand-list-page.component').then(m => m.BrandListPageComponent)
      },
      {
        path: 'stock',
        loadChildren: () => import('./modules/stock/stock.routes').then(m => m.STOCK_ROUTES)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];