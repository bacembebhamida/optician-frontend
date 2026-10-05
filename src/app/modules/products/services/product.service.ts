import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  Product, ProductFilterParams, PagedResult,
  ProductStatus, ProductImage
} from '../models/product.model';
import { NotificationService } from './notification.service';

const INITIAL_MOCK_PRODUCTS: Product[] = [
  {
    id: 101,
    sku: 'RB-5228-2000-53',
    barcode: '805289307883',
    name: 'Ray-Ban RX5228 Optical High-Density',
    type: 'MONTURE',
    category: 'LUNETTES_VUE',
    subCategory: 'Montures Homme',
    brandId: 1,
    brandName: 'RAY-BAN',
    model: 'RX 5228',
    collection: 'Classic Icons 2026',
    gender: 'UNISEX',
    status: 'ACTIF',
    description: 'Monture de vue intemporelle en acétate haut de gamme avec charnières flexibles brevetées.',
    commercial: {
      purchasePriceTnd: 220.000,
      sellingPriceTnd: 450.000,
      vatRate: 19,
      marginTnd: 230.000,
      marginPercentage: 51.11
    },
    optical: {
      shape: 'RECTANGLE',
      material: 'ACETATE',
      color: 'Noir Brillant / Havane Inner',
      widthMm: 53,
      heightMm: 38,
      bridgeMm: 17,
      templeLengthMm: 140,
      lensType: 'UNIFOCAL',
      uvProtection: true,
      polarized: false
    },
    images: [
      { id: 'img-1', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80', isPrimary: true, sortOrder: 1, filename: 'rb-5228-main.jpg' },
      { id: 'img-2', url: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80', isPrimary: false, sortOrder: 2, filename: 'rb-5228-side.jpg' }
    ],
    variants: [
      { id: 'v-101-1', sku: 'RB-5228-2000-53', barcode: '805289307883', colorName: 'Noir Brillant', colorHex: '#111827', size: '53-17-140', priceTnd: 450.000, stockQuantity: 14, status: 'ACTIF' },
      { id: 'v-101-2', sku: 'RB-5228-2012-53', barcode: '805289307890', colorName: 'Écaille Havane', colorHex: '#78350F', size: '53-17-140', priceTnd: 470.000, stockQuantity: 8, status: 'ACTIF' }
    ],
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-09-15T14:20:00Z'
  },
  {
    id: 102,
    sku: 'TF-5634-001-52',
    barcode: '889214051240',
    name: 'Tom Ford FT5634 Titanium Luxury',
    type: 'MONTURE',
    category: 'LUNETTES_VUE',
    subCategory: 'Montures Homme',
    brandId: 2,
    brandName: 'TOM FORD',
    model: 'FT5634-B',
    collection: 'Private Eyewear Collection',
    gender: 'HOMME',
    status: 'ACTIF',
    description: 'Monture de prestige en titane ultra-léger et acétate de cellulose haut de gamme.',
    commercial: {
      purchasePriceTnd: 420.000,
      sellingPriceTnd: 790.000,
      vatRate: 19,
      marginTnd: 370.000,
      marginPercentage: 46.84
    },
    optical: {
      shape: 'CARRE',
      material: 'TITANE',
      color: 'Noir / Or Rose',
      widthMm: 52,
      heightMm: 41,
      bridgeMm: 19,
      templeLengthMm: 145,
      lensType: 'PROGRESSIF',
      uvProtection: true,
      polarized: false
    },
    images: [
      { id: 'img-3', url: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80', isPrimary: true, sortOrder: 1, filename: 'tf-5634-main.jpg' }
    ],
    variants: [
      { id: 'v-102-1', sku: 'TF-5634-001-52', barcode: '889214051240', colorName: 'Noir / Or', colorHex: '#000000', size: '52-19-145', priceTnd: 790.000, stockQuantity: 6, status: 'ACTIF' }
    ],
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-09-14T16:45:00Z'
  },
  {
    id: 103,
    sku: 'RB-3025-001-58',
    barcode: '805289004829',
    name: 'Ray-Ban Aviator Classic Gold Polarized',
    type: 'MONTURE',
    category: 'LUNETTES_SOLEIL',
    subCategory: 'Solaire Polarise',
    brandId: 1,
    brandName: 'RAY-BAN',
    model: 'RB3025 Aviator',
    collection: 'Icons Heritage',
    gender: 'UNISEX',
    status: 'ACTIF',
    description: 'Lunettes de soleil emblématiques de pilote avec monture en métal doré et verres polarisés G-15.',
    commercial: {
      purchasePriceTnd: 260.000,
      sellingPriceTnd: 520.000,
      vatRate: 19,
      marginTnd: 260.000,
      marginPercentage: 50.00
    },
    optical: {
      shape: 'AVIATEUR',
      material: 'METAL',
      color: 'Or Polie / Verres Vert G-15',
      widthMm: 58,
      heightMm: 50,
      bridgeMm: 14,
      templeLengthMm: 135,
      lensType: 'SOLAIRE',
      uvProtection: true,
      polarized: true
    },
    images: [
      { id: 'img-4', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80', isPrimary: true, sortOrder: 1, filename: 'aviator-main.jpg' }
    ],
    variants: [
      { id: 'v-103-1', sku: 'RB-3025-001-58', barcode: '805289004829', colorName: 'Doré / Vert', colorHex: '#D4AF37', size: '58-14-135', priceTnd: 520.000, stockQuantity: 22, status: 'ACTIF' }
    ],
    createdAt: '2026-03-01T09:15:00Z',
    updatedAt: '2026-09-12T10:10:00Z'
  },
  {
    id: 104,
    sku: 'GC-0089S-003',
    barcode: '889652109844',
    name: 'Gucci Square Signature Oversized',
    type: 'MONTURE',
    category: 'LUNETTES_SOLEIL',
    subCategory: 'Solaire Haute Couture',
    brandId: 3,
    brandName: 'GUCCI',
    model: 'GG0089S',
    collection: 'Fashion Statement 2026',
    gender: 'FEMME',
    status: 'ACTIF',
    description: 'Monture carrée oversize en acétate avec médaillon GG entrelacé sur les branches.',
    commercial: {
      purchasePriceTnd: 480.000,
      sellingPriceTnd: 890.000,
      vatRate: 19,
      marginTnd: 410.000,
      marginPercentage: 46.06
    },
    optical: {
      shape: 'PAPILLON',
      material: 'ACETATE',
      color: 'Écaille Foncée / Verres Degradé',
      widthMm: 56,
      heightMm: 48,
      bridgeMm: 18,
      templeLengthMm: 140,
      lensType: 'SOLAIRE',
      uvProtection: true,
      polarized: false
    },
    images: [
      { id: 'img-5', url: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80', isPrimary: true, sortOrder: 1, filename: 'gucci-square.jpg' }
    ],
    variants: [
      { id: 'v-104-1', sku: 'GC-0089S-003', barcode: '889652109844', colorName: 'Écaille Foncée', colorHex: '#451A03', size: '56-18-140', priceTnd: 890.000, stockQuantity: 9, status: 'ACTIF' }
    ],
    createdAt: '2026-04-18T14:30:00Z',
    updatedAt: '2026-09-10T11:25:00Z'
  },
  {
    id: 105,
    sku: 'OK-9208-0138',
    barcode: '888392001452',
    name: 'Oakley Radar EV Path Prizm Road',
    type: 'MONTURE',
    category: 'LUNETTES_SOLEIL',
    subCategory: 'Solaire Sport & Performance',
    brandId: 5,
    brandName: 'OAKLEY',
    model: 'Radar EV Path',
    collection: 'Pro Sport Performance',
    gender: 'UNISEX',
    status: 'ACTIF',
    description: 'Lunettes de sport aérodynamiques avec écran Prizm Road amplifiant la visibilité et les contrastes.',
    commercial: {
      purchasePriceTnd: 280.000,
      sellingPriceTnd: 540.000,
      vatRate: 19,
      marginTnd: 260.000,
      marginPercentage: 48.15
    },
    optical: {
      shape: 'RECTANGLE',
      material: 'INJECTE',
      color: 'Matte Black / Prizm Road',
      widthMm: 138,
      heightMm: 50,
      bridgeMm: 0,
      templeLengthMm: 128,
      lensType: 'SOLAIRE',
      uvProtection: true,
      polarized: false
    },
    images: [
      { id: 'img-6', url: 'https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?w=800&auto=format&fit=crop&q=80', isPrimary: true, sortOrder: 1, filename: 'oakley-radar.jpg' }
    ],
    variants: [
      { id: 'v-105-1', sku: 'OK-9208-0138', barcode: '888392001452', colorName: 'Matte Black', colorHex: '#18181B', size: '138-128', priceTnd: 540.000, stockQuantity: 15, status: 'ACTIF' }
    ],
    createdAt: '2026-05-22T08:40:00Z',
    updatedAt: '2026-09-08T15:30:00Z'
  },
  {
    id: 106,
    sku: 'LB-6520-GT-50',
    barcode: '5709123004561',
    name: 'Lindberg Titanium Rimless Air',
    type: 'MONTURE',
    category: 'LUNETTES_VUE',
    subCategory: 'Montures Homme',
    brandId: 6,
    brandName: 'LINDBERG',
    model: 'Air Titanium Rim',
    collection: 'Danish Minimalist Pro',
    gender: 'UNISEX',
    status: 'ACTIF',
    description: 'Chef-d’œuvre d’ingénierie danoise pesant seulement 2.9 grammes, réalisée en fil de titane médical.',
    commercial: {
      purchasePriceTnd: 750.000,
      sellingPriceTnd: 1350.000,
      vatRate: 19,
      marginTnd: 600.000,
      marginPercentage: 44.44
    },
    optical: {
      shape: 'ROND',
      material: 'TITANE',
      color: 'Titanium Grey Satin',
      widthMm: 50,
      heightMm: 42,
      bridgeMm: 20,
      templeLengthMm: 140,
      lensType: 'UNIFOCAL',
      uvProtection: true,
      polarized: false
    },
    images: [
      { id: 'img-7', url: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&auto=format&fit=crop&q=80', isPrimary: true, sortOrder: 1, filename: 'lindberg-rimless.jpg' }
    ],
    variants: [
      { id: 'v-106-1', sku: 'LB-6520-GT-50', barcode: '5709123004561', colorName: 'Titanium Grey', colorHex: '#64748B', size: '50-20-140', priceTnd: 1350.000, stockQuantity: 4, status: 'ACTIF' }
    ],
    createdAt: '2026-06-14T13:20:00Z',
    updatedAt: '2026-09-05T09:10:00Z'
  },
  {
    id: 107,
    sku: 'PR-17WV-1AB1O1',
    barcode: '8053672985112',
    name: 'Prada Symbole Geometric Acetate',
    type: 'MONTURE',
    category: 'LUNETTES_VUE',
    subCategory: 'Montures Femme',
    brandId: 4,
    brandName: 'PRADA',
    model: 'PR 17WV',
    collection: 'Symbole Collection',
    gender: 'FEMME',
    status: 'BROUILLON',
    description: 'Monture géométrique sculptée avec branches angulaires et logo Prada triangle sérigraphié.',
    commercial: {
      purchasePriceTnd: 380.000,
      sellingPriceTnd: 720.000,
      vatRate: 19,
      marginTnd: 340.000,
      marginPercentage: 47.22
    },
    optical: {
      shape: 'OCTOGONALE',
      material: 'ACETATE',
      color: 'Noir / Blanc Contrast',
      widthMm: 51,
      heightMm: 40,
      bridgeMm: 18,
      templeLengthMm: 140,
      lensType: 'UNIFOCAL',
      uvProtection: true,
      polarized: false
    },
    images: [
      { id: 'img-8', url: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&auto=format&fit=crop&q=80', isPrimary: true, sortOrder: 1, filename: 'prada-symbole.jpg' }
    ],
    variants: [],
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-09-01T11:00:00Z'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = 'http://localhost:8080/api/products';
  private productsSubject = new BehaviorSubject<Product[]>(INITIAL_MOCK_PRODUCTS);

  readonly products$: Observable<Product[]> = this.productsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  // ── Fetch & Filter Products (Server Pagination API with Offline Fallback) ──────
  getProducts(params: ProductFilterParams): Observable<PagedResult<Product>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.query) httpParams = httpParams.set('query', params.query);
    if (params.barcode) httpParams = httpParams.set('barcode', params.barcode);
    if (params.category && params.category !== 'ALL') httpParams = httpParams.set('category', params.category);
    if (params.brandId && params.brandId !== 'ALL') httpParams = httpParams.set('brandId', params.brandId.toString());
    if (params.type && params.type !== 'ALL') httpParams = httpParams.set('type', params.type);
    if (params.gender && params.gender !== 'ALL') httpParams = httpParams.set('gender', params.gender);
    if (params.material && params.material !== 'ALL') httpParams = httpParams.set('material', params.material);
    if (params.status && params.status !== 'ALL') httpParams = httpParams.set('status', params.status);
    if (params.minPrice != null) httpParams = httpParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice != null) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);

    return this.http.get<any>(this.baseUrl, { params: httpParams }).pipe(
      map((res: any) => {
        let rawItems: any[] = [];
        let totalItems = 0;
        let page = params.page;
        let pageSize = params.pageSize;
        let totalPages = 1;

        if (res && res.content) {
          rawItems = res.content;
          totalItems = res.totalElements != null ? res.totalElements : rawItems.length;
          page = res.number != null ? res.number + 1 : params.page;
          pageSize = res.size != null ? res.size : params.pageSize;
          totalPages = res.totalPages != null ? res.totalPages : 1;
        } else if (res && res.items) {
          rawItems = res.items;
          totalItems = res.totalItems || rawItems.length;
          page = res.page || params.page;
          pageSize = res.pageSize || params.pageSize;
          totalPages = res.totalPages || 1;
        } else if (Array.isArray(res)) {
          rawItems = res;
          totalItems = res.length;
        }

        const items = rawItems.map(item => this.mapProductFromBackend(item));

        return {
          items,
          totalItems,
          page,
          pageSize,
          totalPages
        } as PagedResult<Product>;
      }),
      catchError(() => {
        // Fallback filter over memory subject
        let filtered = [...this.productsSubject.value];

        if (params.query) {
          const q = params.query.toLowerCase().trim();
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.model.toLowerCase().includes(q) ||
            p.brandName.toLowerCase().includes(q) ||
            p.barcode.includes(q)
          );
        }

        if (params.barcode) {
          const b = params.barcode.trim();
          filtered = filtered.filter(p =>
            p.barcode.includes(b) ||
            p.variants.some(v => v.barcode.includes(b))
          );
        }

        if (params.category && params.category !== 'ALL') {
          filtered = filtered.filter(p => p.category === params.category);
        }

        if (params.brandId && params.brandId !== 'ALL') {
          filtered = filtered.filter(p => p.brandId === params.brandId);
        }

        if (params.type && params.type !== 'ALL') {
          filtered = filtered.filter(p => p.type === params.type);
        }

        if (params.gender && params.gender !== 'ALL') {
          filtered = filtered.filter(p => p.gender === params.gender);
        }

        if (params.material && params.material !== 'ALL') {
          filtered = filtered.filter(p => p.optical.material === params.material);
        }

        if (params.status && params.status !== 'ALL') {
          filtered = filtered.filter(p => p.status === params.status);
        }

        if (params.minPrice != null) {
          filtered = filtered.filter(p => p.commercial.sellingPriceTnd >= params.minPrice!);
        }

        if (params.maxPrice != null) {
          filtered = filtered.filter(p => p.commercial.sellingPriceTnd <= params.maxPrice!);
        }

        // Sorting
        if (params.sortBy) {
          const dir = params.sortDirection === 'desc' ? -1 : 1;
          filtered.sort((a, b) => {
            if (params.sortBy === 'name') return a.name.localeCompare(b.name) * dir;
            if (params.sortBy === 'sku') return a.sku.localeCompare(b.sku) * dir;
            if (params.sortBy === 'priceTnd') return (a.commercial.sellingPriceTnd - b.commercial.sellingPriceTnd) * dir;
            if (params.sortBy === 'brandName') return a.brandName.localeCompare(b.brandName) * dir;
            if (params.sortBy === 'updatedAt') return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
            return 0;
          });
        }

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / params.pageSize) || 1;
        const page = Math.max(1, Math.min(params.page, totalPages));
        const startIndex = (page - 1) * params.pageSize;
        const paginatedItems = filtered.slice(startIndex, startIndex + params.pageSize);

        return of({
          items: paginatedItems,
          totalItems,
          page,
          pageSize: params.pageSize,
          totalPages
        });
      })
    );
  }

  private mapProductFromBackend(raw: any): Product {
    if (!raw) return raw;
    const sellingPrice = raw.price != null ? raw.price : (raw.commercial?.sellingPriceTnd != null ? raw.commercial.sellingPriceTnd : 0);
    const purchasePrice = raw.commercial?.purchasePriceTnd != null ? raw.commercial.purchasePriceTnd : (sellingPrice * 0.5);
    const marginTnd = raw.commercial?.marginTnd != null ? raw.commercial.marginTnd : (sellingPrice - purchasePrice);
    const marginPercentage = raw.commercial?.marginPercentage != null ? raw.commercial.marginPercentage : (sellingPrice > 0 ? (marginTnd / sellingPrice) * 100 : 0);

    const images: ProductImage[] = (raw.images && raw.images.length > 0)
      ? raw.images.map((img: any, idx: number) => ({
          id: img.id ? String(img.id) : `img-${idx}`,
          url: img.url || raw.imageUrl || 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
          isPrimary: img.isPrimary ?? (idx === 0),
          sortOrder: img.sortOrder || idx + 1,
          filename: img.filename,
          sizeBytes: img.sizeBytes
        }))
      : (raw.imageUrl ? [{ id: 'img-1', url: raw.imageUrl, isPrimary: true, sortOrder: 1 }] : [
          { id: 'img-def', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80', isPrimary: true, sortOrder: 1 }
        ]);

    return {
      id: raw.id,
      sku: raw.sku || raw.reference || `REF-${raw.id}`,
      barcode: raw.barcode || raw.reference || '',
      name: raw.name || 'Produit sans nom',
      type: raw.type || raw.productType || 'MONTURE',
      category: raw.category || raw.categoryName || 'LUNETTES_VUE',
      subCategory: raw.subCategory || raw.subCategoryName || '',
      brandId: raw.brandId || 0,
      brandName: raw.brandName || raw.brand || 'OptiVision',
      model: raw.model || '',
      collection: raw.collection || '',
      gender: raw.gender || 'UNISEX',
      status: raw.status || (raw.active !== false ? 'ACTIF' : 'INACTIF'),
      description: raw.description || '',
      commercial: {
        purchasePriceTnd: purchasePrice,
        sellingPriceTnd: sellingPrice,
        vatRate: 19,
        marginTnd: marginTnd,
        marginPercentage: marginPercentage
      },
      optical: {
        shape: raw.frameShape || raw.optical?.shape || 'CARRE',
        material: raw.material || raw.optical?.material || 'ACETATE',
        color: raw.color || raw.optical?.color || '',
        widthMm: raw.optical?.widthMm || 52,
        heightMm: raw.optical?.heightMm || 40,
        bridgeMm: raw.optical?.bridgeMm || 18,
        templeLengthMm: raw.optical?.templeLengthMm || 140,
        lensType: raw.optical?.lensType || 'UNIFOCAL',
        uvProtection: true,
        polarized: false
      },
      images,
      variants: raw.variants || [],
      tryOn3dAvailable: raw.tryOn3dAvailable,
      model3dUrl: raw.model3dUrl,
      model3dConfig: raw.model3dConfig,
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString()
    };
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(raw => this.mapProductFromBackend(raw)),
      catchError(() => {
        const found = this.productsSubject.value.find(p => p.id === Number(id));
        if (!found) {
          throw new Error(`Produit #${id} introuvable.`);
        }
        return of(found);
      })
    );
  }

  createProduct(productData: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, productData).pipe(
      tap(created => {
        this.productsSubject.next([created, ...this.productsSubject.value]);
        this.notificationService.success('Produit créé', `Le produit "${created.name}" a été ajouté au catalogue.`);
      }),
      catchError(() => {
        const newProduct: Product = {
          id: Date.now(),
          sku: productData.sku || `SKU-${Date.now().toString().slice(-6)}`,
          barcode: productData.barcode || '7790123456789',
          name: productData.name || 'Nouveau Produit',
          type: productData.type || 'MONTURE',
          category: productData.category || 'LUNETTES_VUE',
          subCategory: productData.subCategory,
          brandId: productData.brandId || 1,
          brandName: productData.brandName || 'RAY-BAN',
          model: productData.model || 'Modèle 2026',
          collection: productData.collection,
          gender: productData.gender || 'UNISEX',
          status: productData.status || 'ACTIF',
          description: productData.description || 'Description du produit optique.',
          commercial: productData.commercial || {
            purchasePriceTnd: 100,
            sellingPriceTnd: 200,
            vatRate: 19,
            marginTnd: 100,
            marginPercentage: 50
          },
          optical: productData.optical || {
            shape: 'RECTANGLE',
            material: 'ACETATE',
            color: 'Noir',
            widthMm: 52,
            heightMm: 40,
            bridgeMm: 18,
            templeLengthMm: 140,
            lensType: 'UNIFOCAL',
            uvProtection: true,
            polarized: false
          },
          images: productData.images?.length ? productData.images : [
            { id: 'img-new', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80', isPrimary: true, sortOrder: 1 }
          ],
          variants: productData.variants || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        this.productsSubject.next([newProduct, ...this.productsSubject.value]);
        this.notificationService.success('Produit créé', `Le produit "${newProduct.name}" a été créé.`);
        return of(newProduct);
      })
    );
  }

  updateProduct(id: number, productData: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, productData).pipe(
      tap(updated => {
        const list = this.productsSubject.value.map(p => p.id === id ? updated : p);
        this.productsSubject.next(list);
        this.notificationService.success('Modifications enregistrées', `Le produit "${updated.name}" a été mis à jour.`);
      }),
      catchError(() => {
        let updatedProd!: Product;
        const list = this.productsSubject.value.map(p => {
          if (p.id === id) {
            updatedProd = { ...p, ...productData, updatedAt: new Date().toISOString() };
            return updatedProd;
          }
          return p;
        });
        this.productsSubject.next(list);
        this.notificationService.success('Modifications enregistrées', `Produit mis à jour.`);
        return of(updatedProd);
      })
    );
  }

  duplicateProduct(id: number): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/${id}/duplicate`, {}).pipe(
      tap(duplicated => {
        this.productsSubject.next([duplicated, ...this.productsSubject.value]);
        this.notificationService.success('Produit dupliqué', `Une copie de "${duplicated.name}" a été créée.`);
      }),
      catchError(() => {
        const original = this.productsSubject.value.find(p => p.id === id);
        if (!original) throw new Error('Produit original introuvable.');

        const duplicated: Product = {
          ...JSON.parse(JSON.stringify(original)),
          id: Date.now(),
          sku: `${original.sku}-COPY`,
          barcode: `${original.barcode}9`,
          name: `${original.name} (Copie)`,
          status: 'BROUILLON',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        this.productsSubject.next([duplicated, ...this.productsSubject.value]);
        this.notificationService.success('Produit dupliqué', `Copie créée avec le statut Brouillon.`);
        return of(duplicated);
      })
    );
  }

  toggleProductStatus(id: number): Observable<ProductStatus> {
    return this.http.patch<{ status: ProductStatus }>(`${this.baseUrl}/${id}/toggle-status`, {}).pipe(
      map(res => res.status),
      tap(newStatus => {
        this.notificationService.info('Statut mis à jour', `Nouveau statut : ${newStatus}`);
      }),
      catchError(() => {
        let newStatus: ProductStatus = 'INACTIF';
        const list = this.productsSubject.value.map(p => {
          if (p.id === id) {
            newStatus = p.status === 'ACTIF' ? 'INACTIF' : 'ACTIF';
            return { ...p, status: newStatus, updatedAt: new Date().toISOString() };
          }
          return p;
        });
        this.productsSubject.next(list);
        this.notificationService.info('Statut mis à jour', `Le statut du produit est maintenant : ${newStatus}`);
        return of(newStatus);
      })
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const list = this.productsSubject.value.filter(p => p.id !== id);
        this.productsSubject.next(list);
        this.notificationService.success('Produit supprimé', 'Le produit a été retiré du catalogue.');
      }),
      catchError(() => {
        const list = this.productsSubject.value.filter(p => p.id !== id);
        this.productsSubject.next(list);
        this.notificationService.success('Produit supprimé', 'Le produit a été supprimé.');
        return of(void 0);
      })
    );
  }

  bulkDeleteProducts(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/bulk-delete`, { ids }).pipe(
      tap(() => {
        const list = this.productsSubject.value.filter(p => !ids.includes(p.id));
        this.productsSubject.next(list);
        this.notificationService.success('Suppression groupée', `${ids.length} produit(s) supprimé(s).`);
      }),
      catchError(() => {
        const list = this.productsSubject.value.filter(p => !ids.includes(p.id));
        this.productsSubject.next(list);
        this.notificationService.success('Suppression groupée', `${ids.length} produit(s) supprimé(s).`);
        return of(void 0);
      })
    );
  }

  bulkUpdateStatus(ids: number[], status: ProductStatus): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/bulk-status`, { ids, status }).pipe(
      tap(() => {
        this.notificationService.info('Statuts mis à jour', `Statut "${status}" appliqué à ${ids.length} produit(s).`);
      }),
      catchError(() => {
        const list = this.productsSubject.value.map(p => ids.includes(p.id) ? { ...p, status } : p);
        this.productsSubject.next(list);
        this.notificationService.info('Statuts mis à jour', `Statut "${status}" appliqué à ${ids.length} produit(s).`);
        return of(void 0);
      })
    );
  }

  exportProducts(ids: number[], format: 'csv' | 'json' | 'pdf'): Observable<Blob> {
    // Multipart/Blob export endpoint trigger
    return this.http.post(`${this.baseUrl}/export?format=${format}`, { ids }, { responseType: 'blob' }).pipe(
      catchError(() => {
        const selected = this.productsSubject.value.filter(p => ids.length === 0 || ids.includes(p.id));
        const jsonStr = JSON.stringify(selected, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        this.notificationService.success('Export prêt', `Fichier ${format.toUpperCase()} généré pour ${selected.length} produit(s).`);
        return of(blob);
      })
    );
  }

  // ── Image Upload API (MinIO / S3 Backend Ready) ──────────────────────────
  uploadProductImage(productId: number, file: File): Observable<ProductImage> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ProductImage>(`${this.baseUrl}/${productId}/images`, formData).pipe(
      tap(img => this.notificationService.success('Image téléversée', 'Nouvelle image ajoutée à la galerie.')),
      catchError(() => {
        // Local FileReader preview fallback
        return new Observable<ProductImage>(subscriber => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const url = e.target?.result as string;
            const newImg: ProductImage = {
              id: `img-${Date.now()}`,
              url,
              isPrimary: false,
              sortOrder: Date.now(),
              filename: file.name,
              sizeBytes: file.size
            };
            this.notificationService.success('Image téléversée', `Fichier ${file.name} préparé pour l'envoi.`);
            subscriber.next(newImg);
            subscriber.complete();
          };
          reader.readAsDataURL(file);
        });
      })
    );
  }
}
