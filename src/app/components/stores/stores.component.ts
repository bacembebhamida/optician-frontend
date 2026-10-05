import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OptiVisionService } from '../../services/optivision.service';
import { OptiStore } from '../../models/optivision.models';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.css']
})
export class StoresComponent implements OnInit {

  stores: OptiStore[] = [];
  selectedStore: OptiStore | null = null;

  constructor(private optiService: OptiVisionService) {}

  ngOnInit(): void {
    this.optiService.getStores().subscribe(list => {
      this.stores = list;
      if (this.stores.length > 0) this.selectedStore = this.stores[0];
    });
  }

  selectStore(store: OptiStore): void {
    this.selectedStore = store;
  }
}
