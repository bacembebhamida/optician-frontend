import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OptiVisionService } from '../../../services/optivision.service';
import { Product, ProductCategory, Gender, FrameShape, Material } from '../../../models/optivision.models';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css']
})
export class CatalogueComponent implements OnInit {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading: boolean = false;
  favoriteIds: number[] = [];

  // Filter States
  searchQuery: string = '';
  selectedCategory: ProductCategory | 'ALL' = 'ALL';
  selectedGender: Gender | 'ALL' = 'ALL';
  selectedBrand: string = 'ALL';
  selectedShape: FrameShape | 'ALL' = 'ALL';
  selectedMaterial: Material | 'ALL' = 'ALL';
  maxPrice: number = 1000;
  sortBy: 'POPULAR' | 'NEWEST' | 'PRICE_LOW' | 'PRICE_HIGH' = 'POPULAR';

  brandsList = ['Ray-Ban', 'Gucci', 'Tom Ford', 'Oakley', 'Persol', 'Air Optix'];

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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.optiService.getProducts().subscribe(prods => {
      this.products = prods;
      this.applyFilters();
    });

    this.optiService.favoriteIds$.subscribe(ids => {
      this.favoriteIds = ids;
    });

    // Check route param or query param for category
    this.route.url.subscribe(segments => {
      if (segments.length > 0) {
        const path = segments[0].path;
        if (path === 'soleil') this.selectedCategory = 'LUNETTES_SOLEIL';
        else if (path === 'lentilles') this.selectedCategory = 'LENTILLES';
        else if (path === 'lunettes') this.selectedCategory = 'LUNETTES_VUE';
        this.applyFilters();
      }
    });
  }

  isFavorite(productId: number): boolean {
    return this.favoriteIds.includes(productId);
  }

  toggleFavorite(productId: number): void {
    this.optiService.toggleFavorite(productId);
  }

  applyFilters(): void {
    let result = [...this.products];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }

    if (this.selectedCategory !== 'ALL') {
      result = result.filter(p => p.category === this.selectedCategory);
    }

    if (this.selectedGender !== 'ALL') {
      result = result.filter(p => p.gender === this.selectedGender || p.gender === 'UNISEX');
    }

    if (this.selectedBrand !== 'ALL') {
      result = result.filter(p => p.brand.toLowerCase() === this.selectedBrand.toLowerCase());
    }

    if (this.selectedShape !== 'ALL') {
      result = result.filter(p => p.shape === this.selectedShape);
    }

    if (this.selectedMaterial !== 'ALL') {
      result = result.filter(p => p.material === this.selectedMaterial);
    }

    result = result.filter(p => p.priceTnd <= this.maxPrice);

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

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'ALL';
    this.selectedGender = 'ALL';
    this.selectedBrand = 'ALL';
    this.selectedShape = 'ALL';
    this.selectedMaterial = 'ALL';
    this.maxPrice = 1000;
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
      index: '1.6 Anti-Reflet',
      priceTnd: this.selectedLensPrice
    });
    this.closeDetailModal();
  }
}
