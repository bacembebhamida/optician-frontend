import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Category, CategoryDependencyCheck } from '../models/category.model';
import { NotificationService } from './notification.service';

const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Lunettes de vue',
    slug: 'lunettes-de-vue',
    description: 'Montures optiques pour verres correcteurs unifocaux et progressifs.',
    parentId: null,
    productCount: 42,
    active: true,
    sortOrder: 1,
    icon: 'fa-glasses',
    children: [
      { id: 11, name: 'Montures Homme', slug: 'montures-homme', parentId: 1, parentName: 'Lunettes de vue', productCount: 18, active: true, sortOrder: 1 },
      { id: 12, name: 'Montures Femme', slug: 'montures-femme', parentId: 1, parentName: 'Lunettes de vue', productCount: 16, active: true, sortOrder: 2 },
      { id: 13, name: 'Montures Enfant', slug: 'montures-enfant', parentId: 1, parentName: 'Lunettes de vue', productCount: 8, active: true, sortOrder: 3 }
    ]
  },
  {
    id: 2,
    name: 'Lunettes de soleil',
    slug: 'lunettes-de-soleil',
    description: 'Collection solaire haute protection UV400 et verres polarisés.',
    parentId: null,
    productCount: 35,
    active: true,
    sortOrder: 2,
    icon: 'fa-sun',
    children: [
      { id: 21, name: 'Solaire Polarise', slug: 'solaire-polarise', parentId: 2, parentName: 'Lunettes de soleil', productCount: 20, active: true, sortOrder: 1 },
      { id: 22, name: 'Solaire Sport & Performance', slug: 'solaire-sport', parentId: 2, parentName: 'Lunettes de soleil', productCount: 15, active: true, sortOrder: 2 }
    ]
  },
  {
    id: 3,
    name: 'Lentilles de contact',
    slug: 'lentilles-de-contact',
    description: 'Lentilles journalières, mensuelles et solutions de nettoyage.',
    parentId: null,
    productCount: 19,
    active: true,
    sortOrder: 3,
    icon: 'fa-eye',
    children: [
      { id: 31, name: 'Lentilles Mensuelles', slug: 'lentilles-mensuelles', parentId: 3, parentName: 'Lentilles de contact', productCount: 12, active: true, sortOrder: 1 },
      { id: 32, name: 'Produits d’entretien', slug: 'produits-entretien', parentId: 3, parentName: 'Lentilles de contact', productCount: 7, active: true, sortOrder: 2 }
    ]
  },
  {
    id: 4,
    name: 'Accessoires & Entretien',
    slug: 'accessoires-entretien',
    description: 'Étuis rigides, microfibres, cordons et sprays nettoyants.',
    parentId: null,
    productCount: 14,
    active: true,
    sortOrder: 4,
    icon: 'fa-box-open',
    children: []
  }
];

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly baseUrl = 'http://localhost:8080/api/categories';
  private categoriesSubject = new BehaviorSubject<Category[]>(MOCK_CATEGORIES);

  readonly categories$: Observable<Category[]> = this.categoriesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {
    this.refreshCategories();
  }

  refreshCategories(): void {
    this.http.get<Category[]>(this.baseUrl).pipe(
      tap(data => this.categoriesSubject.next(data)),
      catchError(err => {
        // HTTP fallback for offline demo
        return of(this.categoriesSubject.value);
      })
    ).subscribe();
  }

  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  getCategoryById(id: number): Observable<Category | null> {
    const flatten = (cats: Category[]): Category[] => {
      let res: Category[] = [];
      for (const c of cats) {
        res.push(c);
        if (c.children?.length) res = res.concat(flatten(c.children));
      }
      return res;
    };
    const found = flatten(this.categoriesSubject.value).find(c => c.id === id) || null;
    return of(found);
  }

  createCategory(categoryData: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, categoryData).pipe(
      tap(newCat => {
        this.refreshCategories();
        this.notificationService.success('Catégorie créée', `La catégorie "${newCat.name}" a été ajoutée.`);
      }),
      catchError(err => {
        const newCat: Category = {
          id: Date.now(),
          name: categoryData.name || 'Nouvelle catégorie',
          slug: (categoryData.name || 'cat').toLowerCase().replace(/\s+/g, '-'),
          description: categoryData.description || '',
          parentId: categoryData.parentId || null,
          parentName: categoryData.parentName,
          productCount: 0,
          active: categoryData.active !== undefined ? categoryData.active : true,
          sortOrder: categoryData.sortOrder || 1,
          children: []
        };
        const current = [...this.categoriesSubject.value];
        if (newCat.parentId) {
          const parent = current.find(c => c.id === newCat.parentId);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(newCat);
          } else {
            current.push(newCat);
          }
        } else {
          current.push(newCat);
        }
        this.categoriesSubject.next(current);
        this.notificationService.success('Catégorie créée', `La catégorie "${newCat.name}" a été ajoutée (mode démo).`);
        return of(newCat);
      })
    );
  }

  updateCategory(id: number, categoryData: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, categoryData).pipe(
      tap(updated => {
        this.refreshCategories();
        this.notificationService.success('Catégorie mise à jour', `La catégorie "${updated.name}" a été modifiée.`);
      }),
      catchError(err => {
        let updatedCat!: Category;
        const current = this.categoriesSubject.value.map(c => {
          if (c.id === id) {
            updatedCat = { ...c, ...categoryData };
            return updatedCat;
          }
          if (c.children?.length) {
            c.children = c.children.map(sub => {
              if (sub.id === id) {
                updatedCat = { ...sub, ...categoryData };
                return updatedCat;
              }
              return sub;
            });
          }
          return c;
        });
        this.categoriesSubject.next(current);
        this.notificationService.success('Catégorie mise à jour', `Modifications enregistrées.`);
        return of(updatedCat);
      })
    );
  }

  toggleCategoryStatus(id: number): Observable<Category> {
    return this.http.patch<Category>(`${this.baseUrl}/${id}/toggle-status`, {}).pipe(
      tap(() => this.refreshCategories()),
      catchError(() => {
        const categories = this.categoriesSubject.value;
        const updateStatusRecursive = (list: Category[]): boolean => {
          for (const item of list) {
            if (item.id === id) {
              item.active = !item.active;
              return true;
            }
            if (item.children && updateStatusRecursive(item.children)) return true;
          }
          return false;
        };
        updateStatusRecursive(categories);
        this.categoriesSubject.next([...categories]);
        this.notificationService.info('Statut mis à jour', 'Le statut de la catégorie a été modifié.');
        return of({} as Category);
      })
    );
  }

  checkCategoryDependency(id: number): Observable<CategoryDependencyCheck> {
    return this.http.get<CategoryDependencyCheck>(`${this.baseUrl}/${id}/dependencies`).pipe(
      catchError(() => {
        // Fallback check against local memory
        const current = this.categoriesSubject.value;
        const findCat = (list: Category[]): Category | null => {
          for (const c of list) {
            if (c.id === id) return c;
            if (c.children?.length) {
              const res = findCat(c.children);
              if (res) return res;
            }
          }
          return null;
        };
        const cat = findCat(current);
        if (!cat) {
          return of({ categoryId: id, canDelete: true, productCount: 0, subCategoryCount: 0 });
        }
        const subCount = cat.children?.length || 0;
        const prodCount = cat.productCount || 0;
        const canDelete = subCount === 0 && prodCount === 0;
        let reason: string | undefined;

        if (!canDelete) {
          const reasons: string[] = [];
          if (subCount > 0) reasons.push(`${subCount} sous-catégorie(s) liée(s)`);
          if (prodCount > 0) reasons.push(`${prodCount} produit(s) associé(s)`);
          reason = `Impossible de supprimer cette catégorie car elle possède ${reasons.join(' et ')}. Veuillez les déplacer ou les supprimer au préalable.`;
        }

        return of({
          categoryId: id,
          canDelete,
          productCount: prodCount,
          subCategoryCount: subCount,
          reason
        });
      })
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.refreshCategories();
        this.notificationService.success('Catégorie supprimée', 'La catégorie a été supprimée avec succès.');
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 400 || err.status === 409) {
          const msg = err.error?.message || 'Suppression impossible : des dépendances existent.';
          this.notificationService.error('Erreur de suppression', msg);
          return throwError(() => err);
        }
        // Local removal
        const removeRecursive = (list: Category[]): Category[] => {
          return list.filter(c => c.id !== id).map(c => {
            if (c.children?.length) {
              c.children = removeRecursive(c.children);
            }
            return c;
          });
        };
        const updated = removeRecursive(this.categoriesSubject.value);
        this.categoriesSubject.next(updated);
        this.notificationService.success('Catégorie supprimée', 'La catégorie a été supprimée.');
        return of(void 0);
      })
    );
  }
}
