import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { OptiVisionService } from '../../../services/optivision.service';
import { Product, ProductCategory } from '../../../models/optivision.models';
import { CategorySidebarComponent } from './category-sidebar/category-sidebar.component';
import { FilterPanelComponent, FilterState } from './filter-panel/filter-panel.component';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    CategorySidebarComponent, 
    FilterPanelComponent
  ],
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css']
})
export class CatalogueComponent implements OnInit {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  favoriteIds: number[] = [];
  isLoading: boolean = false;

  // View state
  viewMode: 'GRID' | 'LIST' = 'GRID';
  showFilterPanel: boolean = false;
  showMobileCategoryDrawer: boolean = false;

  // Sort State
  sortBy: 'POPULAR' | 'NEWEST' | 'PRICE_LOW' | 'PRICE_HIGH' = 'POPULAR';

  // Category Header Data
  categoryTitle: string = 'Catalogue Optique & Solaires';
  categoryDescription: string = 'Découvrez l\'ensemble de nos montures haut de gamme, verres haute précision et lentilles de contact.';
  breadcrumbItems: { label: string; route?: string }[] = [
    { label: 'Accueil', route: '/' },
    { label: 'Catalogue' }
  ];

  // Current Active Route Path
  currentRoutePath: string = '/lunettes';

  // Filters State
  filters: FilterState = {
    searchQuery: '',
    gender: 'ALL',
    brand: 'ALL',
    shape: 'ALL',
    material: 'ALL',
    maxPrice: 1500,
    only3dAvailable: false,
    inStockOnly: false
  };

  selectedCategoryEnum: ProductCategory | 'ALL' = 'ALL';

  brandsList = ['Ray-Ban', 'Gucci', 'Tom Ford', 'Oakley', 'Persol', 'Air Optix', 'Prada', 'Chanel'];

  // Modal State
  selectedProductForModal: Product | null = null;
  selectedLensType: string = 'Verres Anti-Lumière Bleue';
  selectedLensPrice: number = 120;

  lensOptions = [
    { label: 'Verres Unifocaux Standard (Anti-Rayures)', price: 0 },
    { label: 'Verres Anti-Lumière Bleue (Écrans)', price: 120 },
    { label: 'Verres Progressifs Premium (Vision Totale)', price: 280 }
  ];

  constructor(
    private optiService: OptiVisionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.optiService.getProducts().subscribe(prods => {
      this.products = prods;
      this.applyFilters();
    });

    this.optiService.favoriteIds$.subscribe(ids => {
      this.favoriteIds = ids;
    });

    // Listen to route URL changes to set active category view
    this.route.url.subscribe(segments => {
      if (segments.length > 0) {
        const path = segments[0].path;
        this.currentRoutePath = '/' + path;
        this.updateCategoryFromPath(path);
      } else {
        this.currentRoutePath = '/lunettes';
        this.updateCategoryFromPath('lunettes');
      }
    });

    // Listen to Query Params (e.g. ?gender=HOMME&brand=Ray-Ban)
    this.route.queryParams.subscribe(params => {
      if (params['gender']) this.filters.gender = params['gender'];
      if (params['brand']) this.filters.brand = params['brand'];
      if (params['shape']) this.filters.shape = params['shape'];
      if (params['type']) {
        if (params['type'] === 'JOURNALIER' || params['type'] === 'MENSUEL') {
          this.selectedCategoryEnum = 'LENTILLES';
        }
      }
      this.applyFilters();
    });
  }

  private updateCategoryFromPath(path: string): void {
    if (path === 'lunettes-de-vue') {
      this.selectedCategoryEnum = 'LUNETTES_VUE';
      this.categoryTitle = 'Lunettes de Vue';
      this.categoryDescription = 'Montures de vue élégantes combinant précision optique suisse et matériaux nobles (titane, acétate).';
      this.breadcrumbItems = [{ label: 'Accueil', route: '/' }, { label: 'Lunettes de Vue' }];
    } else if (path === 'lunettes-de-soleil' || path === 'soleil') {
      this.selectedCategoryEnum = 'LUNETTES_SOLEIL';
      this.categoryTitle = 'Lunettes de Soleil';
      this.categoryDescription = 'Protégez votre regard avec nos collections solaires polarisées signées par les plus grandes maisons.';
      this.breadcrumbItems = [{ label: 'Accueil', route: '/' }, { label: 'Lunettes de Soleil' }];
    } else if (path === 'lentilles') {
      this.selectedCategoryEnum = 'LENTILLES';
      this.categoryTitle = 'Lentilles de Contact & Soins';
      this.categoryDescription = 'Lentilles mensuelles, journalières et solutions d\'entretien hydrogel pour un confort visuel 24h.';
      this.breadcrumbItems = [{ label: 'Accueil', route: '/' }, { label: 'Lentilles' }];
    } else if (path === 'accessoires') {
      this.selectedCategoryEnum = 'ACCESSOIRES';
      this.categoryTitle = 'Accessoires & Entretien';
      this.categoryDescription = 'Étuis rigides, sprays nettoyants microfibres et cordons haut de gamme pour vos lunettes.';
      this.breadcrumbItems = [{ label: 'Accueil', route: '/' }, { label: 'Accessoires' }];
    } else if (path === 'marques') {
      this.selectedCategoryEnum = 'ALL';
      this.categoryTitle = 'Maisons & Créateurs';
      this.categoryDescription = 'Découvrez l\'univers des plus grands créateurs de haute lunetterie internationale.';
      this.breadcrumbItems = [{ label: 'Accueil', route: '/' }, { label: 'Marques' }];
    } else {
      this.selectedCategoryEnum = 'ALL';
      this.categoryTitle = 'Toutes nos Montures Optiques & Solaires';
      this.categoryDescription = 'Explorez l\'ensemble du catalogue OptiVision et trouvez le modèle parfait adapté à votre visage.';
      this.breadcrumbItems = [{ label: 'Accueil', route: '/' }, { label: 'Catalogue' }];
    }
    this.applyFilters();
  }

  isFavorite(productId: number): boolean {
    return this.favoriteIds.includes(productId);
  }

  toggleFavorite(productId: number): void {
    this.optiService.toggleFavorite(productId);
  }

  toggleFilterPanel(): void {
    this.showFilterPanel = !this.showFilterPanel;
  }

  toggleMobileDrawer(): void {
    this.showMobileCategoryDrawer = !this.showMobileCategoryDrawer;
  }

  applyFilters(): void {
    let result = [...this.products];

    // Search Query
    if (this.filters.searchQuery.trim()) {
      const q = this.filters.searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.shape.toLowerCase().includes(q));
    }

    // Category Enum
    if (this.selectedCategoryEnum !== 'ALL') {
      result = result.filter(p => p.category === this.selectedCategoryEnum);
    }

    // Gender
    if (this.filters.gender !== 'ALL') {
      result = result.filter(p => p.gender === this.filters.gender || p.gender === 'UNISEX');
    }

    // Brand
    if (this.filters.brand !== 'ALL') {
      result = result.filter(p => p.brand.toLowerCase() === this.filters.brand.toLowerCase());
    }

    // Frame Shape
    if (this.filters.shape !== 'ALL') {
      result = result.filter(p => p.shape === this.filters.shape);
    }

    // Material
    if (this.filters.material !== 'ALL') {
      result = result.filter(p => p.material === this.filters.material);
    }

    // Max Price
    result = result.filter(p => p.priceTnd <= this.filters.maxPrice);

    // 3D Try-On filter
    if (this.filters.only3dAvailable) {
      result = result.filter(p => p.tryOn3dAvailable === true);
    }

    // In Stock filter
    if (this.filters.inStockOnly) {
      result = result.filter(p => p.inStock === true);
    }

    // Sorting
    if (this.sortBy === 'PRICE_LOW') {
      result.sort((a, b) => a.priceTnd - b.priceTnd);
    } else if (this.sortBy === 'PRICE_HIGH') {
      result.sort((a, b) => b.priceTnd - a.priceTnd);
    } else if (this.sortBy === 'NEWEST') {
      result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    } else {
      result.sort((a, b) => b.rating - a.rating);
    }

    this.filteredProducts = result;
  }

  onFilterChange(newFilters: FilterState): void {
    this.filters = { ...newFilters };
    this.applyFilters();
  }

  resetFilters(): void {
    this.filters = {
      searchQuery: '',
      gender: 'ALL',
      brand: 'ALL',
      shape: 'ALL',
      material: 'ALL',
      maxPrice: 1500,
      only3dAvailable: false,
      inStockOnly: false
    };
    this.sortBy = 'POPULAR';
    this.applyFilters();
  }

  openDetailModal(product: Product): void {
    this.selectedProductForModal = product;
  }

  closeDetailModal(): void {
    this.selectedProductForModal = null;
  }

  selectLens(option: { label: string; price: number }): void {
    this.selectedLensType = option.label;
    this.selectedLensPrice = option.price;
  }

  addToCart(product: Product): void {
    this.optiService.addToCart(product, {
      type: this.selectedLensType,
      index: '1.6 Anti-Reflet Ultra',
      priceTnd: this.selectedLensPrice
    });
    this.closeDetailModal();
  }
}
