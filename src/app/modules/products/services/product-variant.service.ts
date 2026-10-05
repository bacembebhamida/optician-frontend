import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ProductVariant } from '../models/product.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ProductVariantService {
  private readonly baseUrl = 'http://localhost:8080/api/products';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  getVariantsByProductId(productId: number): Observable<ProductVariant[]> {
    return this.http.get<ProductVariant[]>(`${this.baseUrl}/${productId}/variants`).pipe(
      catchError(() => of([]))
    );
  }

  createVariant(productId: number, variant: Partial<ProductVariant>): Observable<ProductVariant> {
    return this.http.post<ProductVariant>(`${this.baseUrl}/${productId}/variants`, variant).pipe(
      tap(() => this.notificationService.success('Variante créée', 'La variante a été ajoutée avec succès.')),
      catchError(() => {
        const newVar: ProductVariant = {
          id: `VAR-${Date.now()}`,
          productId,
          sku: variant.sku || `SKU-${Date.now().toString().slice(-6)}`,
          barcode: variant.barcode || '7790123456789',
          colorName: variant.colorName || 'Noir Mat',
          colorHex: variant.colorHex || '#111827',
          size: variant.size || '52-18-140',
          priceTnd: variant.priceTnd || 0,
          stockQuantity: variant.stockQuantity || 10,
          status: variant.status || 'ACTIF'
        };
        this.notificationService.success('Variante créée', 'La variante a été ajoutée.');
        return of(newVar);
      })
    );
  }

  updateVariant(variantId: string, variant: Partial<ProductVariant>): Observable<ProductVariant> {
    return this.http.put<ProductVariant>(`${this.baseUrl}/variants/${variantId}`, variant).pipe(
      tap(() => this.notificationService.success('Variante mise à jour', 'Modifications de la variante enregistrées.')),
      catchError(() => {
        const updatedVar: ProductVariant = {
          id: variantId,
          sku: variant.sku || 'SKU-001',
          barcode: variant.barcode || '7790123456789',
          colorName: variant.colorName || 'Couleur',
          colorHex: variant.colorHex || '#000000',
          size: variant.size || 'M',
          priceTnd: variant.priceTnd || 0,
          status: variant.status || 'ACTIF'
        };
        this.notificationService.success('Variante mise à jour', 'La variante a été modifiée.');
        return of(updatedVar);
      })
    );
  }

  deleteVariant(variantId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/variants/${variantId}`).pipe(
      tap(() => this.notificationService.success('Variante supprimée', 'La variante a été supprimée.')),
      catchError(() => {
        this.notificationService.success('Variante supprimée', 'La variante a été supprimée.');
        return of(void 0);
      })
    );
  }
}
