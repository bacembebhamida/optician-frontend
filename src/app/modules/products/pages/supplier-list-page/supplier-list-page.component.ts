import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Supplier {
  id: number;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  brands: string[];
  leadTimeDays: number;
  activeProductsCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 1,
    name: 'EssilorLuxottica International',
    code: 'SUP-LUX-01',
    contactPerson: 'Jean-Marc Dubois',
    email: 'orders.tn@essilorluxottica.com',
    phone: '+216 71 890 123',
    address: 'Les Berges du Lac 2, Tunis',
    brands: ['Ray-Ban', 'Oakley', 'Persol', 'Vogue Eyewear', 'Oliver Peoples'],
    leadTimeDays: 3,
    activeProductsCount: 142,
    status: 'ACTIVE'
  },
  {
    id: 2,
    name: 'Safilo Group Distribution',
    code: 'SUP-SAF-02',
    contactPerson: 'Sonia Ben Ali',
    email: 'contact.tn@safilogroup.com',
    phone: '+216 73 220 450',
    address: 'Zone Industrielle Akouda, Sousse',
    brands: ['Carrera', 'Tommy Hilfiger', 'Hugo Boss', 'Kate Spade'],
    leadTimeDays: 5,
    activeProductsCount: 88,
    status: 'ACTIVE'
  },
  {
    id: 3,
    name: 'Kering Eyewear North Africa',
    code: 'SUP-KER-03',
    contactPerson: 'Malek Hammami',
    email: 'kering.optics@kering.com',
    phone: '+216 71 960 700',
    address: 'Immeuble Zéphyr, Marsa Nassim',
    brands: ['Gucci', 'Saint Laurent', 'Bottega Veneta', 'Alexander McQueen'],
    leadTimeDays: 7,
    activeProductsCount: 54,
    status: 'ACTIVE'
  },
  {
    id: 4,
    name: 'Marcolin Eyewear Tunisia',
    code: 'SUP-MAR-04',
    contactPerson: 'Yassine Khelil',
    email: 'distribution@marcolin.tn',
    phone: '+216 74 400 112',
    address: 'Route de Téniour Km 3, Sfax',
    brands: ['Tom Ford', 'Guess', 'Swarovski', 'Diesel'],
    leadTimeDays: 4,
    activeProductsCount: 61,
    status: 'ACTIVE'
  }
];

@Component({
  selector: 'app-supplier-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="suppliers-page font-sans animate-fade-in p-6">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">
            <i class="fa-solid fa-truck-field text-amber-600 mr-2"></i> Fournisseurs Optiques
          </h1>
          <p class="text-sm text-slate-500">Gestion des marques, contacts directes et délais d'approvisionnement.</p>
        </div>

        <button (click)="showModal = true" class="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow hover:bg-slate-800">
          <i class="fa-solid fa-plus mr-1"></i> Nouveau Fournisseur
        </button>
      </div>

      <!-- KPI Summary -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
          <span class="text-xs font-bold text-slate-500 uppercase">Total Fournisseurs</span>
          <div class="text-2xl font-bold text-slate-900 mt-1">{{ suppliers.length }}</div>
        </div>

        <div class="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
          <span class="text-xs font-bold text-slate-500 uppercase">Fournisseurs Actifs</span>
          <div class="text-2xl font-bold text-emerald-600 mt-1">{{ countActive() }}</div>
        </div>

        <div class="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
          <span class="text-xs font-bold text-slate-500 uppercase">Délai Moyen Livraison</span>
          <div class="text-2xl font-bold text-amber-700 mt-1">4.7 <small class="text-xs text-slate-600">Jours</small></div>
        </div>

        <div class="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
          <span class="text-xs font-bold text-slate-500 uppercase">Catalogue Référencé</span>
          <div class="text-2xl font-bold text-blue-600 mt-1">345 <small class="text-xs text-slate-600">Références</small></div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="bg-white p-4 border border-slate-200 rounded-2xl mb-6 flex gap-4">
        <div class="flex-1 relative">
          <i class="fa-solid fa-search absolute left-3 top-3 text-slate-400 text-sm"></i>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Rechercher par nom, code ou marque distribuée..." 
            class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-amber-600">
        </div>
      </div>

      <!-- Suppliers Grid Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div *ngFor="let s of filteredSuppliers" class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-3">
            <div>
              <span class="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{{ s.code }}</span>
              <h3 class="text-lg font-bold text-slate-900 mt-1">{{ s.name }}</h3>
              <p class="text-xs text-slate-500"><i class="fa-solid fa-location-dot"></i> {{ s.address }}</p>
            </div>

            <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
              ● Actif
            </span>
          </div>

          <div class="border-t border-slate-100 pt-3 mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-slate-400 block">Contact Principal</span>
              <span class="font-semibold text-slate-800">{{ s.contactPerson }}</span>
            </div>

            <div>
              <span class="text-slate-400 block">Délai Réapprovisionnement</span>
              <span class="font-mono font-bold text-slate-900">{{ s.leadTimeDays }} Jours Ouvrés</span>
            </div>

            <div class="col-span-2">
              <span class="text-slate-400 block mb-1">Marques Sous Licence</span>
              <div class="flex flex-wrap gap-1">
                <span *ngFor="let b of s.brands" class="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-xs">
                  {{ b }}
                </span>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-xs">
            <span class="text-slate-500 font-mono"><i class="fa-solid fa-box"></i> <strong>{{ s.activeProductsCount }}</strong> montures en catalogue</span>
            <div class="flex gap-2">
              <a [href]="'mailto:' + s.email" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs">
                <i class="fa-solid fa-envelope"></i> Contacter
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .suppliers-page { min-height: 100vh; background: #F8FAFC; }
  `]
})
export class SupplierListPageComponent implements OnInit {
  suppliers: Supplier[] = MOCK_SUPPLIERS;
  searchQuery: string = '';
  showModal: boolean = false;

  ngOnInit(): void {}

  get filteredSuppliers(): Supplier[] {
    if (!this.searchQuery) return this.suppliers;
    const q = this.searchQuery.toLowerCase();
    return this.suppliers.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.brands.some(b => b.toLowerCase().includes(q))
    );
  }

  countActive(): number {
    return this.suppliers.filter(s => s.status === 'ACTIVE').length;
  }
}
