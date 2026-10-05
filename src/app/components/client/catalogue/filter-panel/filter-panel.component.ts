import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Gender, FrameShape, Material } from '../../../../models/optivision.models';

export interface FilterState {
  searchQuery: string;
  gender: Gender | 'ALL';
  brand: string;
  shape: FrameShape | 'ALL';
  material: Material | 'ALL';
  maxPrice: number;
  only3dAvailable: boolean;
  inStockOnly: boolean;
}

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.css']
})
export class FilterPanelComponent {

  @Input() filters: FilterState = {
    searchQuery: '',
    gender: 'ALL',
    brand: 'ALL',
    shape: 'ALL',
    material: 'ALL',
    maxPrice: 1200,
    only3dAvailable: false,
    inStockOnly: false
  };

  @Input() brandsList: string[] = ['Ray-Ban', 'Gucci', 'Tom Ford', 'Oakley', 'Persol', 'Air Optix', 'Prada'];

  @Output() filterChange = new EventEmitter<FilterState>();
  @Output() resetFilters = new EventEmitter<void>();

  onModelChange(): void {
    this.filterChange.emit(this.filters);
  }

  onReset(): void {
    this.resetFilters.emit();
  }
}
