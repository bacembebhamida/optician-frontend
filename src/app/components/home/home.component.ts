import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OptiVisionService } from '../../services/optivision.service';
import { Product, StyleCategory } from '../../models/optivision.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  featuredProducts: Product[] = [];
  selectedStyleFilter: StyleCategory | 'ALL' = 'ALL';
  selectedProductForModal: Product | null = null;
  favoriteIds: number[] = [];

  styleCategories: { name: StyleCategory; label: string; desc: string; icon: string }[] = [
    { name: 'MINIMALISTE', label: 'Minimaliste', desc: 'Finesse et titane épuré', icon: 'fa-solid fa-feather' },
    { name: 'CLASSIQUE', label: 'Classique', desc: 'Lignes intemporelles', icon: 'fa-solid fa-crown' },
    { name: 'MODERNE', label: 'Moderne', desc: 'Design contemporain', icon: 'fa-solid fa-wand-magic-sparkles' },
    { name: 'VINTAGE', label: 'Vintage', desc: 'Charme rétro iconique', icon: 'fa-solid fa-glasses' },
    { name: 'SPORT', label: 'Sport', desc: 'Résistance & Performance', icon: 'fa-solid fa-person-running' },
    { name: 'PREMIUM', label: 'Premium Luxury', desc: 'Matériaux rares & or', icon: 'fa-solid fa-gem' }
  ];

  constructor(public optiService: OptiVisionService) {}

  ngOnInit(): void {
    this.optiService.getProducts().subscribe(products => {
      this.featuredProducts = products;
    });

    this.optiService.favoriteIds$.subscribe(ids => {
      this.favoriteIds = ids;
    });
  }

  isFavorite(productId: number): boolean {
    return this.favoriteIds.includes(productId);
  }

  toggleFavorite(productId: number): void {
    this.optiService.toggleFavorite(productId);
  }

  addToCart(product: Product): void {
    this.optiService.addToCart(product);
  }

  openQuickView(product: Product): void {
    this.selectedProductForModal = product;
  }

  closeQuickView(): void {
    this.selectedProductForModal = null;
  }

  get filteredProducts(): Product[] {
    if (this.selectedStyleFilter === 'ALL') return this.featuredProducts;
    return this.featuredProducts.filter(p => p.style === this.selectedStyleFilter);
  }
}
