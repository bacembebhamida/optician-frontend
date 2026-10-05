import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OptiVisionService } from '../../services/optivision.service';
import { AuthRoleService, UserProfile } from '../../services/auth-role.service';

export interface MegaCategoryItem {
  label: string;
  route: string;
  query?: Record<string, string>;
}

export interface MegaCategoryColumn {
  name: string;
  icon: string;
  items: MegaCategoryItem[];
}

export interface MegaCategorySection {
  title: string;
  columns: MegaCategoryColumn[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  cartCount: number = 0;
  favoriteCount: number = 0;
  currentLang: 'FR' | 'AR' | 'EN' = 'FR';
  isMobileMenuOpen: boolean = false;
  isSearchOpen: boolean = false;
  isLangOpen: boolean = false;
  searchQuery: string = '';
  currentUser: UserProfile | null = null;
  activeMegaMenu: 'VUE' | 'SOLEIL' | 'LENTILLES' | 'MARQUES' | null = null;

  categoriesData: Record<'vue' | 'soleil' | 'lentilles' | 'marques', MegaCategorySection> = {
    vue: {
      title: 'Lunettes de Vue',
      columns: [
        {
          name: 'Par Genre',
          icon: 'fa-solid fa-user',
          items: [
            { label: 'Hommes', route: '/lunettes', query: { gender: 'HOMME' } },
            { label: 'Femmes', route: '/lunettes', query: { gender: 'FEMME' } },
            { label: 'Enfants & Ados', route: '/lunettes', query: { gender: 'ENFANT' } },
            { label: 'Collections Unisex', route: '/lunettes', query: { gender: 'UNISEX' } }
          ]
        },
        {
          name: 'Par Forme de Monture',
          icon: 'fa-solid fa-glasses',
          items: [
            { label: 'Montures Rondes & Pantos', route: '/lunettes', query: { shape: 'ROND' } },
            { label: 'Carrées & Rectangulaires', route: '/lunettes', query: { shape: 'CARRE' } },
            { label: 'Papillon & Cat-Eye', route: '/lunettes', query: { shape: 'PAPILLON' } },
            { label: 'Ovales & Minimalistes', route: '/lunettes', query: { shape: 'OVALE' } }
          ]
        },
        {
          name: 'Matières & Verres',
          icon: 'fa-solid fa-gem',
          items: [
            { label: 'Titane Pur Ultra-Léger', route: '/lunettes', query: { material: 'TITANE' } },
            { label: 'Acétate Fait Main', route: '/lunettes', query: { material: 'ACETATE' } },
            { label: 'Verres Anti-Lumière Bleue', route: '/lunettes', query: { lens: 'BLUEBLOCK' } },
            { label: 'Verres Anti-Reflet Ultra', route: '/lunettes', query: { lens: 'ANTIREFLET' } }
          ]
        }
      ]
    },
    soleil: {
      title: 'Lunettes de Soleil',
      columns: [
        {
          name: 'Collections Solaire',
          icon: 'fa-solid fa-sun',
          items: [
            { label: 'Solaire Homme', route: '/soleil', query: { gender: 'HOMME' } },
            { label: 'Solaire Femme Luxe', route: '/soleil', query: { gender: 'FEMME' } },
            { label: 'Verres Polarisés Premium', route: '/soleil', query: { feature: 'POLARISE' } },
            { label: 'Collection Sport & Outdoor', route: '/soleil', query: { style: 'SPORT' } }
          ]
        },
        {
          name: 'Style & Tendances',
          icon: 'fa-solid fa-wand-magic-sparkles',
          items: [
            { label: 'Modèles Aviateur Iconiques', route: '/soleil', query: { shape: 'AVIATEUR' } },
            { label: 'Montures Oversized', route: '/soleil', query: { shape: 'OVERSIZED' } },
            { label: 'Écaille Vintage & Retro', route: '/soleil', query: { style: 'VINTAGE' } },
            { label: 'Montures Dorées Or 18k', route: '/soleil', query: { style: 'PREMIUM' } }
          ]
        }
      ]
    },
    lentilles: {
      title: 'Lentilles de Contact & Soins',
      columns: [
        {
          name: 'Catégories de Lentilles',
          icon: 'fa-solid fa-eye',
          items: [
            { label: 'Lentilles Mensuelles Hydrogel', route: '/lentilles', query: { type: 'MENSUEL' } },
            { label: 'Lentilles Journalières 30-Pack', route: '/lentilles', query: { type: 'JOURNALIER' } },
            { label: 'Lentilles pour Astigmates', route: '/lentilles', query: { type: 'TORIQUE' } },
            { label: 'Lentilles Progressives / Presbyte', route: '/lentilles', query: { type: 'MULTIFOCALE' } }
          ]
        },
        {
          name: 'Soins & Produits d\'Entretien',
          icon: 'fa-solid fa-bottle-water',
          items: [
            { label: 'Solutions Multi-Fonctions 360ml', route: '/lentilles', query: { care: 'SOLUTION' } },
            { label: 'Gouttes Hydratantes Confort 24h', route: '/lentilles', query: { care: 'GOUTTES' } },
            { label: 'Étuis Stériles & Kits Voyage', route: '/lentilles', query: { care: 'ETUI' } }
          ]
        }
      ]
    },
    marques: {
      title: 'Grandes Maisons & Créateurs',
      columns: [
        {
          name: 'Haute Lunetterie',
          icon: 'fa-solid fa-crown',
          items: [
            { label: 'RAY-BAN (Italie)', route: '/marques', query: { brand: 'RAY-BAN' } },
            { label: 'GUCCI Eyewear', route: '/marques', query: { brand: 'GUCCI' } },
            { label: 'TOM FORD Eyewear', route: '/marques', query: { brand: 'TOM FORD' } },
            { label: 'PERSOL Handmade', route: '/marques', query: { brand: 'PERSOL' } }
          ]
        },
        {
          name: 'Sport & Design',
          icon: 'fa-solid fa-bolt',
          items: [
            { label: 'OAKLEY Sport Optics', route: '/marques', query: { brand: 'OAKLEY' } },
            { label: 'PRADA Milano', route: '/marques', query: { brand: 'PRADA' } },
            { label: 'CHANEL Paris', route: '/marques', query: { brand: 'CHANEL' } },
            { label: 'OLIVER PEOPLES L.A.', route: '/marques', query: { brand: 'OLIVER PEOPLES' } }
          ]
        }
      ]
    }
  };

  constructor(
    public optiService: OptiVisionService,
    private auth: AuthRoleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.optiService.cartItems$.subscribe(items => {
      this.cartCount = items.reduce((acc, i) => acc + i.quantity, 0);
    });

    this.optiService.favoriteIds$.subscribe(favs => {
      this.favoriteCount = favs.length;
    });

    this.optiService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });

    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  setLang(lang: 'FR' | 'AR' | 'EN'): void {
    this.optiService.setLanguage(lang);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  openMega(menu: 'VUE' | 'SOLEIL' | 'LENTILLES' | 'MARQUES'): void {
    this.activeMegaMenu = menu;
  }

  closeMega(): void {
    this.activeMegaMenu = null;
  }

  toggleMega(menu: 'VUE' | 'SOLEIL' | 'LENTILLES' | 'MARQUES'): void {
    if (this.activeMegaMenu === menu) {
      this.activeMegaMenu = null;
    } else {
      this.activeMegaMenu = menu;
    }
  }

  navigateToCategory(route: string, queryParams?: Record<string, string>): void {
    this.closeMega();
    this.router.navigate([route], { queryParams: queryParams });
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  get accountLink(): string {
    return this.isAdmin ? '/admin' : '/mon-compte';
  }

  get displayName(): string {
    return this.currentUser?.fullName.split(' ')[0] || '';
  }

  logout(): void {
    this.auth.logout().subscribe(() => {
      this.isMobileMenuOpen = false;
      this.router.navigate(['/']);
    });
  }
}
