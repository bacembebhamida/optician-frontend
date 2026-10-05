import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-import-products-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="modal-backdrop animate-fade-in">
      <div class="modal-card">
        
        <!-- Modal Header -->
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <h3 class="font-bold text-lg text-slate-900">
            <i class="fa-solid fa-file-import text-amber-600 mr-2"></i> Importer Catalogue Produit (CSV / Excel)
          </h3>
          <button (click)="close()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>

        <!-- Step 1: File Selection -->
        <div *ngIf="!isImporting && !isCompleted">
          <div class="drop-zone" (drop)="onFileDrop($event)" (dragover)="$event.preventDefault()">
            <i class="fa-solid fa-cloud-arrow-up text-3xl text-amber-600 mb-2"></i>
            <p class="font-bold text-slate-800 text-sm">Glissez-déposez votre fichier CSV ou XLSX ici</p>
            <p class="text-xs text-slate-400 mt-1">Colonnes requises: SKU, Nom, Marque, Categorie, PrixVente, StockInitial</p>

            <input type="file" #fileInput (change)="onFileSelected($event)" accept=".csv,.xlsx,.xls" class="hidden">
            <button (click)="fileInput.click()" class="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow">
              Sélectionner un Fichier
            </button>
          </div>

          <div *ngIf="selectedFile" class="mt-4 p-3 bg-slate-50 border rounded-xl flex justify-between items-center text-xs">
            <span class="font-semibold text-slate-800"><i class="fa-solid fa-file-csv mr-1 text-emerald-600"></i> {{ selectedFile.name }}</span>
            <span class="text-slate-500 font-mono">{{ (selectedFile.size / 1024) | number:'1.0-1' }} KB</span>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <button (click)="close()" class="px-4 py-2 border rounded-xl text-xs font-semibold">Annuler</button>
            <button 
              (click)="startImport()" 
              [disabled]="!selectedFile"
              class="px-5 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow disabled:opacity-50">
              Lancer l'Importation
            </button>
          </div>
        </div>

        <!-- Step 2: Live Progress -->
        <div *ngIf="isImporting" class="py-6 text-center">
          <div class="text-amber-600 text-4xl mb-3 animate-spin inline-block">
            <i class="fa-solid fa-circle-notch"></i>
          </div>

          <h4 class="font-bold text-slate-900 text-base mb-1">Importation du Catalogue en Cours...</h4>
          <p class="text-xs text-slate-500 mb-4">Ne fermez pas cette fenêtre pendant le traitement des lignes.</p>

          <div class="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
            <div class="bg-amber-600 h-full transition-all duration-300" [style.width.%]="progressPercent"></div>
          </div>

          <div class="grid grid-cols-3 gap-2 text-xs font-mono">
            <div class="bg-slate-50 p-2 rounded-lg border">
              <span class="text-slate-400 block">Traitées</span>
              <span class="font-bold text-slate-900">{{ processedLines }} / {{ totalLines }}</span>
            </div>

            <div class="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
              <span class="text-emerald-700 block">Créés</span>
              <span class="font-bold text-emerald-800">{{ createdCount }}</span>
            </div>

            <div class="bg-red-50 p-2 rounded-lg border border-red-200">
              <span class="text-red-700 block">Erreurs</span>
              <span class="font-bold text-red-800">{{ errorCount }}</span>
            </div>
          </div>
        </div>

        <!-- Step 3: Success Summary -->
        <div *ngIf="isCompleted" class="py-4 text-center">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mx-auto mb-3">
            <i class="fa-solid fa-check"></i>
          </div>

          <h4 class="font-bold text-slate-900 text-base mb-1">Importation Terminée !</h4>
          <p class="text-xs text-slate-500 mb-4">Le catalogue a été mis à jour avec succès.</p>

          <div class="bg-slate-50 p-3 rounded-xl border text-xs font-mono mb-6 text-left">
            <p class="text-emerald-700 font-bold mb-1">✓ {{ createdCount }} nouveaux produits importés</p>
            <p *ngIf="errorCount > 0" class="text-red-600 font-bold">⚠️ {{ errorCount }} lignes ignorées (doublons ou formats invalides)</p>
          </div>

          <button (click)="finish()" class="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow">
            Fermer &amp; Actualiser
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-card {
      background: white;
      padding: 1.5rem;
      border-radius: 20px;
      width: 100%; max-width: 480px;
    }
    .drop-zone {
      border: 2px dashed #CBD5E1;
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      background: #F8FAFC;
    }
  `]
})
export class ImportProductsModalComponent {
  @Input() isOpen: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onImportComplete = new EventEmitter<void>();

  selectedFile: File | null = null;
  isImporting: boolean = false;
  isCompleted: boolean = false;

  progressPercent: number = 0;
  processedLines: number = 0;
  totalLines: number = 50;
  createdCount: number = 0;
  errorCount: number = 0;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files[0]) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  startImport(): void {
    if (!this.selectedFile) return;
    this.isImporting = true;
    this.progressPercent = 0;
    this.processedLines = 0;
    this.createdCount = 0;
    this.errorCount = 0;

    const interval = setInterval(() => {
      this.processedLines += 5;
      this.progressPercent = Math.min(100, Math.round((this.processedLines / this.totalLines) * 100));
      this.createdCount += 4;
      if (this.processedLines % 15 === 0) this.errorCount += 1;

      if (this.processedLines >= this.totalLines) {
        clearInterval(interval);
        this.isImporting = false;
        this.isCompleted = true;
      }
    }, 200);
  }

  close(): void {
    this.onClose.emit();
  }

  finish(): void {
    this.isCompleted = false;
    this.selectedFile = null;
    this.onImportComplete.emit();
    this.close();
  }
}
