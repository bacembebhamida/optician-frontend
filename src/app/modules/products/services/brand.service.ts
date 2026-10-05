import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Brand } from '../models/brand.model';
import { NotificationService } from './notification.service';

const MOCK_BRANDS: Brand[] = [
  {
    id: 1,
    name: 'RAY-BAN',
    slug: 'ray-ban',
    logoUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=120&auto=format&fit=crop&q=80',
    description: 'Icône mondiale du style eyewear depuis 1937, créateur des légendaires Wayfarer et Aviator.',
    websiteUrl: 'https://www.ray-ban.com',
    active: true,
    productCount: 42,
    countryOrigin: 'Italie / USA'
  },
  {
    id: 2,
    name: 'TOM FORD',
    slug: 'tom-ford',
    logoUrl: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=120&auto=format&fit=crop&q=80',
    description: 'Luxe audacieux, finitions artisanales italiennes et charnière iconique en T doré.',
    websiteUrl: 'https://www.tomford.com',
    active: true,
    productCount: 28,
    countryOrigin: 'Italie'
  },
  {
    id: 3,
    name: 'GUCCI',
    slug: 'gucci',
    logoUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=120&auto=format&fit=crop&q=80',
    description: 'Montures haute couture combinant esthétique vintage et détails dorés monogrammés.',
    websiteUrl: 'https://www.gucci.com',
    active: true,
    productCount: 24,
    countryOrigin: 'Italie'
  },
  {
    id: 4,
    name: 'PRADA',
    slug: 'prada',
    logoUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=120&auto=format&fit=crop&q=80',
    description: 'Design contemporain avant-gardiste et montures géométriques d’une élégance rare.',
    websiteUrl: 'https://www.prada.com',
    active: true,
    productCount: 19,
    countryOrigin: 'Italie'
  },
  {
    id: 5,
    name: 'OAKLEY',
    slug: 'oakley',
    logoUrl: 'https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=120&auto=format&fit=crop&q=80',
    description: 'Leader mondial de la lunetterie sportive, verres Prizm et matériaux légers O-Matter.',
    websiteUrl: 'https://www.oakley.com',
    active: true,
    productCount: 15,
    countryOrigin: 'USA'
  },
  {
    id: 6,
    name: 'LINDBERG',
    slug: 'lindberg',
    logoUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=120&auto=format&fit=crop&q=80',
    description: 'Montures minimalistes en titane pur danois sans vis ni soudures.',
    websiteUrl: 'https://lindberg.com',
    active: true,
    productCount: 11,
    countryOrigin: 'Danemark'
  }
];

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private readonly baseUrl = 'http://localhost:8080/api/brands';
  private brandsSubject = new BehaviorSubject<Brand[]>(MOCK_BRANDS);

  readonly brands$: Observable<Brand[]> = this.brandsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {
    this.refreshBrands();
  }

  refreshBrands(): void {
    this.http.get<Brand[]>(this.baseUrl).pipe(
      tap(data => this.brandsSubject.next(data)),
      catchError(() => of(this.brandsSubject.value))
    ).subscribe();
  }

  getBrands(): Observable<Brand[]> {
    return this.brands$;
  }

  getBrandById(id: number): Observable<Brand | null> {
    const found = this.brandsSubject.value.find(b => b.id === id) || null;
    return of(found);
  }

  createBrand(brandData: Partial<Brand>): Observable<Brand> {
    return this.http.post<Brand>(this.baseUrl, brandData).pipe(
      tap(newBrand => {
        this.refreshBrands();
        this.notificationService.success('Marque créée', `La marque "${newBrand.name}" a été ajoutée.`);
      }),
      catchError(() => {
        const newBrand: Brand = {
          id: Date.now(),
          name: brandData.name?.toUpperCase() || 'NOUVELLE MARQUE',
          slug: (brandData.name || 'brand').toLowerCase().replace(/\s+/g, '-'),
          logoUrl: brandData.logoUrl || 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=120&auto=format&fit=crop&q=80',
          description: brandData.description || 'Marque d’optique partenaire.',
          websiteUrl: brandData.websiteUrl || '',
          active: brandData.active !== undefined ? brandData.active : true,
          productCount: 0,
          countryOrigin: brandData.countryOrigin || 'International'
        };
        const updated = [...this.brandsSubject.value, newBrand];
        this.brandsSubject.next(updated);
        this.notificationService.success('Marque créée', `La marque "${newBrand.name}" a été ajoutée.`);
        return of(newBrand);
      })
    );
  }

  updateBrand(id: number, brandData: Partial<Brand>): Observable<Brand> {
    return this.http.put<Brand>(`${this.baseUrl}/${id}`, brandData).pipe(
      tap(updated => {
        this.refreshBrands();
        this.notificationService.success('Marque mise à jour', `La marque "${updated.name}" a été modifiée.`);
      }),
      catchError(() => {
        let updatedBrand!: Brand;
        const updated = this.brandsSubject.value.map(b => {
          if (b.id === id) {
            updatedBrand = { ...b, ...brandData };
            return updatedBrand;
          }
          return b;
        });
        this.brandsSubject.next(updated);
        this.notificationService.success('Marque mise à jour', `La marque a été modifiée.`);
        return of(updatedBrand);
      })
    );
  }

  toggleBrandStatus(id: number): Observable<Brand> {
    return this.http.patch<Brand>(`${this.baseUrl}/${id}/toggle-status`, {}).pipe(
      tap(() => this.refreshBrands()),
      catchError(() => {
        const updated = this.brandsSubject.value.map(b => {
          if (b.id === id) {
            return { ...b, active: !b.active };
          }
          return b;
        });
        this.brandsSubject.next(updated);
        this.notificationService.info('Statut mis à jour', 'Le statut de la marque a été modifié.');
        return of({} as Brand);
      })
    );
  }

  deleteBrand(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.refreshBrands();
        this.notificationService.success('Marque supprimée', 'La marque a été supprimée avec succès.');
      }),
      catchError(() => {
        const updated = this.brandsSubject.value.filter(b => b.id !== id);
        this.brandsSubject.next(updated);
        this.notificationService.success('Marque supprimée', 'La marque a été supprimée.');
        return of(void 0);
      })
    );
  }
}
