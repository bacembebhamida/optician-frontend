import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OptiVisionService } from '../../services/optivision.service';
import { AuthRoleService, UserProfile } from '../../services/auth-role.service';

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
