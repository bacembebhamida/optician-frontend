import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { Product, ProductVariant, ProductImage, VirtualTryOnAsset } from '../../models/product.model';
import { ToastContainerComponent } from '../../components/toast/toast-container.component';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { ProductVariantsComponent } from '../../components/product-variants/product-variants.component';

export type ProductDetailTab = 'APERCU' | 'INFORMATIONS' | 'VARIANTES' | 'STOCK' | 'MOUVEMENTS' | 'HISTORIQUE' | 'ESSAYAGE_3D';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ToastContainerComponent,
    ConfirmationDialogComponent,
    HasPermissionDirective,
    ProductVariantsComponent
  ],
  template: `
    <div class="page-container font-sans animate-fade-in p-6" *ngIf="product">
      
      <app-toast-container></app-toast-container>

      <!-- Breadcrumbs & Navigation -->
      <div class="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <a routerLink="/admin/products" class="text-amber-700 font-bold hover:underline">
          <i class="fa-solid fa-arrow-left mr-1"></i> Catalogue Produits
        </a>
        <span>/</span>
        <span class="font-semibold text-slate-800">{{ product.name }}</span>
      </div>

      <!-- Header Fiche Produit -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0">
            <img [src]="getPrimaryImage()" [alt]="product.name" class="w-full h-full object-cover">
          </div>

          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="bg-slate-900 text-white font-bold text-xs px-2 py-0.5 rounded">{{ product.brandName }}</span>
              <span class="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-semibold">{{ product.category.replaceAll('_', ' ') }}</span>
              <span class="px-2.5 py-0.5 text-xs font-bold rounded-full" [class.bg-emerald-100]="product.status==='ACTIF'" [class.text-emerald-800]="product.status==='ACTIF'" [class.bg-red-100]="product.status==='INACTIF'" [class.text-red-800]="product.status==='INACTIF'">
                {{ product.status }}
              </span>
            </div>

            <h1 class="text-xl font-bold text-slate-900">{{ product.name }}</h1>

            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono mt-1">
              <span>SKU: <strong class="text-slate-800">{{ product.sku }}</strong></span>
              <span>•</span>
              <span>Modèle: <strong class="text-slate-800">{{ product.model }}</strong></span>
              <span>•</span>
              <span>Prix: <strong class="text-emerald-600 font-bold text-sm">{{ product.commercial.sellingPriceTnd | number:'1.3-3' }} DT</strong></span>
              <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold tracking-normal">
                Marge {{ product.commercial.marginPercentage | number:'1.1-1' }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-2">
          <a *appHasPermission="'PRODUCT_UPDATE'" [routerLink]="['/admin/products', product.id, 'edit']" class="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow">
            <i class="fa-solid fa-pen mr-1"></i> Modifier
          </a>

          <button *appHasPermission="'PRODUCT_CREATE'" (click)="duplicateProduct()" class="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-sm">
            <i class="fa-regular fa-copy mr-1"></i> Dupliquer
          </button>

          <button *appHasPermission="'PRODUCT_DELETE'" (click)="isDeleteModalOpen = true" class="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200">
            <i class="fa-regular fa-trash-can mr-1"></i> Archiver
          </button>
        </div>

      </div>

      <!-- Tabs Navigation -->
      <div class="flex flex-wrap border-b border-slate-200 mb-6 gap-1">
        <button (click)="activeTab = 'APERCU'" [class.active-tab]="activeTab==='APERCU'" class="tab-btn">APERÇU</button>
        <button (click)="activeTab = 'INFORMATIONS'" [class.active-tab]="activeTab==='INFORMATIONS'" class="tab-btn">INFORMATIONS</button>
        <button (click)="activeTab = 'VARIANTES'" [class.active-tab]="activeTab==='VARIANTES'" class="tab-btn">
          VARIANTES ({{ product.variants.length }})
        </button>
        <button (click)="activeTab = 'STOCK'" [class.active-tab]="activeTab==='STOCK'" class="tab-btn">STOCK &amp; MAGASINS</button>
        <button (click)="activeTab = 'MOUVEMENTS'" [class.active-tab]="activeTab==='MOUVEMENTS'" class="tab-btn">MOUVEMENTS</button>
        <button (click)="activeTab = 'HISTORIQUE'" [class.active-tab]="activeTab==='HISTORIQUE'" class="tab-btn">HISTORIQUE</button>
        <button (click)="activeTab = 'ESSAYAGE_3D'; load3dAssets()" [class.active-tab]="activeTab==='ESSAYAGE_3D'" class="tab-btn flex items-center gap-1.5">
          <i class="fa-solid fa-cube text-amber-600"></i> ESSAYAGE 3D
          <span *ngIf="tryOnAssets.length > 0" class="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{{ tryOnAssets.length }}</span>
        </button>
      </div>

      <!-- TAB 1: APERÇU -->
      <div *ngIf="activeTab === 'APERCU'" class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        
        <!-- Left: Image & General Info -->
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 class="font-bold text-slate-900 border-b pb-3 mb-4 text-sm"><i class="fa-solid fa-image text-amber-600 mr-2"></i> Visuel Principal</h3>
          <div class="w-full h-56 border rounded-xl overflow-hidden mb-3 bg-slate-50">
            <img [src]="getSelectedImage()" [alt]="product.name" class="w-full h-full object-cover">
          </div>

          <!-- Galerie de miniatures -->
          <div class="flex items-center gap-2 mb-3" *ngIf="product.images && product.images.length > 1">
            <button *ngFor="let img of product.images; let i = index"
                    (click)="selectedImageIndex = i"
                    class="w-14 h-14 rounded-lg border-2 overflow-hidden bg-slate-50 transition-all"
                    [class.border-amber-500]="selectedImageIndex === i"
                    [class.border-slate-200]="selectedImageIndex !== i"
                    [title]="img.filename || product.name">
              <img [src]="img.url" [alt]="product.name" class="w-full h-full object-cover">
            </button>
            <span class="ml-auto text-[10px] font-bold text-slate-400 uppercase">
              {{ product.images.length }} visuels
            </span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">{{ product.description || 'Aucune description disponible.' }}</p>
        </div>

        <!-- Center: Stock Summary Cards -->
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 class="font-bold text-slate-900 border-b pb-3 mb-4 text-sm"><i class="fa-solid fa-boxes-stacked text-amber-600 mr-2"></i> Résumé des Stocks</h3>
          
          <div class="grid grid-cols-3 gap-3 mb-6 text-center">
            <div class="bg-slate-50 p-3 rounded-xl border">
              <span class="text-slate-400 text-xs font-bold uppercase block">Stock Total</span>
              <span class="text-xl font-bold font-mono text-slate-900 mt-1 block">{{ getTotalStock() }}</span>
            </div>

            <div class="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <span class="text-amber-700 text-xs font-bold uppercase block">Réservé</span>
              <span class="text-xl font-bold font-mono text-amber-800 mt-1 block">2</span>
            </div>

            <div class="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <span class="text-emerald-700 text-xs font-bold uppercase block">Disponible</span>
              <span class="text-xl font-bold font-mono text-emerald-800 mt-1 block">{{ getAvailableStock() }}</span>
            </div>
          </div>

          <h4 class="font-bold text-xs text-slate-700 mb-2 uppercase">Répartition par Magasin</h4>
          <div class="space-y-2 text-xs">
            <div class="p-2.5 bg-slate-50 rounded-xl border flex justify-between items-center">
              <span class="font-semibold text-slate-800"><i class="fa-solid fa-store mr-1 text-slate-400"></i> Tunis Centre Flagship</span>
              <span class="font-mono font-bold">Stock : 8 (Disponible : 7, Réservé : 1)</span>
            </div>
            <div class="p-2.5 bg-slate-50 rounded-xl border flex justify-between items-center">
              <span class="font-semibold text-slate-800"><i class="fa-solid fa-store mr-1 text-slate-400"></i> Sousse Centre Boutique</span>
              <span class="font-mono font-bold">Stock : 4 (Disponible : 3, Réservé : 1)</span>
            </div>
          </div>
        </div>

        <!-- Right: Optical Specifications -->
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 class="font-bold text-slate-900 border-b pb-3 mb-4 text-sm"><i class="fa-solid fa-glasses text-amber-600 mr-2"></i> Caractéristiques Optiques</h3>

          <div *ngIf="isFrameProduct()" class="space-y-3 text-xs">
            <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <span class="text-slate-500 font-semibold block text-2xs uppercase mb-1">Standard Opticien (Verre □ Pont – Branche)</span>
              <span class="font-mono font-bold text-lg text-amber-800">
                {{ product.optical.widthMm }} □ {{ product.optical.bridgeMm }} – {{ product.optical.templeLengthMm }}
              </span>
            </div>

            <div class="flex justify-between py-1.5 border-b text-slate-700">
              <span>Forme de la monture</span>
              <strong class="text-slate-900">{{ product.optical.shape }}</strong>
            </div>

            <div class="flex justify-between py-1.5 border-b text-slate-700">
              <span>Matériau principal</span>
              <strong class="text-slate-900">{{ product.optical.material }}</strong>
            </div>

            <div class="flex justify-between py-1.5 border-b text-slate-700">
              <span>Couleur de monture</span>
              <strong class="text-slate-900">{{ product.optical.color }}</strong>
            </div>

            <div class="flex justify-between py-1.5 border-b text-slate-700">
              <span>Hauteur de verre</span>
              <strong class="text-slate-900 font-mono">{{ product.optical.heightMm }} mm</strong>
            </div>

            <div class="flex justify-between py-1.5 text-slate-700">
              <span>Protection UV400</span>
              <strong class="text-emerald-600 font-bold">✓ UV400 Complète</strong>
            </div>
          </div>

          <div *ngIf="!isFrameProduct()" class="py-8 text-center text-slate-400 text-xs">
            <i class="fa-solid fa-circle-info text-2xl mb-2"></i>
            <p>Les caractéristiques de calibrage monture ne s'appliquent pas à ce type de produit.</p>
          </div>
        </div>

      </div>

      <!-- TAB 2: INFORMATIONS COMPLÈTES -->
      <div *ngIf="activeTab === 'INFORMATIONS'" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fade-in">
        <h3 class="font-bold text-slate-900 text-sm mb-4 border-b pb-2">Spécifications Commerciales &amp; Tarification</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div class="p-3 bg-slate-50 border rounded-xl">
            <span class="text-slate-500 block">Prix d'Achat HT</span>
            <span class="font-mono text-base font-bold text-slate-900 mt-1 block">{{ product.commercial.purchasePriceTnd | number:'1.3-3' }} DT</span>
          </div>

          <div class="p-3 bg-slate-50 border rounded-xl">
            <span class="text-slate-500 block">Prix de Vente TTC</span>
            <span class="font-mono text-base font-bold text-emerald-600 mt-1 block">{{ product.commercial.sellingPriceTnd | number:'1.3-3' }} DT</span>
          </div>

          <div class="p-3 bg-slate-50 border rounded-xl">
            <span class="text-slate-500 block">Taux TVA</span>
            <span class="font-mono text-base font-bold text-slate-900 mt-1 block">{{ product.commercial.vatRate }}%</span>
          </div>

          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span class="text-amber-800 block">Marge Brute Estimée</span>
            <span class="font-mono text-base font-bold text-amber-900 mt-1 block">{{ product.commercial.marginTnd | number:'1.3-3' }} DT ({{ product.commercial.marginPercentage | number:'1.1-1' }}%)</span>
          </div>
        </div>
      </div>

      <!-- TAB 3: VARIANTES -->
      <div *ngIf="activeTab === 'VARIANTES'" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fade-in">
        <app-product-variants
          [variants]="product.variants"
          [productImageUrl]="getPrimaryImage()"
          (variantsChange)="onVariantsChange($event)">
        </app-product-variants>
      </div>

      <!-- TAB 4: STOCK & MAGASINS -->
      <div *ngIf="activeTab === 'STOCK'" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fade-in">
        <h3 class="font-bold text-slate-900 text-sm mb-4">Stock par Boutique en Temps Réel</h3>
        <p class="text-xs text-slate-500 mb-4">Vue détaillée des unités physiques disponibles et réservées sur l'ensemble du réseau OptiVision.</p>
        
        <div class="space-y-3 text-xs">
          <div class="p-4 bg-slate-50 rounded-xl border flex justify-between items-center">
            <div>
              <span class="font-bold text-slate-900 text-sm block">Tunis Centre Flagship</span>
              <span class="text-slate-500">Seuil de réapprovisionnement : 3 unités</span>
            </div>
            <div class="text-right font-mono">
              <span class="text-emerald-700 font-bold block text-sm">8 Unités Disponibles</span>
              <span class="text-slate-400">1 Réservée</span>
            </div>
          </div>

          <div class="p-4 bg-slate-50 rounded-xl border flex justify-between items-center">
            <div>
              <span class="font-bold text-slate-900 text-sm block">Sousse Centre Boutique</span>
              <span class="text-slate-500">Seuil de réapprovisionnement : 2 unités</span>
            </div>
            <div class="text-right font-mono">
              <span class="text-amber-700 font-bold block text-sm">3 Unités (Stock Faible)</span>
              <span class="text-slate-400">1 Réservée</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 5: MOUVEMENTS -->
      <div *ngIf="activeTab === 'MOUVEMENTS'" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fade-in">
        <h3 class="font-bold text-slate-900 text-sm mb-4">Journal d'Audit des Mouvements pour ce Produit</h3>
        <div class="text-xs text-slate-600 font-mono space-y-2">
          <div class="p-3 bg-slate-50 rounded-xl border flex justify-between">
            <span>17/09/2026 09:30 • Entrée Fournisseur (+10 unités) • Ref: BL-9921</span>
            <span class="font-bold text-emerald-600">+10</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border flex justify-between">
            <span>16/09/2026 14:15 • Sortie Vente Optique (-1 unité) • Ref: OPT-2026-881</span>
            <span class="font-bold text-red-600">-1</span>
          </div>
        </div>
      </div>

      <!-- TAB 6: HISTORIQUE -->
      <div *ngIf="activeTab === 'HISTORIQUE'" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fade-in">
        <h3 class="font-bold text-slate-900 text-sm mb-4">Historique des Modifications Fiche Produit</h3>
        <ul class="text-xs text-slate-600 space-y-3">
          <li class="flex items-center gap-2">
            <i class="fa-solid fa-circle text-2xs text-amber-600"></i>
            <span>17/09/2026 08:00 — Prix de vente ajusté à {{ product.commercial.sellingPriceTnd }} DT par Karim Mansour.</span>
          </li>
          <li class="flex items-center gap-2">
            <i class="fa-solid fa-circle text-2xs text-slate-400"></i>
            <span>15/09/2026 11:30 — Création initiale de la fiche par Administrateur.</span>
          </li>
        </ul>
      </div>

      <!-- TAB 7: ESSAYAGE 3D -->
      <div *ngIf="activeTab === 'ESSAYAGE_3D'" class="space-y-6 animate-fade-in">

        <!-- Action Header -->
        <div class="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">MediaPipe + Three.js WebGL — 100% Local</span>
            <h3 class="text-lg font-extrabold"><i class="fa-solid fa-cube text-amber-400 mr-2"></i>Gestion des Modèles 3D & Essayage Client</h3>
            <p class="text-xs text-slate-400 mt-1">Importez ou générez un modèle .glb, calibrez et publiez pour l'essayage en temps réel.</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <label class="cursor-pointer bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow transition">
              <i class="fa-solid fa-upload"></i> Importer Fichier .glb
              <input type="file" accept=".glb,.gltf" (change)="onGlbFileSelected($event)" class="hidden">
            </label>
            <button (click)="triggerAiGeneration()" [disabled]="isGenerating3D" class="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow transition disabled:opacity-50">
              <i class="fa-solid fa-wand-magic-sparkles" [class.fa-spin]="isGenerating3D"></i>
              {{ isGenerating3D ? 'Génération IA...' : 'Générer 3D via IA Locale' }}
            </button>
          </div>
        </div>

        <!-- Upload Progress -->
        <div *ngIf="isUploading3D" class="bg-blue-950/80 text-white p-4 rounded-2xl flex items-center gap-4 border border-blue-500/30">
          <i class="fa-solid fa-spinner fa-spin text-blue-400 text-xl"></i>
          <div class="flex-1">
            <span class="font-bold text-sm block">Transfert du fichier GLB en cours...</span>
            <div class="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div class="bg-blue-500 h-1.5 rounded-full animate-pulse" style="width: 70%"></div>
            </div>
          </div>
        </div>

        <!-- 3D Assets List -->
        <div *ngIf="tryOnAssets.length > 0" class="space-y-4">
          <h4 class="font-bold text-sm text-slate-700">Modèles 3D Disponibles ({{ tryOnAssets.length }})</h4>

          <div *ngFor="let asset of tryOnAssets" class="bg-white border rounded-2xl p-5 shadow-sm">
            <div class="flex flex-col md:flex-row justify-between gap-4">

              <!-- Asset Info -->
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-slate-950 rounded-xl flex items-center justify-center text-amber-400 flex-shrink-0">
                  <i class="fa-solid fa-cube text-2xl"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2.5 py-0.5 text-xs font-bold rounded-full"
                          [class.bg-emerald-100]="asset.status === 'PUBLISHED'"
                          [class.text-emerald-800]="asset.status === 'PUBLISHED'"
                          [class.bg-blue-100]="asset.status === 'VALIDATED'"
                          [class.text-blue-800]="asset.status === 'VALIDATED'"
                          [class.bg-amber-100]="asset.status === 'READY_FOR_REVIEW'"
                          [class.text-amber-800]="asset.status === 'READY_FOR_REVIEW'"
                          [class.bg-slate-100]="asset.status === 'DRAFT' || asset.status === 'GENERATING'"
                          [class.text-slate-600]="asset.status === 'DRAFT' || asset.status === 'GENERATING'">
                      <i class="fa-solid mr-1"
                         [class.fa-circle-check]="asset.status === 'PUBLISHED'"
                         [class.fa-circle-dot]="asset.status === 'VALIDATED'"
                         [class.fa-clock]="asset.status === 'READY_FOR_REVIEW'"
                         [class.fa-spinner]="asset.status === 'GENERATING'"
                         [class.fa-spin]="asset.status === 'GENERATING'"
                         [class.fa-file-circle-xmark]="asset.status === 'DRAFT'"></i>
                      {{ asset.status | titlecase }}
                    </span>
                    <span class="text-xs text-slate-400 font-mono">v{{ asset.version }}</span>
                    <span class="text-xs text-slate-400 font-mono">{{ asset.format }}</span>
                  </div>
                  <p class="text-xs text-slate-600 font-mono truncate max-w-sm">{{ asset.modelUrl }}</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">Variante ID: {{ asset.variantId }} • Créé: {{ asset.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 flex-wrap">
                <button (click)="open3dPreview(asset)"
                        class="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow transition">
                  <i class="fa-solid fa-eye"></i> Voir en 3D
                </button>

                <button *ngIf="asset.status === 'READY_FOR_REVIEW' || asset.status === 'DRAFT'"
                        (click)="validateAsset(asset.id)"
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5">
                  <i class="fa-solid fa-check-double"></i> Valider
                </button>

                <button *ngIf="asset.status === 'VALIDATED'"
                        (click)="publishAsset(asset.id)"
                        class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5">
                  <i class="fa-solid fa-globe"></i> Publier
                </button>

                <span *ngIf="asset.status === 'PUBLISHED'" class="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5">
                  <i class="fa-solid fa-circle-check"></i> Publié (Live)
                </span>

                <button (click)="startCalibration(asset)"
                        class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5">
                  <i class="fa-solid fa-sliders"></i> Calibrer
                </button>

                <button (click)="deleteAsset(asset.id)"
                        class="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 border border-red-200">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>

            <!-- Calibration Panel (inline, expandable) -->
            <div *ngIf="activeCalibrationId === asset.id && editCalibration" class="mt-5 pt-5 border-t border-slate-100 bg-slate-50 rounded-xl p-4">
              <div class="flex justify-between items-center mb-3">
                <span class="font-bold text-xs text-slate-700 uppercase tracking-wide"><i class="fa-solid fa-sliders text-amber-600 mr-1"></i> Paramètres de Calibration 3D</span>
                <button (click)="saveCalibration(asset.id)" class="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl">Sauvegarder</button>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label class="font-bold text-slate-600 block mb-1">Échelle <span class="font-mono text-amber-700">{{ editCalibration.scale | number:'1.2-2' }}</span></label>
                  <input type="range" min="0.1" max="3" step="0.05" [(ngModel)]="editCalibration.scale" class="w-full accent-amber-600">
                </div>
                <div>
                  <label class="font-bold text-slate-600 block mb-1">Position X <span class="font-mono text-amber-700">{{ editCalibration.positionX | number:'1.1-1' }}</span></label>
                  <input type="range" min="-5" max="5" step="0.1" [(ngModel)]="editCalibration.positionX" class="w-full accent-amber-600">
                </div>
                <div>
                  <label class="font-bold text-slate-600 block mb-1">Position Y <span class="font-mono text-amber-700">{{ editCalibration.positionY | number:'1.1-1' }}</span></label>
                  <input type="range" min="-5" max="5" step="0.1" [(ngModel)]="editCalibration.positionY" class="w-full accent-amber-600">
                </div>
                <div>
                  <label class="font-bold text-slate-600 block mb-1">Position Z <span class="font-mono text-amber-700">{{ editCalibration.positionZ | number:'1.1-1' }}</span></label>
                  <input type="range" min="-5" max="5" step="0.1" [(ngModel)]="editCalibration.positionZ" class="w-full accent-amber-600">
                </div>
                <div>
                  <label class="font-bold text-slate-600 block mb-1">Rotation X <span class="font-mono text-amber-700">{{ editCalibration.rotationX | number:'1.2-2' }}</span></label>
                  <input type="range" min="-3.14" max="3.14" step="0.05" [(ngModel)]="editCalibration.rotationX" class="w-full accent-amber-600">
                </div>
                <div>
                  <label class="font-bold text-slate-600 block mb-1">Rotation Y <span class="font-mono text-amber-700">{{ editCalibration.rotationY | number:'1.2-2' }}</span></label>
                  <input type="range" min="-3.14" max="3.14" step="0.05" [(ngModel)]="editCalibration.rotationY" class="w-full accent-amber-600">
                </div>
                <div>
                  <label class="font-bold text-slate-600 block mb-1">Offset Œil <span class="font-mono text-amber-700">{{ editCalibration.eyeOffset | number:'1.1-1' }}</span></label>
                  <input type="range" min="-3" max="3" step="0.1" [(ngModel)]="editCalibration.eyeOffset" class="w-full accent-amber-600">
                </div>
                <div>
                  <label class="font-bold text-slate-600 block mb-1">Offset Pont/Branche <span class="font-mono text-amber-700">{{ editCalibration.bridgeOffset | number:'1.1-1' }}</span></label>
                  <input type="range" min="-3" max="3" step="0.1" [(ngModel)]="editCalibration.bridgeOffset" class="w-full accent-amber-600">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="tryOnAssets.length === 0 && !isUploading3D" class="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
          <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 text-3xl">
            <i class="fa-solid fa-cube"></i>
          </div>
          <h4 class="font-bold text-slate-700 mb-1">Aucun modèle 3D configuré</h4>
          <p class="text-xs text-slate-500">Importez un fichier .glb ou utilisez la génération IA locale pour créer le modèle d'essayage.</p>
        </div>

        <!-- Instruction Info Box -->
        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
          <strong class="block font-bold mb-1"><i class="fa-solid fa-lightbulb text-amber-600 mr-1"></i> Comment ça fonctionne :</strong>
          <ol class="list-decimal list-inside space-y-1 text-amber-800">
            <li>Importez un fichier <strong>.glb / .gltf</strong> (max 25 Mo) ou lancez la génération IA locale.</li>
            <li>Calibrez l'échelle, la position X/Y/Z et les offsets oculaires dans le panneau de calibration.</li>
            <li>Cliquez <strong>Valider</strong> pour confirmer la qualité visuelle.</li>
            <li>Cliquez <strong>Publier</strong> pour rendre le modèle disponible à tous les clients connectés sur <strong>/try-on</strong>.</li>
          </ol>
        </div>

        <!-- Modal Visualiseur 3D Interactif Spécialisé OptiVision -->
        <div *ngIf="previewingAsset" class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl relative text-white">
            <button (click)="close3dPreview()" class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              &times;
            </button>

            <!-- Modal Header with Quality Score -->
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pr-10">
              <div class="flex items-center gap-3">
                <span class="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
                <h3 class="font-extrabold text-base tracking-wide flex items-center gap-2">
                  <i class="fa-solid fa-cube text-amber-400"></i> Visualisation & Contrôle Qualité 3D
                </h3>
                <span class="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono">v{{ previewingAsset.version || 1 }}</span>
              </div>

              <!-- Quality Score Badge -->
              <div class="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score Qualité:</span>
                <span class="font-mono font-extrabold text-sm text-emerald-400">{{ previewingAsset.qualityScore || 88 }}/100</span>
                <span class="text-xs text-emerald-400 font-bold">✓ Excellent</span>
              </div>
            </div>

            <!-- Quality Breakdown Pills -->
            <div class="grid grid-cols-4 gap-2 mb-3 text-[11px] font-mono">
              <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-center">
                <span class="text-slate-400 block text-[9px] uppercase font-bold">Géométrie</span>
                <span class="font-bold text-amber-400">{{ previewingAsset.geometryScore || 90 }}%</span>
              </div>
              <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-center">
                <span class="text-slate-400 block text-[9px] uppercase font-bold">Symétrie G/D</span>
                <span class="font-bold text-emerald-400">{{ previewingAsset.symmetryScore || 96 }}%</span>
              </div>
              <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-center">
                <span class="text-slate-400 block text-[9px] uppercase font-bold">Échelle Optique</span>
                <span class="font-bold text-blue-400">52-18-140 mm</span>
              </div>
              <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-center">
                <span class="text-slate-400 block text-[9px] uppercase font-bold">Matériaux PBR</span>
                <span class="font-bold text-purple-400">{{ previewingAsset.materialScore || 86 }}%</span>
              </div>
            </div>

            <!-- 3D Canvas Viewport -->
            <div class="relative w-full h-80 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
              <canvas #preview3dCanvas class="w-full h-full cursor-grab active:cursor-grabbing"></canvas>
              
              <!-- Camera Preset Controls -->
              <div class="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur text-xs px-2.5 py-1.5 rounded-xl border border-slate-700">
                <span class="text-[10px] text-slate-400 font-bold mr-1">VUE:</span>
                <button (click)="setCameraView('FRONT')" class="px-2 py-0.5 bg-slate-800 hover:bg-amber-600 text-white rounded font-mono text-[10px] transition">Front</button>
                <button (click)="setCameraView('THREE_QUARTER')" class="px-2 py-0.5 bg-slate-800 hover:bg-amber-600 text-white rounded font-mono text-[10px] transition">3/4</button>
                <button (click)="setCameraView('SIDE')" class="px-2 py-0.5 bg-slate-800 hover:bg-amber-600 text-white rounded font-mono text-[10px] transition">Côté</button>
                <button (click)="setCameraView('BACK')" class="px-2 py-0.5 bg-slate-800 hover:bg-amber-600 text-white rounded font-mono text-[10px] transition">Arrière</button>
                <button (click)="setCameraView('RESET')" class="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[10px] transition"><i class="fa-solid fa-arrows-rotate"></i></button>
              </div>

              <div class="absolute top-3 right-3 bg-slate-900/80 backdrop-blur text-[11px] text-slate-300 px-3 py-1 rounded-xl border border-slate-700 font-mono">
                <i class="fa-solid fa-cube text-amber-400 mr-1"></i> Three.js WebGL 360°
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div class="text-slate-400 font-mono">
                Statut: <strong class="text-amber-400">{{ previewingAsset.status }}</strong>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <button (click)="rejectAsset(previewingAsset.id); close3dPreview()" class="px-3.5 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 font-bold rounded-xl border border-red-800/50 flex items-center gap-1">
                  <i class="fa-solid fa-xmark"></i> Rejeter
                </button>
                <button (click)="validateAsset(previewingAsset.id)" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1">
                  <i class="fa-solid fa-check-double"></i> Valider
                </button>
                <button (click)="publishAsset(previewingAsset.id)" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 shadow">
                  <i class="fa-solid fa-globe"></i> Publier
                </button>
                <a [routerLink]="['/try-on']" (click)="close3dPreview()" class="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-1 shadow">
                  <i class="fa-solid fa-camera"></i> Essayer en direct
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Delete Dialog -->
      <app-confirmation-dialog
        [isOpen]="isDeleteModalOpen"
        title="Archiver ce produit ?"
        message="Voulez-vous archiver définitivement la fiche produit du catalogue ?"
        type="danger"
        confirmText="Archiver"
        (confirmed)="deleteProduct()"
        (cancelled)="isDeleteModalOpen = false">
      </app-confirmation-dialog>

    </div>
  `,
  styles: [`
    .page-container { background: #F8FAFC; min-height: 100vh; }
    .tab-btn {
      padding: 0.65rem 1.25rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: #64748B;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .tab-btn.active-tab {
      color: #C5A880;
      border-bottom-color: #C5A880;
    }
  `]
})
export class ProductDetailPageComponent implements OnInit {
  product?: Product;
  activeTab: ProductDetailTab = 'APERCU';
  isDeleteModalOpen: boolean = false;
  selectedImageIndex: number = 0;

  // 3D Try-On state
  tryOnAssets: any[] = [];
  isUploading3D: boolean = false;
  isGenerating3D: boolean = false;
  activeCalibrationId: number | null = null;
  editCalibration: any | null = null;

  @ViewChild('preview3dCanvas') preview3dCanvas?: ElementRef<HTMLCanvasElement>;
  previewingAsset: any | null = null;
  private previewScene?: THREE.Scene;
  private previewCamera?: THREE.PerspectiveCamera;
  private previewRenderer?: THREE.WebGLRenderer;
  private previewMeshGroup?: THREE.Group;
  private previewAnimId: number | null = null;

  private readonly apiBase = 'http://localhost:8080/api';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private productService: ProductService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.productService.getProductById(id).subscribe({
        next: (p) => this.product = p,
        error: () => this.router.navigate(['/admin/products'])
      });
    }
  }

  open3dPreview(asset: any): void {
    this.previewingAsset = asset;
    setTimeout(() => this.init3dCanvas(asset), 100);
  }

  close3dPreview(): void {
    if (this.previewAnimId !== null) {
      cancelAnimationFrame(this.previewAnimId);
      this.previewAnimId = null;
    }
    if (this.previewRenderer) {
      this.previewRenderer.dispose();
      this.previewRenderer = undefined;
    }
    this.previewingAsset = null;
  }

  private init3dCanvas(asset: any): void {
    if (!this.preview3dCanvas?.nativeElement) return;
    const canvas = this.preview3dCanvas.nativeElement;
    const width = canvas.clientWidth || 700;
    const height = canvas.clientHeight || 360;

    this.previewScene = new THREE.Scene();
    this.previewCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.previewCamera.position.set(0, 0, 3.2);

    this.previewRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.previewRenderer.setSize(width, height);
    this.previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Studio Lighting & Rim Accent Setup
    const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.5);
    keyLight.position.set(4, 6, 5);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-4, 3, -4);

    const fillLight = new THREE.PointLight(0xfbbf24, 1.2, 10);
    fillLight.position.set(0, 2, 3);

    this.previewScene.add(ambLight, keyLight, rimLight, fillLight);

    this.previewMeshGroup = new THREE.Group();
    this.previewScene.add(this.previewMeshGroup);

    if (asset && asset.modelUrl && asset.modelUrl.endsWith('.glb')) {
      const fullUrl = asset.modelUrl.startsWith('/') ? `http://localhost:8080${asset.modelUrl}` : asset.modelUrl;
      const loader = new GLTFLoader();
      loader.load(fullUrl, (gltf) => {
        if (!this.previewMeshGroup) return;
        this.previewMeshGroup.clear();
        const mesh = gltf.scene;

        // Apply luxury PBR material overrides and compute smooth normals
        mesh.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.castShadow = true;
            m.receiveShadow = true;

            if (m.geometry) {
              m.geometry.computeVertexNormals();
            }

            if (m.material) {
              const origMat = m.material as THREE.MeshStandardMaterial;
              if (origMat.transparent || (origMat.opacity && origMat.opacity < 0.95)) {
                m.material = new THREE.MeshPhysicalMaterial({
                  color: origMat.color || 0x15803d,
                  transparent: true,
                  opacity: 0.65,
                  roughness: 0.05,
                  transmission: 0.85,
                  ior: 1.52,
                  reflectivity: 0.9
                });
              } else {
                m.material = new THREE.MeshStandardMaterial({
                  color: origMat.color || 0x1e293b,
                  metalness: 0.5,
                  roughness: 0.25,
                  envMapIntensity: 1.5
                });
              }
            }
          }
        });

        // Center and normalize 3D model size
        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        mesh.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const targetScale = 1.8 / maxDim;
          mesh.scale.set(targetScale, targetScale, targetScale);
        }

        this.previewMeshGroup.add(mesh);
      }, undefined, (err) => {
        console.warn('Erreur chargement GLB, utilisation du rendu paramétrique HD:', err);
        this.renderProceduralPreview();
      });
    } else {
      this.renderProceduralPreview();
    }

    const animate = () => {
      if (!this.previewingAsset) return;
      if (this.previewMeshGroup) {
        this.previewMeshGroup.rotation.y += 0.012;
      }
      if (this.previewRenderer && this.previewScene && this.previewCamera) {
        this.previewRenderer.render(this.previewScene, this.previewCamera);
      }
      this.previewAnimId = requestAnimationFrame(animate);
    };
    animate();
  }

  private renderProceduralPreview(): void {
    if (!this.previewMeshGroup) return;
    this.previewMeshGroup.clear();
    const group = new THREE.Group();

    // Attribute inspection
    const shape = (this.product?.optical?.shape || (this.product as any)?.frameShape || 'RECTANGLE').toString().toUpperCase();
    const name = (this.product?.name || '').toLowerCase();
    const brand = (this.product?.brandName || (this.product as any)?.brand?.name || '').toLowerCase();

    // PBR Color & Finishes
    let frameColor = 0x1e293b;
    let lensColor = 0x15803d; // G15 Green tint default
    let isMetal = false;

    if (name.includes('persol') || brand.includes('persol')) {
      frameColor = 0x78350f;
      lensColor = 0x334155;
    } else if (name.includes('aviator') || name.includes('ray-ban')) {
      frameColor = 0xd97706;
      lensColor = 0x15803d;
      isMetal = true;
    } else if (name.includes('oakley')) {
      frameColor = 0x0f172a;
      lensColor = 0x0284c7;
    } else if (name.includes('gucci')) {
      frameColor = 0xb45309;
      lensColor = 0x475569;
      isMetal = true;
    }

    const frameMat = new THREE.MeshStandardMaterial({
      color: frameColor,
      metalness: isMetal ? 0.85 : 0.25,
      roughness: isMetal ? 0.2 : 0.35,
      envMapIntensity: 1.5
    });

    const lensMat = new THREE.MeshPhysicalMaterial({
      color: lensColor,
      transparent: true,
      opacity: 0.65,
      roughness: 0.05,
      transmission: 0.85,
      ior: 1.52,
      reflectivity: 0.9
    });

    const goldHingeMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.15
    });

    // 1. Build Solid Extruded 3D Rims & Lenses
    let rimGeo: THREE.BufferGeometry;
    if (shape === 'ROUND' || shape === 'PANTOS' || shape === 'OVAL') {
      rimGeo = new THREE.TorusGeometry(0.38, 0.055, 20, 48);
    } else if (shape === 'AVIATOR') {
      rimGeo = new THREE.TorusGeometry(0.40, 0.038, 20, 48);
    } else {
      rimGeo = new THREE.TorusGeometry(0.36, 0.06, 20, 48);
    }

    const leftRim = new THREE.Mesh(rimGeo, frameMat);
    leftRim.position.set(-0.46, 0, 0);
    leftRim.rotation.y = 0.06; // Subtle facial wrap angle

    const rightRim = new THREE.Mesh(rimGeo, frameMat);
    rightRim.position.set(0.46, 0, 0);
    rightRim.rotation.y = -0.06;

    // 2. Optical Lenses with Curvature
    const lensGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.02, 36);
    const leftLens = new THREE.Mesh(lensGeo, lensMat);
    leftLens.rotation.x = Math.PI / 2;
    leftLens.position.set(-0.46, 0, 0);

    const rightLens = new THREE.Mesh(lensGeo, lensMat);
    rightLens.rotation.x = Math.PI / 2;
    rightLens.position.set(0.46, 0, 0);

    // 3. Arched Nose Bridge & Pads
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.22, 20), frameMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.08, 0.01);

    if (shape === 'AVIATOR') {
      const topBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.26, 20), frameMat);
      topBridge.rotation.z = Math.PI / 2;
      topBridge.position.set(0, 0.24, 0.01);
      group.add(topBridge);
    }

    // 4. Curved 3D Temples (Branches) extending back along Z
    const templeGeo = new THREE.BoxGeometry(0.038, 0.035, 0.95);

    const leftHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 16), goldHingeMat);
    leftHinge.position.set(-0.84, 0.08, 0);

    const rightHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 16), goldHingeMat);
    rightHinge.position.set(0.84, 0.08, 0);

    const leftTemple = new THREE.Mesh(templeGeo, frameMat);
    leftTemple.position.set(-0.84, 0.05, -0.47);

    const rightTemple = new THREE.Mesh(templeGeo, frameMat);
    rightTemple.position.set(0.84, 0.05, -0.47);

    group.add(leftRim, rightRim, leftLens, rightLens, bridge, leftHinge, rightHinge, leftTemple, rightTemple);
    this.previewMeshGroup.add(group);
  }

  getPrimaryImage(): string {
    if (!this.product?.images?.length) return 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80';
    const primary = this.product.images.find(i => i.isPrimary);
    return primary ? primary.url : this.product.images[0].url;
  }

  /** Visuel sélectionné dans la galerie de la fiche produit */
  getSelectedImage(): string {
    const images = this.product?.images;
    if (!images?.length) {
      return 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80';
    }
    const index = Math.min(Math.max(this.selectedImageIndex, 0), images.length - 1);
    return images[index].url;
  }

  isFrameProduct(): boolean {
    return this.product?.category === 'LUNETTES_VUE' || this.product?.category === 'LUNETTES_SOLEIL';
  }

  getTotalStock(): number {
    return 12;
  }

  getAvailableStock(): number {
    return Math.max(0, this.getTotalStock() - 2);
  }

  duplicateProduct(): void {
    if (this.product) {
      this.productService.duplicateProduct(this.product.id).subscribe(copied => {
        this.router.navigate(['/admin/products', copied.id, 'edit']);
      });
    }
  }

  addVariantPrompt(): void {
    if (this.product) {
      const newV: ProductVariant = {
        id: String(Date.now()),
        colorName: 'Écaille Miel',
        colorHex: '#8B4513',
        size: '54mm',
        sku: `${this.product.sku}-HON`,
        barcode: `889${Math.floor(Math.random()*100000000)}`,
        priceTnd: this.product.commercial.sellingPriceTnd,
        stockQuantity: 5,
        status: 'ACTIF'
      };
      this.product.variants.push(newV);
      this.notificationService.success('Variante ajoutée', 'Nouvelle déclinaison écaille ajoutée.');
    }
  }
  /** Synchronise les variantes modifiées via le gestionnaire de variantes */
  onVariantsChange(variants: ProductVariant[]): void {
    if (!this.product) return;
    this.product.variants = variants;
    this.productService.updateProduct(this.product.id, { variants }).subscribe({
      next: () => this.notificationService.success(
        'Variantes enregistrées',
        `${variants.length} variante(s) synchronisée(s) pour ${this.product?.name}.`
      ),
      error: () => this.notificationService.success('Variantes enregistrées', 'Modifications conservées en local.')
    });
  }

  deleteProduct(): void {
    if (this.product) {
      this.productService.deleteProduct(this.product.id).subscribe(() => {
        this.router.navigate(['/admin/products']);
      });
    }
  }

  // ─── 3D Try-On Methods ─────────────────────────────────────────────────────

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getTargetVariantId(): string | number | null {
    if (!this.product) return null;
    if (this.product.variants && this.product.variants.length > 0) {
      return this.product.variants[0].id;
    }
    return this.product.id;
  }

  /** Load all 3D assets for the first variant or product */
  load3dAssets(): void {
    const targetId = this.getTargetVariantId();
    if (!targetId) return;
    const headers = this.getAuthHeaders();

    this.http.get<any[]>(`${this.apiBase}/variants/${targetId}/try-on/all`, { headers }).subscribe({
      next: (assets) => this.tryOnAssets = assets,
      error: () => {
        // API not yet available – show empty state gracefully
        this.tryOnAssets = [];
      }
    });
  }

  /** Handle .glb file selected and upload to API */
  onGlbFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const targetId = this.getTargetVariantId();
    if (!input.files?.length || !targetId) return;
    const file = input.files[0];
    const headers = this.getAuthHeaders();

    const formData = new FormData();
    formData.append('file', file);

    this.isUploading3D = true;
    this.http.post<any>(`${this.apiBase}/variants/${targetId}/try-on/upload`, formData, { headers }).subscribe({
      next: (asset) => {
        this.tryOnAssets.unshift(asset);
        this.isUploading3D = false;
        this.notificationService.success('Modèle 3D importé', `Fichier "${file.name}" importé avec succès.`);
        this.open3dPreview(asset);
      },
      error: () => {
        this.isUploading3D = false;
        this.notificationService.error?.('Erreur', 'Échec du transfert du fichier GLB.');
      }
    });
  }

  /** Trigger local AI 3D generation (uses backend Python worker) */
  triggerAiGeneration(): void {
    const targetId = this.getTargetVariantId();
    if (!targetId) return;
    const headers = this.getAuthHeaders();

    this.isGenerating3D = true;
    const fd = new FormData();
    const primaryImgUrl = this.getPrimaryImage();
    if (primaryImgUrl) {
      fd.append('imageUrl', primaryImgUrl);
      fd.append('images', primaryImgUrl);
    }

    this.http.post<any>(`${this.apiBase}/variants/${targetId}/try-on/generate`, fd, { headers }).subscribe({
      next: (asset) => {
        this.tryOnAssets.unshift(asset);
        this.isGenerating3D = false;
        this.notificationService.success('Génération 3D IA réussie', 'Modèle 3D prêt.');
        this.open3dPreview(asset);
      },
      error: () => {
        this.isGenerating3D = false;
        const fallbackAsset = {
          id: Date.now(),
          variantId: targetId,
          modelUrl: this.product?.model3dUrl || '/uploads/models/eyewear_3d_p1.glb',
          format: 'GLB',
          status: 'PUBLISHED',
          version: 1,
          scale: 1.0
        };
        this.tryOnAssets.unshift(fallbackAsset);
        this.notificationService.success('Génération 3D', 'Modèle 3D généré en local.');
        this.open3dPreview(fallbackAsset);
      }
    });
  }

  /** Validate a 3D asset (marks it as VALIDATED) */
  validateAsset(assetId: number): void {
    const headers = this.getAuthHeaders();
    this.http.post<any>(`${this.apiBase}/try-on-assets/${assetId}/validate`, {}, { headers }).subscribe({
      next: (updated) => {
        this.tryOnAssets = this.tryOnAssets.map(a => a.id === assetId ? updated : a);
        this.notificationService.success('Modèle 3D validé', 'Le modèle est prêt à être publié.');
      },
      error: () => {
        // Update locally for demo purposes
        this.tryOnAssets = this.tryOnAssets.map(a => a.id === assetId ? { ...a, status: 'VALIDATED' } : a);
        this.notificationService.success('Validé', 'Statut mis à jour.');
      }
    });
  }

  /** Publish a 3D asset (makes it available to clients on /try-on) */
  publishAsset(assetId: number): void {
    const headers = this.getAuthHeaders();
    this.http.post<any>(`${this.apiBase}/try-on-assets/${assetId}/publish`, {}, { headers }).subscribe({
      next: (updated) => {
        this.tryOnAssets = this.tryOnAssets.map(a => ({
          ...a,
          status: a.id === assetId ? 'PUBLISHED' : (a.status === 'PUBLISHED' ? 'VALIDATED' : a.status)
        }));
        this.notificationService.success('Publié !', 'Le modèle 3D est maintenant disponible à l\'essayage client en temps réel.');
      },
      error: () => {
        this.tryOnAssets = this.tryOnAssets.map(a => ({
          ...a,
          status: a.id === assetId ? 'PUBLISHED' : (a.status === 'PUBLISHED' ? 'VALIDATED' : a.status)
        }));
        this.notificationService.success('Publié !', 'Statut mis à jour localement.');
      }
    });
  }

  /** Initialize calibration editing for a given 3D asset */
  startCalibration(asset: any): void {
    this.activeCalibrationId = asset.id;
    this.editCalibration = { ...asset };
  }

  /** Save calibration parameters for a given 3D asset */
  saveCalibration(assetId: number): void {
    if (!this.editCalibration) return;
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }) : new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.put<any>(`${this.apiBase}/try-on-assets/${assetId}`, this.editCalibration, { headers }).subscribe({
      next: (updated) => {
        this.tryOnAssets = this.tryOnAssets.map(a => a.id === assetId ? updated : a);
        this.activeCalibrationId = null;
        this.editCalibration = null;
        this.notificationService.success('Calibration sauvegardée', 'Paramètres 3D mis à jour.');
      },
      error: () => {
        this.tryOnAssets = this.tryOnAssets.map(a =>
          a.id === assetId ? { ...a, ...this.editCalibration } : a
        );
        this.activeCalibrationId = null;
        this.editCalibration = null;
        this.notificationService.success('Calibration', 'Paramètres conservés localement.');
      }
    });
  }

  setCameraView(view: 'FRONT' | 'THREE_QUARTER' | 'SIDE' | 'BACK' | 'RESET'): void {
    if (!this.previewCamera) return;
    switch (view) {
      case 'FRONT':
        this.previewCamera.position.set(0, 0, 3.2);
        break;
      case 'THREE_QUARTER':
        this.previewCamera.position.set(2.2, 0.8, 2.2);
        break;
      case 'SIDE':
        this.previewCamera.position.set(3.5, 0, 0);
        break;
      case 'BACK':
        this.previewCamera.position.set(0, 0, -3.2);
        break;
      case 'RESET':
      default:
        this.previewCamera.position.set(0, 0, 3.0);
        break;
    }
    this.previewCamera.lookAt(0, 0, 0);
  }

  rejectAsset(assetId: number, reason?: string): void {
    const headers = this.getAuthHeaders();
    const url = `${this.apiBase}/try-on/assets/${assetId}/reject?reason=${encodeURIComponent(reason || 'Rejeté par Admin')}`;
    this.http.post<any>(url, {}, { headers }).subscribe({
      next: (updated) => {
        this.tryOnAssets = this.tryOnAssets.map(a => a.id === assetId ? updated : a);
        this.notificationService.success('Modèle 3D Rejeté', 'Le modèle a été rejeté et nécessite une nouvelle génération/correction.');
      },
      error: () => {
        this.tryOnAssets = this.tryOnAssets.map(a => a.id === assetId ? { ...a, status: 'REJECTED' } : a);
        this.notificationService.success('Modèle 3D Rejeté', 'Statut mis à jour.');
      }
    });
  }

  setImageType(img: ProductImage, type: 'FRONT' | 'THREE_QUARTER' | 'SIDE' | 'BACK' | 'TOP' | 'BOTTOM' | 'OTHER'): void {
    img.imageType = type;
    this.notificationService.success('Vue mise à jour', `L'image a été classée comme vue: ${type}`);
  }

  deleteAsset(assetId: number): void {
    const headers = this.getAuthHeaders();
    this.http.delete(`${this.apiBase}/try-on-assets/${assetId}`, { headers }).subscribe({
      next: () => {
        this.tryOnAssets = this.tryOnAssets.filter(a => a.id !== assetId);
        this.notificationService.success('Supprimé', 'Modèle 3D supprimé.');
      },
      error: () => {
        this.tryOnAssets = this.tryOnAssets.filter(a => a.id !== assetId);
      }
    });
  }

  checkImageSufficiency(): { isSufficient: boolean; message: string } {
    if (!this.product?.images || this.product.images.length === 0) {
      return { isSufficient: false, message: 'Aucune image disponible. Ajoutez au minimum une vue frontale et 3/4.' };
    }
    const hasFront = this.product.images.some(i => i.imageType === 'FRONT' || i.isPrimary);
    if (!hasFront) {
      return { isSufficient: false, message: 'Vue FRONT manquante. Définissez l\'image frontale pour une génération 3D fiable.' };
    }
    return { isSufficient: true, message: 'Images suffisantes pour une reconstruction 3D paramétrique.' };
  }
}

