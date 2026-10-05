import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OptiVisionService } from '../../services/optivision.service';
import { Product, StyleCategory } from '../../models/optivision.models';

export interface HeroSlide {
  id: number;
  badge: string;
  titleLine1: string;
  titleHighlight: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaRoute: string;
  secondaryCtaText: string;
  secondaryCtaRoute: string;
  perksBadgeTitle: string;
  perksBadgeDesc: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  featuredProducts: Product[] = [];
  selectedStyleFilter: StyleCategory | 'ALL' = 'ALL';
  selectedProductForModal: Product | null = null;
  favoriteIds: number[] = [];

  // ── HERO DYNAMIC CAROUSEL SLIDES ──────────────────────────────────
  heroSlides: HeroSlide[] = [
    {
      id: 1,
      badge: 'Collection Haute Lunetterie 2026',
      titleLine1: 'Voir le monde',
      titleHighlight: 'autrement.',
      subtitle: 'L\'excellence de la haute lunetterie internationale alliée au taillage de précision suisse et à l\'essai virtuel en temps réel 3D.',
      imageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=1920&auto=format&fit=crop&q=90',
      ctaText: 'Découvrir la Collection',
      ctaRoute: '/catalogue',
      secondaryCtaText: 'Essayage Virtuel 3D',
      secondaryCtaRoute: '/try-on',
      perksBadgeTitle: 'Verres Optiques Premium',
      perksBadgeDesc: 'Surfaçage HD & Anti-Lumière Bleue'
    },
    {
      id: 2,
      badge: 'Nouvelle Saison Solaire 2026',
      titleLine1: 'L\'Élégance Solaire',
      titleHighlight: 'Haute Couture.',
      subtitle: 'Découvrez les dernières montures de soleil signées Ray-Ban, Tom Ford, Gucci, Prada & Persol.',
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1920&auto=format&fit=crop&q=90',
      ctaText: 'Lunettes de Soleil',
      ctaRoute: '/lunettes-de-soleil',
      secondaryCtaText: 'Essayage Virtuel',
      secondaryCtaRoute: '/try-on',
      perksBadgeTitle: 'Protection UV400 Totale',
      perksBadgeDesc: 'Verres Polarisés & Antireflet HD'
    },
    {
      id: 3,
      badge: 'Innovations Optiques 3D',
      titleLine1: 'Essayez vos montures',
      titleHighlight: 'directement en 3D.',
      subtitle: 'Une technologie de miroir virtuel révolutionnaire. Simulez votre ajustement et votre style en temps réel avec votre webcam.',
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1920&auto=format&fit=crop&q=90',
      ctaText: 'Démarrer le Try-On 3D',
      ctaRoute: '/try-on',
      secondaryCtaText: 'Prendre Rendez-vous',
      secondaryCtaRoute: '/rdv',
      perksBadgeTitle: 'Ajustement Morphologique',
      perksBadgeDesc: 'Calcul d\'écart pupillaire en direct'
    },
    {
      id: 4,
      badge: 'Sur-Mesure & Expertise Optique',
      titleLine1: 'Examen de Vue &',
      titleHighlight: 'Conseil VIP.',
      subtitle: 'Prenez rendez-vous dans nos boutiques avec nos maîtres opticiens et bénéficiez d\'un examen de vue offert et personnalisé.',
      imageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=1920&auto=format&fit=crop&q=90',
      ctaText: 'Prendre Rendez-vous',
      ctaRoute: '/rdv',
      secondaryCtaText: 'Nos Boutiques',
      secondaryCtaRoute: '/magasins',
      perksBadgeTitle: 'Examen Offert',
      perksBadgeDesc: 'Optométristes diplômés d\'État'
    }
  ];

  currentSlideIndex: number = 0;
  private slideTimer: any = null;

  styleCategories: { name: StyleCategory; label: string; desc: string; icon: string }[] = [
    { name: 'MINIMALISTE', label: 'Minimaliste', desc: 'Finesse et titane épuré', icon: 'fa-solid fa-feather' },
    { name: 'CLASSIQUE', label: 'Classique', desc: 'Lignes intemporelles', icon: 'fa-solid fa-crown' },
    { name: 'MODERNE', label: 'Moderne', desc: 'Design contemporain', icon: 'fa-solid fa-wand-magic-sparkles' },
    { name: 'VINTAGE', label: 'Vintage', desc: 'Charme rétro iconique', icon: 'fa-solid fa-glasses' },
    { name: 'SPORT', label: 'Sport', desc: 'Résistance & Performance', icon: 'fa-solid fa-person-running' },
    { name: 'PREMIUM', label: 'Premium Luxury', desc: 'Matériaux rares & or', icon: 'fa-solid fa-gem' }
  ];

  constructor(public optiService: OptiVisionService) {}

  ngOnInit(): void {
    this.optiService.getProducts().subscribe(products => {
      this.featuredProducts = products;
    });

    this.optiService.favoriteIds$.subscribe(ids => {
      this.favoriteIds = ids;
    });

    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.stopAutoSlide();
    this.slideTimer = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  stopAutoSlide(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
      this.slideTimer = null;
    }
  }

  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.heroSlides.length;
  }

  prevSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.heroSlides.length) % this.heroSlides.length;
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
    this.startAutoSlide();
  }

  isFavorite(productId: number): boolean {
    return this.favoriteIds.includes(productId);
  }

  toggleFavorite(productId: number): void {
    this.optiService.toggleFavorite(productId);
  }

  addToCart(product: Product): void {
    this.optiService.addToCart(product);
  }

  openQuickView(product: Product): void {
    this.selectedProductForModal = product;
  }

  closeQuickView(): void {
    this.selectedProductForModal = null;
  }

  luxuryBrands: string[] = [
    'RAY-BAN', 'GUCCI', 'TOM FORD', 'PERSOL', 'OAKLEY', 'PRADA', 'CHANEL', 'OLIVER PEOPLES', 'MYKITA'
  ];

  testimonials = [
    {
      author: 'Sonia Ben Ammar',
      role: 'Patiente & Cliente Fidèle',
      city: 'Tunis Ennasr',
      comment: 'La précision du taillage des verres et la qualité de ma monture Ray-Ban sont exceptionnelles. L\'équipe d\'OptiVision est au sommet de l\'expertise !',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      purchasedItem: 'Ray-Ban Wayfarer Titane'
    },
    {
      author: 'Mohamed Karray',
      role: 'Architecte d\'Intérieur',
      city: 'La Marsa',
      comment: 'L\'essayage virtuel 3D directement en ligne m\'a bluffé. J\'ai pu valider l\'ajustement de mes lunettes Gucci avant d\'aller chercher ma commande en boutique.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      purchasedItem: 'Gucci Solaire Élégance'
    },
    {
      author: 'Leïla Driss',
      role: 'Avocate',
      city: 'Sousse Centre',
      comment: 'Un accueil chaleureux et des verres anti-lumière bleue ultra performants pour mon travail au quotidien sur écran. Un service 5 étoiles.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      purchasedItem: 'Tom Ford Blue Block'
    }
  ];

  categoryCards = [
    {
      title: 'Lunettes de Vue',
      subtitle: 'Montures & Verres Sur-Mesure',
      tag: 'ESSENTIELLES',
      route: '/lunettes',
      imageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop&q=80',
      badgeColor: 'gold'
    },
    {
      title: 'Lunettes de Soleil',
      subtitle: 'Haute Protection UV & Polarisées',
      tag: 'COLLECTION SOLAIRE',
      route: '/soleil',
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
      badgeColor: 'amber'
    },
    {
      title: 'Lunettes Enfants',
      subtitle: 'Ergonomie, Flexibilité & Solidité',
      tag: 'JUNIOR & ADOS',
      route: '/lunettes',
      imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
      badgeColor: 'sky'
    },
    {
      title: 'Lentilles de Contact',
      subtitle: 'Hydratation 24h & Haute Oxygénation',
      tag: 'SOINS & CONFORT',
      route: '/lentilles',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      badgeColor: 'teal'
    },
    {
      title: 'Accessoires de Luxe',
      subtitle: 'Étuis Cuir, Cordons & Sprays',
      tag: 'ACCESSOIRES',
      route: '/lunettes',
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
      badgeColor: 'rose'
    }
  ];

  get filteredProducts(): Product[] {
    if (this.selectedStyleFilter === 'ALL') return this.featuredProducts;
    return this.featuredProducts.filter(p => p.style === this.selectedStyleFilter);
  }
}
