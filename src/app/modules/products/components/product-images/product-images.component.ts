import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductImage } from '../../models/product.model';

@Component({
  selector: 'app-product-images',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-images-manager">
      
      <!-- Drag & Drop Upload Dropzone -->
      <div class="dropzone-box"
           [class.dragging]="isDragging"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)">
        
        <input type="file" 
               #fileInput 
               multiple 
               accept="image/png, image/jpeg, image/webp" 
               (change)="onFileSelected($event)" 
               class="hidden-file-input"
               id="product-image-file-input">

        <label for="product-image-file-input" class="dropzone-label">
          <div class="upload-icon-circle">
            <i class="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <div class="upload-text-content">
            <span class="main-upload-text">Glissez-déposez vos visuels produits ici</span>
            <span class="sub-upload-text">Formats acceptés : PNG, JPG, WEBP (Max 5 Mo/image) · Préparé pour stockage S3 / MinIO</span>
          </div>
          <button type="button" class="btn-browse-files" (click)="fileInput.click()">
            <i class="fa-solid fa-folder-open"></i> Parcourir vos fichiers
          </button>
        </label>
      </div>

      <!-- Image Gallery List with Reordering & Main Selector -->
      <div *ngIf="images.length > 0" class="gallery-container">
        <h4 class="gallery-title">
          <i class="fa-solid fa-images text-amber-600"></i> Galerie d'images ({{ images.length }})
        </h4>

        <div class="gallery-grid">
          <div *ngFor="let img of images; let i = index" 
               class="gallery-item-card" 
               [class.is-primary]="img.isPrimary">
            
            <!-- Thumbnail preview -->
            <div class="thumb-container">
              <img [src]="img.url" [alt]="'Photo produit ' + (i + 1)" class="gallery-thumb">
              <span *ngIf="img.isPrimary" class="primary-badge font-bold">
                <i class="fa-solid fa-star"></i> Principale
              </span>
            </div>

            <!-- Image Info & Reordering Controls -->
            <div class="item-controls-bar">
              
              <!-- Set Primary Radio / Button -->
              <button type="button" 
                      class="btn-set-primary" 
                      [class.active]="img.isPrimary"
                      (click)="setPrimary(i)"
                      title="Définir comme visuel principal de la fiche">
                <i class="fa-solid" [class.fa-star]="img.isPrimary" [class.fa-star-o]="!img.isPrimary"></i>
                <span>{{ img.isPrimary ? 'Principale' : 'Définir principale' }}</span>
              </button>

              <!-- Order Shift Left/Right or Up/Down -->
              <div class="reorder-btns">
                <button type="button" 
                        [disabled]="i === 0" 
                        (click)="moveImage(i, -1)" 
                        class="btn-order" 
                        title="Déplacer vers la gauche">
                  <i class="fa-solid fa-chevron-left"></i>
                </button>
                <button type="button" 
                        [disabled]="i === images.length - 1" 
                        (click)="moveImage(i, 1)" 
                        class="btn-order" 
                        title="Déplacer vers la droite">
                  <i class="fa-solid fa-chevron-right"></i>
                </button>
              </div>

              <!-- Delete Button -->
              <button type="button" 
                      (click)="removeImage(i)" 
                      class="btn-delete-img" 
                      title="Supprimer la photo">
                <i class="fa-solid fa-trash-can"></i>
              </button>

            </div>

          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .product-images-manager {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .dropzone-box {
      border: 2px dashed #CBD5E1;
      border-radius: 16px;
      background: #FAF9F6;
      padding: 2rem 1.5rem;
      text-align: center;
      transition: all 0.25s ease;
    }
    .dropzone-box:hover, .dropzone-box.dragging {
      border-color: #C5A880;
      background: #F7F3EE;
    }
    .hidden-file-input {
      display: none;
    }
    .dropzone-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.85rem;
      cursor: pointer;
    }
    .upload-icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      color: #D97706;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .main-upload-text {
      font-weight: 700;
      font-size: 1rem;
      color: #0F172A;
      display: block;
    }
    .sub-upload-text {
      font-size: 0.8rem;
      color: #64748B;
      display: block;
      margin-top: 0.2rem;
    }
    .btn-browse-files {
      background: #0F172A;
      color: #FFFFFF;
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      border: none;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .gallery-container {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 1.25rem;
    }
    .gallery-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 1rem;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .gallery-item-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
    }
    .gallery-item-card.is-primary {
      border-color: #C5A880;
      box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.2);
    }
    .thumb-container {
      position: relative;
      width: 100%;
      height: 140px;
      background: #FFFFFF;
    }
    .gallery-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .primary-badge {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      background: #C5A880;
      color: #FFFFFF;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-size: 0.675rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .item-controls-bar {
      padding: 0.65rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #FFFFFF;
      border-top: 1px solid #F1F5F9;
    }
    .btn-set-primary {
      background: transparent;
      border: none;
      font-size: 0.725rem;
      font-weight: 700;
      color: #64748B;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .btn-set-primary.active {
      color: #D97706;
    }
    .reorder-btns {
      display: flex;
      gap: 0.2rem;
    }
    .btn-order {
      width: 26px;
      height: 26px;
      border: 1px solid #CBD5E1;
      background: #F8FAFC;
      border-radius: 6px;
      font-size: 0.7rem;
      cursor: pointer;
    }
    .btn-order:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .btn-delete-img {
      width: 26px;
      height: 26px;
      border: 1px solid #FCA5A5;
      background: #FEF2F2;
      color: #DC2626;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
    }
  `]
})
export class ProductImagesComponent {
  @Input() images: ProductImage[] = [];
  @Output() imagesChange = new EventEmitter<ProductImage[]>();
  @Output() fileUploaded = new EventEmitter<File[]>();

  isDragging: boolean = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]): void {
    this.fileUploaded.emit(files);

    // Create immediate local previews
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const newImg: ProductImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          url,
          isPrimary: this.images.length === 0 && index === 0,
          sortOrder: this.images.length + index + 1,
          filename: file.name,
          sizeBytes: file.size
        };
        this.images = [...this.images, newImg];
        this.imagesChange.emit(this.images);
      };
      reader.readAsDataURL(file);
    });
  }

  setPrimary(index: number): void {
    this.images = this.images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    this.imagesChange.emit(this.images);
  }

  moveImage(index: number, direction: number): void {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.images.length) return;

    const list = [...this.images];
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;

    // Update sortOrder
    this.images = list.map((img, i) => ({ ...img, sortOrder: i + 1 }));
    this.imagesChange.emit(this.images);
  }

  removeImage(index: number): void {
    const wasPrimary = this.images[index].isPrimary;
    this.images = this.images.filter((_, i) => i !== index);

    if (wasPrimary && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }

    this.images = this.images.map((img, i) => ({ ...img, sortOrder: i + 1 }));
    this.imagesChange.emit(this.images);
  }
}
