import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Product, ProductCategory, ProductType, Gender, FrameShape, Material, LensType, ProductStatus } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Brand } from '../../models/brand.model';
import { CategoryService } from '../../services/category.service';
import { BrandService } from '../../services/brand.service';
import { ProductImagesComponent } from '../product-images/product-images.component';
import { ProductVariantsComponent } from '../product-variants/product-variants.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProductImagesComponent, ProductVariantsComponent],
  template: `
    <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="product-form-container">
      
      <!-- Sticky Actions Bar -->
      <div class="sticky-form-header">
        <div>
          <h2 class="form-title">{{ isEditMode ? 'Modifier la Fiche Produit' : 'Nouveau Produit au Catalogue' }}</h2>
          <p class="form-subtitle">Formulaire ERP structuré avec validation temps réel et calcul de marge.</p>
        </div>
        <div class="form-header-actions">
          <button type="button" (click)="onCancel.emit()" class="btn-secondary">Annuler</button>
          <button type="submit" [disabled]="isSubmitting" class="btn-primary-save">
            <i class="fa-solid" [class.fa-spinner]="isSubmitting" [class.fa-spin]="isSubmitting" [class.fa-floppy-disk]="!isSubmitting"></i>
            <span>{{ isSubmitting ? 'Enregistrement...' : 'Enregistrer le Produit' }}</span>
          </button>
        </div>
      </div>

      <!-- Backend HTTP Error Alert Box (if present) -->
      <div *ngIf="backendError" class="backend-error-alert animate-fade-in" role="alert">
        <i class="fa-solid fa-circle-xmark alert-icon"></i>
        <div>
          <strong>Erreur de validation serveur :</strong>
          <p>{{ backendError }}</p>
        </div>
      </div>

      <!-- Section 1: Informations Générales -->
      <div class="form-card-section">
        <div class="section-title-row">
          <div class="step-num font-bold">1</div>
          <div>
            <h3 class="section-heading">Informations Générales</h3>
            <p class="section-sub">Nom, SKU, code-barres, marque, catégorie et classification.</p>
          </div>
        </div>

        <div class="fields-grid-3">
          
          <!-- Name -->
          <div class="field-group col-span-2">
            <label for="name" class="field-label">Nom du Produit *</label>
            <input id="name"
                   type="text"
                   formControlName="name"
                   placeholder="Ex: Ray-Ban RX5228 Optical High-Density"
                   class="form-input"
                   [class.is-invalid]="isFieldInvalid('name')">
            <div *ngIf="isFieldInvalid('name')" class="field-error-msg">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>Le nom du produit est obligatoire (min. 3 caractères).</span>
            </div>
          </div>

          <!-- Brand -->
          <div class="field-group">
            <label for="brandId" class="field-label">Marque *</label>
            <select id="brandId"
                    formControlName="brandId"
                    class="form-select"
                    (change)="onBrandSelected($event)"
                    [class.is-invalid]="isFieldInvalid('brandId')">
              <option [value]="null" disabled>Sélectionner une marque</option>
              <option *ngFor="let b of brands" [value]="b.id">{{ b.name }}</option>
            </select>
            <div *ngIf="isFieldInvalid('brandId')" class="field-error-msg">
              <span>Sélectionnez une marque.</span>
            </div>
          </div>

          <!-- SKU -->
          <div class="field-group">
            <label for="sku" class="field-label">Code Référence SKU *</label>
            <input id="sku"
                   type="text"
                   formControlName="sku"
                   placeholder="Ex: RB-5228-2000-53"
                   class="form-input font-mono"
                   [class.is-invalid]="isFieldInvalid('sku')">
            <div *ngIf="isFieldInvalid('sku')" class="field-error-msg">
              <span>SKU valide requis (ex: RB-5228-2000-53).</span>
            </div>
          </div>

          <!-- Barcode -->
          <div class="field-group">
            <label for="barcode" class="field-label">Code-Barres (EAN-13 / UPC) *</label>
            <input id="barcode"
                   type="text"
                   formControlName="barcode"
                   placeholder="Ex: 805289307883"
                   class="form-input font-mono"
                   [class.is-invalid]="isFieldInvalid('barcode')">
            <div *ngIf="isFieldInvalid('barcode')" class="field-error-msg">
              <span>Code-barres valide requis (8 à 18 caractères).</span>
            </div>
          </div>

          <!-- Type -->
          <div class="field-group">
            <label for="type" class="field-label">Type de Produit *</label>
            <select id="type" formControlName="type" class="form-select">
              <option value="MONTURE">Monture</option>
              <option value="VERRE">Verre</option>
              <option value="LENTILLE_CONTACT">Lentille de contact</option>
              <option value="PRODUIT_ENTRETIEN">Produit d'entretien</option>
              <option value="ACCESSOIRE">Accessoire</option>
            </select>
          </div>

          <!-- Category -->
          <div class="field-group">
            <label for="category" class="field-label">Catégorie Principale *</label>
            <select id="category" formControlName="category" class="form-select">
              <option value="LUNETTES_VUE">Lunettes de vue</option>
              <option value="LUNETTES_SOLEIL">Lunettes de soleil</option>
              <option value="LUNETTES_ENFANT">Lunettes enfant</option>
              <option value="LENTILLES">Lentilles</option>
              <option value="ACCESSOIRES">Accessoires</option>
            </select>
          </div>

          <!-- Sub-Category -->
          <div class="field-group">
            <label for="subCategory" class="field-label">Sous-Catégorie</label>
            <input id="subCategory" type="text" formControlName="subCategory" placeholder="Ex: Montures Homme" class="form-input">
          </div>

          <!-- Model & Collection -->
          <div class="field-group">
            <label for="model" class="field-label">Modèle *</label>
            <input id="model" type="text" formControlName="model" placeholder="Ex: RX 5228" class="form-input" [class.is-invalid]="isFieldInvalid('model')">
          </div>

          <div class="field-group">
            <label for="collection" class="field-label">Collection</label>
            <input id="collection" type="text" formControlName="collection" placeholder="Ex: Icons Heritage 2026" class="form-input">
          </div>

          <div class="field-group">
            <label for="gender" class="field-label">Genre Cible</label>
            <select id="gender" formControlName="gender" class="form-select">
              <option value="UNISEX">Mixte / Unisex</option>
              <option value="HOMME">Homme</option>
              <option value="FEMME">Femme</option>
              <option value="ENFANT">Enfant</option>
            </select>
          </div>

          <!-- Status -->
          <div class="field-group">
            <label for="status" class="field-label">Statut Catalogue</label>
            <select id="status" formControlName="status" class="form-select font-bold">
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
              <option value="BROUILLON">Brouillon</option>
            </select>
          </div>

          <!-- Description -->
          <div class="field-group col-span-full">
            <label for="description" class="field-label">Description du Produit</label>
            <textarea id="description" formControlName="description" rows="3" placeholder="Rédigez la description détaillée..." class="form-textarea"></textarea>
          </div>

        </div>
      </div>

      <!-- Section 2: Spécifications Commerciales (Commercial & Calculated Margins) -->
      <div class="form-card-section" formGroupName="commercial">
        <div class="section-title-row">
          <div class="step-num font-bold">2</div>
          <div>
            <h3 class="section-heading">Spécifications Commerciales &amp; Prix</h3>
            <p class="section-sub">Prix d'achat, prix de vente, TVA et calcul de la marge commerciale.</p>
          </div>
        </div>

        <div class="fields-grid-4">
          
          <!-- Purchase Price -->
          <div class="field-group">
            <label for="purchasePriceTnd" class="field-label">Prix d'Achat HT (DT) *</label>
            <input id="purchasePriceTnd"
                   type="number"
                   step="0.001"
                   min="0"
                   formControlName="purchasePriceTnd"
                   (input)="calculateMargin()"
                   placeholder="220.000"
                   class="form-input font-mono"
                   [class.is-invalid]="isFieldInvalid('commercial.purchasePriceTnd')">
            <div *ngIf="isFieldInvalid('commercial.purchasePriceTnd')" class="field-error-msg">
              <span>Prix d'achat positif requis.</span>
            </div>
          </div>

          <!-- Selling Price -->
          <div class="field-group">
            <label for="sellingPriceTnd" class="field-label">Prix de Vente TTC (DT) *</label>
            <input id="sellingPriceTnd"
                   type="number"
                   step="0.001"
                   min="0"
                   formControlName="sellingPriceTnd"
                   (input)="calculateMargin()"
                   placeholder="450.000"
                   class="form-input font-mono font-bold text-slate-900"
                   [class.is-invalid]="isFieldInvalid('commercial.sellingPriceTnd')">
            <div *ngIf="isFieldInvalid('commercial.sellingPriceTnd')" class="field-error-msg">
              <span>Prix de vente positif requis.</span>
            </div>
          </div>

          <!-- VAT Rate -->
          <div class="field-group">
            <label for="vatRate" class="field-label">Taux TVA (%)</label>
            <select id="vatRate" formControlName="vatRate" (change)="calculateMargin()" class="form-select font-mono">
              <option [value]="19">19% (Standard)</option>
              <option [value]="7">7% (Taux réduit santé)</option>
              <option [value]="0">0% (Exonéré)</option>
            </select>
          </div>

          <!-- Live Margin Calculation Box -->
          <div class="field-group col-span-full bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
            <div>
              <span class="text-xs text-slate-400 font-bold uppercase tracking-wider block">Marge Brute Calculée</span>
              <span class="text-2xl font-mono font-bold text-amber-400">{{ calculatedMarginTnd | number:'1.3-3' }} DT</span>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-400 font-bold uppercase tracking-wider block">Taux de Marge (%)</span>
              <span class="text-xl font-mono font-bold" [class.text-emerald-400]="calculatedMarginPercentage >= 40" [class.text-amber-400]="calculatedMarginPercentage < 40 && calculatedMarginPercentage >= 20" [class.text-red-400]="calculatedMarginPercentage < 20">
                {{ calculatedMarginPercentage | number:'1.1-1' }}%
              </span>
            </div>
          </div>

        </div>
      </div>

      <!-- Section 3: Caractéristiques Optiques -->
      <div class="form-card-section" formGroupName="optical">
        <div class="section-title-row">
          <div class="step-num font-bold">3</div>
          <div>
            <h3 class="section-heading">Spécifications Optiques &amp; Dimensions</h3>
            <p class="section-sub">Forme, matériau, dimensions du pont, branches, verres, UV et polarisation.</p>
          </div>
        </div>

        <div class="fields-grid-4">
          
          <!-- Shape -->
          <div class="field-group">
            <label for="shape" class="field-label">Forme de Monture *</label>
            <select id="shape" formControlName="shape" class="form-select">
              <option value="RECTANGLE">Rectangle</option>
              <option value="CARRE">Carré</option>
              <option value="ROND">Rond</option>
              <option value="OVALE">Ovale</option>
              <option value="AVIATEUR">Aviateur</option>
              <option value="PAPILLON">Papillon / Cat-Eye</option>
              <option value="OCTOGONALE">Octogonale</option>
              <option value="PANTO">Panto</option>
            </select>
          </div>

          <!-- Material -->
          <div class="field-group">
            <label for="material" class="field-label">Matériau Principale *</label>
            <select id="material" formControlName="material" class="form-select">
              <option value="ACETATE">Acétate</option>
              <option value="TITANE">Titane</option>
              <option value="METAL">Métal</option>
              <option value="BOIS">Bois</option>
              <option value="INJECTE">Injecté</option>
              <option value="COMBINE">Combiné</option>
              <option value="CARBONE">Fibre de Carbone</option>
            </select>
          </div>

          <!-- Color -->
          <div class="field-group col-span-2">
            <label for="color" class="field-label">Couleur Principale *</label>
            <input id="color" type="text" formControlName="color" placeholder="Ex: Noir Brillant / Havane Inner" class="form-input">
          </div>

          <!-- Dimensions: Width, Height, Bridge, Temple -->
          <div class="field-group">
            <label for="widthMm" class="field-label">Largeur Verre (mm) *</label>
            <input id="widthMm" type="number" formControlName="widthMm" placeholder="53" class="form-input font-mono" [class.is-invalid]="isFieldInvalid('optical.widthMm')">
          </div>

          <div class="field-group">
            <label for="heightMm" class="field-label">Hauteur Verre (mm) *</label>
            <input id="heightMm" type="number" formControlName="heightMm" placeholder="38" class="form-input font-mono" [class.is-invalid]="isFieldInvalid('optical.heightMm')">
          </div>

          <div class="field-group">
            <label for="bridgeMm" class="field-label">Largeur Pont (mm) *</label>
            <input id="bridgeMm" type="number" formControlName="bridgeMm" placeholder="17" class="form-input font-mono" [class.is-invalid]="isFieldInvalid('optical.bridgeMm')">
          </div>

          <div class="field-group">
            <label for="templeLengthMm" class="field-label">Longueur Branches (mm) *</label>
            <input id="templeLengthMm" type="number" formControlName="templeLengthMm" placeholder="140" class="form-input font-mono" [class.is-invalid]="isFieldInvalid('optical.templeLengthMm')">
          </div>

          <!-- Lens Type & Checkboxes -->
          <div class="field-group">
            <label for="lensType" class="field-label">Type de Verre Associé</label>
            <select id="lensType" formControlName="lensType" class="form-select">
              <option value="UNIFOCAL">Unifocal</option>
              <option value="PROGRESSIF">Progressif</option>
              <option value="SOLAIRE">Solaire</option>
              <option value="ANTI_LUMIERE_BLEUE">Anti-Lumière Bleue</option>
              <option value="PHOTOCHROMIQUE">Photochromique</option>
              <option value="SANS_VERRE">Sans verre (Monture seule)</option>
            </select>
          </div>

          <div class="field-group col-span-3 flex items-center gap-6 mt-6">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="uvProtection" class="checkbox-input">
              <span><i class="fa-solid fa-sun text-amber-500"></i> Protection UV400 intégrée</span>
            </label>

            <label class="checkbox-label">
              <input type="checkbox" formControlName="polarized" class="checkbox-input">
              <span><i class="fa-solid fa-wand-magic-sparkles text-blue-500"></i> Verres Polarisés</span>
            </label>
          </div>

        </div>
      </div>

      <!-- Section 4: Upload Images (MinIO/S3 Ready Component) -->
      <div class="form-card-section">
        <div class="section-title-row">
          <div class="step-num font-bold">4</div>
          <div>
            <h3 class="section-heading">Galerie d'Images &amp; Visuels</h3>
            <p class="section-sub">Téléversement, image principale, ordre d'affichage et prévisualisation.</p>
          </div>
        </div>

        <app-product-images [(images)]="imagesList" (fileUploaded)="onImagesUploaded($event)"></app-product-images>
      </div>

      <!-- Section 5: Variantes & Déclinaisons -->
      <div class="form-card-section">
        <div class="section-title-row">
          <div class="step-num font-bold">5</div>
          <div>
            <h3 class="section-heading">Variantes de Couleur &amp; Tailles</h3>
            <p class="section-sub">Gestion des déclinaisons avec SKU et codes-barres dédiés.</p>
          </div>
        </div>

        <app-product-variants [(variants)]="variantsList"></app-product-variants>
      </div>

      <!-- Section 6: Modélisation 3D & Essayage Virtuel -->
      <div class="form-card-section bg-slate-900 text-white rounded-2xl p-6 space-y-6">
        <div class="section-title-row border-slate-800 pb-4">
          <div class="step-num font-bold bg-amber-500 text-slate-950">6</div>
          <div>
            <h3 class="section-heading text-white flex items-center gap-2">
              <i class="fa-solid fa-cube text-amber-400"></i> Modélisation 3D &amp; Essayage Virtuel Gratuit
            </h3>
            <p class="section-sub text-slate-400">Génération automatique du maillage 3D pour l'essayage en réalité augmentée.</p>
          </div>
        </div>

        <div formGroupName="model3d" class="space-y-6">
          <div class="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div class="space-y-1">
              <label class="checkbox-label text-white">
                <input type="checkbox" formControlName="tryOn3dAvailable" class="checkbox-input accent-amber-500">
                <span class="text-base font-bold">Activer le modèle 3D pour l'essayage virtuel client</span>
              </label>
              <p class="text-xs text-slate-400 ml-6">Une fois activée, cette paire de lunettes sera essayable en direct par les utilisateurs connectés.</p>
            </div>
            <span class="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono px-3 py-1 rounded-full">
              <i class="fa-solid fa-wand-magic-sparkles mr-1"></i> IA 3D Ready
            </span>
          </div>

          <div *ngIf="productForm.get('model3d.tryOn3dAvailable')?.value" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="field-label text-slate-300">Mode de Modélisation 3D</label>
                <select formControlName="mode" class="form-select bg-slate-800 text-white border-slate-700">
                  <option value="AUTO">Génération IA Automatique (Basée sur forme & dimensions)</option>
                  <option value="CUSTOM">Importation Fichier 3D (.glb / .gltf)</option>
                </select>
              </div>

              <div *ngIf="productForm.get('model3d.mode')?.value === 'CUSTOM'">
                <label class="field-label text-slate-300">URL du Fichier 3D (.glb / .gltf)</label>
                <input type="text" formControlName="model3dUrl" placeholder="https://cdn.optivision.tn/models/rayban-5228.glb" class="form-input bg-slate-800 text-white border-slate-700 font-mono text-xs">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="field-label text-slate-300">Teinte des Verres 3D</label>
                  <select formControlName="lensTint" class="form-select bg-slate-800 text-white border-slate-700">
                    <option value="CLEAR">Translucide Optique</option>
                    <option value="BLUE_LIGHT">Reflet Anti-Lumière Bleue</option>
                    <option value="SMOKE_SUN">Solaire Fumé Cat. 3</option>
                    <option value="GOLD_MIRROR">Solaire Miroir Doré</option>
                  </select>
                </div>
                <div>
                  <label class="field-label text-slate-300">Couleur Châssis 3D</label>
                  <input type="text" formControlName="frameColor3d" placeholder="Ex: #111827 ou Noir Mat" class="form-input bg-slate-800 text-white border-slate-700 text-xs">
                </div>
              </div>
            </div>

            <!-- Live 3D Canvas Preview -->
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[180px] relative">
              <span class="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-mono text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                Prévisualisation 3D Temps Réel
              </span>
              
              <svg width="220" height="100" viewBox="0 0 220 100" class="mt-4 filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
                <!-- Bridge -->
                <path d="M 90 45 Q 110 38 130 45" stroke="#D4AF37" stroke-width="4" fill="none" />
                <!-- Left Lens Frame -->
                <rect x="25" y="30" width="65" height="42" rx="14" ry="14" fill="rgba(255,255,255,0.15)" stroke="#D4AF37" stroke-width="4" />
                <!-- Right Lens Frame -->
                <rect x="130" y="30" width="65" height="42" rx="14" ry="14" fill="rgba(255,255,255,0.15)" stroke="#D4AF37" stroke-width="4" />
                <!-- Left Lens Reflection -->
                <path d="M 35 36 L 55 36 L 40 65 L 30 65 Z" fill="rgba(255,255,255,0.3)" />
                <!-- Right Lens Reflection -->
                <path d="M 140 36 L 160 36 L 145 65 L 135 65 Z" fill="rgba(255,255,255,0.3)" />
                <!-- Temples -->
                <line x1="25" y1="42" x2="5" y2="40" stroke="#D4AF37" stroke-width="4" />
                <line x1="195" y1="42" x2="215" y2="40" stroke="#D4AF37" stroke-width="4" />
              </svg>

              <p class="text-[11px] text-slate-400 mt-2 font-mono">Modèle 3D optimisé prêt pour la caméra RA</p>
            </div>
          </div>
        </div>
      </div>

    </form>
  `,
  styles: [`
    .product-form-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .sticky-form-header {
      position: sticky;
      top: 70px;
      z-index: 90;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(12px);
      padding: 1rem 1.5rem;
      border-radius: 16px;
      border: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .form-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0F172A;
    }
    .form-subtitle {
      font-size: 0.8rem;
      color: #64748B;
    }
    .form-header-actions {
      display: flex;
      gap: 0.75rem;
    }
    .btn-secondary {
      padding: 0.6rem 1.2rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      cursor: pointer;
    }
    .btn-primary-save {
      padding: 0.6rem 1.4rem;
      font-size: 0.875rem;
      font-weight: 700;
      color: #FFFFFF;
      background: #C5A880;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 16px rgba(197, 168, 128, 0.35);
    }
    .btn-primary-save:disabled { opacity: 0.6; cursor: not-allowed; }

    .backend-error-alert {
      background: #FEF2F2;
      border: 1px solid #FCA5A5;
      color: #991B1B;
      padding: 1rem 1.25rem;
      border-radius: 14px;
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      font-size: 0.9rem;
    }
    .alert-icon { font-size: 1.3rem; margin-top: 0.1rem; }

    .form-card-section {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 4px 16px rgba(17, 24, 39, 0.02);
    }
    .section-title-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #F1F5F9;
    }
    .step-num {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #1E293B;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }
    .section-heading {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0F172A;
    }
    .section-sub {
      font-size: 0.8rem;
      color: #64748B;
    }

    .fields-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }
    .fields-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .field-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: #334155;
    }
    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 0.65rem 0.9rem;
      font-size: 0.875rem;
      font-family: inherit;
      color: #0F172A;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      outline: none;
      transition: all 0.2s ease;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: #C5A880;
      box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.15);
    }
    .form-input.is-invalid, .form-select.is-invalid {
      border-color: #EF4444;
      background: #FEF2F2;
    }
    .field-error-msg {
      font-size: 0.75rem;
      color: #DC2626;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-weight: 600;
      margin-top: 0.15rem;
    }

    .checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 700;
      color: #1E293B;
      cursor: pointer;
    }
    .checkbox-input {
      width: 18px;
      height: 18px;
      accent-color: #C5A880;
      cursor: pointer;
    }

    @media (max-width: 900px) {
      .fields-grid-3, .fields-grid-4 {
        grid-template-columns: 1fr;
      }
      .col-span-2, .col-span-3, .col-span-full {
        grid-column: span 1 !important;
      }
    }
  `]
})
export class ProductFormComponent implements OnInit {
  @Input() initialProduct?: Product;
  @Input() isEditMode: boolean = false;
  @Input() backendError?: string;
  @Input() isSubmitting: boolean = false;

  @Output() formSubmit = new EventEmitter<Partial<Product>>();
  @Output() onCancel = new EventEmitter<void>();

  productForm!: FormGroup;
  brands: Brand[] = [];
  categories: Category[] = [];

  imagesList: Product['images'] = [];
  variantsList: Product['variants'] = [];

  calculatedMarginTnd: number = 0;
  calculatedMarginPercentage: number = 0;

  constructor(
    private fb: FormBuilder,
    private brandService: BrandService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.brandService.getBrands().subscribe(b => this.brands = b);
    this.categoryService.getCategories().subscribe(c => this.categories = c);

    if (this.initialProduct) {
      this.populateForm(this.initialProduct);
    }
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      sku: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\-_]{3,30}$/i)]],
      barcode: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{8,18}$/i)]],
      brandId: [null, [Validators.required]],
      brandName: [''],
      type: ['MONTURE', [Validators.required]],
      category: ['LUNETTES_VUE', [Validators.required]],
      subCategory: [''],
      model: ['', [Validators.required]],
      collection: [''],
      gender: ['UNISEX'],
      status: ['ACTIF', [Validators.required]],
      description: [''],

      commercial: this.fb.group({
        purchasePriceTnd: [100, [Validators.required, Validators.min(0.001)]],
        sellingPriceTnd: [200, [Validators.required, Validators.min(0.001)]],
        vatRate: [19],
        marginTnd: [100],
        marginPercentage: [50]
      }),

      optical: this.fb.group({
        shape: ['RECTANGLE', [Validators.required]],
        material: ['ACETATE', [Validators.required]],
        color: ['Noir', [Validators.required]],
        widthMm: [52, [Validators.required, Validators.min(1)]],
        heightMm: [40, [Validators.required, Validators.min(1)]],
        bridgeMm: [18, [Validators.required, Validators.min(1)]],
        templeLengthMm: [140, [Validators.required, Validators.min(1)]],
        lensType: ['UNIFOCAL'],
        uvProtection: [true],
        polarized: [false]
      }),

      model3d: this.fb.group({
        tryOn3dAvailable: [true],
        mode: ['AUTO'],
        model3dUrl: [''],
        lensTint: ['BLUE_LIGHT'],
        frameColor3d: ['Noir Mat']
      })
    });

    this.calculateMargin();
  }

  private populateForm(p: Product): void {
    this.productForm.patchValue({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      brandId: p.brandId,
      brandName: p.brandName,
      type: p.type,
      category: p.category,
      subCategory: p.subCategory,
      model: p.model,
      collection: p.collection,
      gender: p.gender,
      status: p.status,
      description: p.description,
      commercial: { ...p.commercial },
      optical: { ...p.optical },
      model3d: {
        tryOn3dAvailable: p.tryOn3dAvailable ?? true,
        mode: p.model3dUrl ? 'CUSTOM' : 'AUTO',
        model3dUrl: p.model3dUrl || '',
        lensTint: 'BLUE_LIGHT',
        frameColor3d: p.optical?.color || 'Noir Mat'
      }
    });

    this.imagesList = p.images ? [...p.images] : [];
    this.variantsList = p.variants ? [...p.variants] : [];
    this.calculateMargin();
  }

  calculateMargin(): void {
    const commercialGroup = this.productForm.get('commercial');
    if (!commercialGroup) return;

    const purchase = Number(commercialGroup.get('purchasePriceTnd')?.value) || 0;
    const selling = Number(commercialGroup.get('sellingPriceTnd')?.value) || 0;

    const margin = selling - purchase;
    const marginPct = selling > 0 ? (margin / selling) * 100 : 0;

    this.calculatedMarginTnd = margin;
    this.calculatedMarginPercentage = marginPct;

    commercialGroup.patchValue({
      marginTnd: margin,
      marginPercentage: marginPct
    }, { emitEvent: false });
  }

  onBrandSelected(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedId = Number(select.value);
    const found = this.brands.find(b => b.id === selectedId);
    if (found) {
      this.productForm.patchValue({ brandName: found.name });
    }
  }

  isFieldInvalid(path: string): boolean {
    const control = this.productForm.get(path);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onImagesUploaded(files: File[]): void {
    // Hooks into service API upload
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formVal = this.productForm.value;
    const model3dVal = formVal.model3d || {};

    const model3dConfigObj = {
      shape: formVal.optical?.shape || 'RECTANGLE',
      color: model3dVal.frameColor3d || formVal.optical?.color || 'Noir Mat',
      lensTint: model3dVal.lensTint || 'BLUE_LIGHT',
      scale: 1.0,
      widthMm: formVal.optical?.widthMm || 52
    };

    const payload: Partial<Product> = {
      ...formVal,
      tryOn3dAvailable: model3dVal.tryOn3dAvailable !== false,
      model3dUrl: model3dVal.mode === 'CUSTOM' ? model3dVal.model3dUrl : undefined,
      model3dConfig: JSON.stringify(model3dConfigObj),
      images: this.imagesList,
      variants: this.variantsList
    };

    delete (payload as any).model3d;

    this.formSubmit.emit(payload);
  }
}
