import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CategoryTreeItem } from '../models/optivision.models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private mockCategories: CategoryTreeItem[] = [
    {
      id: 1,
      name: 'Lunettes de vue',
      slug: 'lunettes-de-vue',
      route: '/lunettes-de-vue',
      isOpen: true,
      children: [
        { id: 11, name: 'Hommes', slug: 'hommes', route: '/lunettes-de-vue/hommes', queryParams: { gender: 'HOMME' } },
        { id: 12, name: 'Femmes', slug: 'femmes', route: '/lunettes-de-vue/femmes', queryParams: { gender: 'FEMME' } },
        { id: 13, name: 'Enfants', slug: 'enfants', route: '/lunettes-de-vue/enfants', queryParams: { gender: 'ENFANT' } },
        { id: 14, name: 'Unisexe', slug: 'unisexe', route: '/lunettes-de-vue', queryParams: { gender: 'UNISEX' } }
      ]
    },
    {
      id: 2,
      name: 'Lunettes de soleil',
      slug: 'lunettes-de-soleil',
      route: '/lunettes-de-soleil',
      isOpen: true,
      children: [
        { id: 21, name: 'Hommes', slug: 'hommes', route: '/lunettes-de-soleil/hommes', queryParams: { gender: 'HOMME' } },
        { id: 22, name: 'Femmes', slug: 'femmes', route: '/lunettes-de-soleil/femmes', queryParams: { gender: 'FEMME' } },
        { id: 23, name: 'Enfants', slug: 'enfants', route: '/lunettes-de-soleil/enfants', queryParams: { gender: 'ENFANT' } },
        { id: 24, name: 'Unisexe', slug: 'unisexe', route: '/lunettes-de-soleil', queryParams: { gender: 'UNISEX' } }
      ]
    },
    {
      id: 3,
      name: 'Lentilles',
      slug: 'lentilles',
      route: '/lentilles',
      isOpen: true,
      children: [
        { id: 31, name: 'Journalières', slug: 'journalieres', route: '/lentilles', queryParams: { type: 'JOURNALIER' } },
        { id: 32, name: 'Mensuelles', slug: 'mensuelles', route: '/lentilles', queryParams: { type: 'MENSUEL' } },
        { id: 33, name: 'Astigmatisme', slug: 'astigmatisme', route: '/lentilles', queryParams: { type: 'ASTIGMATISME' } },
        { id: 34, name: 'Multifocales', slug: 'multifocales', route: '/lentilles', queryParams: { type: 'MULTIFOCALE' } }
      ]
    },
    {
      id: 4,
      name: 'Accessoires',
      slug: 'accessoires',
      route: '/accessoires',
      isOpen: false,
      children: [
        { id: 41, name: 'Étuis', slug: 'etuis', route: '/accessoires', queryParams: { type: 'ETUI' } },
        { id: 42, name: 'Produits d\'entretien', slug: 'entretien', route: '/accessoires', queryParams: { type: 'ENTRETIEN' } },
        { id: 43, name: 'Cordons', slug: 'cordons', route: '/accessoires', queryParams: { type: 'CORDON' } }
      ]
    },
    {
      id: 5,
      name: 'Marques',
      slug: 'marques',
      route: '/marques',
      isOpen: true,
      children: [
        { id: 51, name: 'Toutes les marques', slug: 'toutes-les-marques', route: '/marques' },
        { id: 52, name: 'Ray-Ban', slug: 'ray-ban', route: '/marques', queryParams: { brand: 'Ray-Ban' } },
        { id: 53, name: 'Oakley', slug: 'oakley', route: '/marques', queryParams: { brand: 'Oakley' } },
        { id: 54, name: 'Tom Ford', slug: 'tom-ford', route: '/marques', queryParams: { brand: 'Tom Ford' } },
        { id: 55, name: 'Gucci', slug: 'gucci', route: '/marques', queryParams: { brand: 'Gucci' } },
        { id: 56, name: 'Prada', slug: 'prada', route: '/marques', queryParams: { brand: 'Prada' } },
        { id: 57, name: 'Persol', slug: 'persol', route: '/marques', queryParams: { brand: 'Persol' } }
      ]
    }
  ];

  getCategories(): Observable<CategoryTreeItem[]> {
    return of(this.mockCategories);
  }
}
