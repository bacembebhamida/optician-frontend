import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StockService } from '../../services/stock.service';
import { StoreStockLocationSummary } from '../../models/stock.model';
import { StoreLocationCardComponent } from '../../components/store-location-card/store-location-card.component';

@Component({
  selector: 'app-stock-locations-page',
  standalone: true,
  imports: [CommonModule, StoreLocationCardComponent],
  template: `
    <div class="locations-page font-sans animate-fade-in">
      
      <div class="page-header mb-6">
        <div>
          <h1 class="page-title font-bold text-2xl text-slate-900">
            <i class="fa-solid fa-store text-amber-600 mr-2"></i> Inventaire Réseau par Magasin
          </h1>
          <p class="page-sub text-sm text-slate-500">Supervision multi-site de la répartition des stocks et des niveaux de réserve.</p>
        </div>
      </div>

      <!-- Store Locations Breakdown Grid -->
      <div class="locations-grid">
        <app-store-location-card 
          *ngFor="let loc of locations" 
          [location]="loc"
          [isSelected]="selectedStoreId === loc.storeId"
          (selectStore)="onSelectStore($event)">
        </app-store-location-card>
      </div>

    </div>
  `,
  styles: [`
    .locations-page { padding: 1.5rem; }
    .locations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }
  `]
})
export class StockLocationsPageComponent implements OnInit {
  locations: StoreStockLocationSummary[] = [];
  selectedStoreId: number | null = null;

  constructor(
    private stockService: StockService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.stockService.getStoreStockLocations().subscribe(locs => this.locations = locs);
  }

  onSelectStore(storeId: number): void {
    this.selectedStoreId = storeId;
    this.router.navigate(['/admin/stock/products'], { queryParams: { storeId } });
  }
}
