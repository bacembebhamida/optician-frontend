import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs/operators';
import { AuthRoleService, UserProfile } from '../../../services/auth-role.service';
import { ProductService } from '../../../modules/products/services/product.service';
import { Product } from '../../../modules/products/models/product.model';
import { StockAlertService } from '../../../modules/stock/services/stock-alert.service';
import { OptiVisionService } from '../../../services/optivision.service';

/** Élément de navigation simple (lien) */
export interface AdminNavLink {
  label: string;
  icon: string;
  link: string;
  queryParams?: Record<string, string>;
  badge?: string;
  badgeClass?: string;
}

/** Groupe de navigation repliable (Catalogue, Inventaire) */
export interface AdminNavGroup {
  id: string;
  label: string;
  icon: string;
  isOpen: boolean;
  children: AdminNavLink[];
}

/**
 * OptiVision Admin Layout — Shell professionnel partagé
 * Sidebar multi-sections + top bar (recherche globale, magasin actif, notifications, profil).
 * Encapsule toutes les routes /admin/* (catalogue, stock, catégories, marques...).
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="admin-shell" [class.sidebar-collapsed]="isSidebarCollapsed">

      <!-- 1. SIDEBAR PROFESSIONNELLE -->
      <aside class="admin-sidebar" [class.mobile-open]="isMobileSidebarOpen">
        <div class="sidebar-brand">
          <div class="brand-logo-icon">
            <i class="fa-solid fa-glasses"></i>
          </div>
          <div class="brand-title-wrap" *ngIf="!isSidebarCollapsed">
            <span class="brand-name">OPTI<span class="brand-accent">VISION</span></span>
            <span class="brand-tag">OPTIC FINAL SOLUTIONS</span>
          </div>
          <button class="collapse-toggle-btn hidden-mobile"
                  (click)="isSidebarCollapsed = !isSidebarCollapsed"
                  [title]="isSidebarCollapsed ? 'Déplier la barre' : 'Réduire la barre'">
            <i class="fa-solid" [class.fa-chevron-left]="!isSidebarCollapsed" [class.fa-chevron-right]="isSidebarCollapsed"></i>
          </button>
        </div>

        <!-- Navigation multi-sections -->
        <nav class="sidebar-nav">

          <!-- PILOTAGE -->
          <div class="nav-section-title" *ngIf="!isSidebarCollapsed">Pilotage</div>
          <a class="nav-item"
             routerLink="/admin/dashboard"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: true }"
             (click)="closeMobileSidebar()"
             title="Tableau de bord">
            <i class="fa-solid fa-chart-pie nav-icon"></i>
            <span class="nav-text" *ngIf="!isSidebarCollapsed">Tableau de bord</span>
          </a>

          <!-- GESTION COMMERCIALE -->
          <div class="nav-section-title" *ngIf="!isSidebarCollapsed">Gestion commerciale</div>

          <div class="nav-group">
            <button class="nav-item nav-item--group"
                    [class.group-open]="catalogueGroup.isOpen"
                    (click)="toggleGroup(catalogueGroup)"
                    title="Catalogue">
              <i class="fa-solid fa-boxes-packing nav-icon"></i>
              <span class="nav-text" *ngIf="!isSidebarCollapsed">{{ catalogueGroup.label }}</span>
              <i class="fa-solid chevron-icon"
                 *ngIf="!isSidebarCollapsed"
                 [class.fa-chevron-down]="catalogueGroup.isOpen"
                 [class.fa-chevron-right]="!catalogueGroup.isOpen"></i>
            </button>

            <div class="nav-sub-list" *ngIf="catalogueGroup.isOpen && !isSidebarCollapsed">
              <a class="nav-sub-item"
                 *ngFor="let child of catalogueGroup.children"
                 [routerLink]="child.link"
                 [queryParams]="child.queryParams || {}"
                 routerLinkActive="active-sub"
                 (click)="closeMobileSidebar()">
                <i class="fa-solid" [ngClass]="child.icon"></i>
                <span>{{ child.label }}</span>
                <span class="nav-badge" *ngIf="child.badge" [ngClass]="child.badgeClass">{{ child.badge }}</span>
              </a>
            </div>
          </div>

          <a class="nav-item"
             *ngFor="let item of commercialItems"
             [routerLink]="item.link"
             [queryParams]="item.queryParams || {}"
             (click)="closeMobileSidebar()"
             [title]="item.label">
            <i class="fa-solid nav-icon" [ngClass]="item.icon"></i>
            <span class="nav-text" *ngIf="!isSidebarCollapsed">{{ item.label }}</span>
            <span class="nav-badge" *ngIf="!isSidebarCollapsed && item.badge" [ngClass]="item.badgeClass">{{ item.badge }}</span>
          </a>

          <!-- INVENTAIRE & LOGISTIQUE -->
          <div class="nav-section-title" *ngIf="!isSidebarCollapsed">Inventaire &amp; Logistique</div>

          <div class="nav-group">
            <button class="nav-item nav-item--group"
                    [class.group-open]="inventoryGroup.isOpen"
                    (click)="toggleGroup(inventoryGroup)"
                    title="Inventaire">
              <i class="fa-solid fa-warehouse nav-icon"></i>
              <span class="nav-text" *ngIf="!isSidebarCollapsed">{{ inventoryGroup.label }}</span>
              <i class="fa-solid chevron-icon"
                 *ngIf="!isSidebarCollapsed"
                 [class.fa-chevron-down]="inventoryGroup.isOpen"
                 [class.fa-chevron-right]="!inventoryGroup.isOpen"></i>
            </button>

            <div class="nav-sub-list" *ngIf="inventoryGroup.isOpen && !isSidebarCollapsed">
              <a class="nav-sub-item"
                 *ngFor="let child of inventoryGroup.children"
                 [routerLink]="child.link"
                 [queryParams]="child.queryParams || {}"
                 routerLinkActive="active-sub"
                 (click)="closeMobileSidebar()">
                <i class="fa-solid" [ngClass]="child.icon"></i>
                <span>{{ child.label }}</span>
                <span class="nav-badge" *ngIf="child.badge" [ngClass]="child.badgeClass">{{ child.badge }}</span>
              </a>
            </div>
          </div>

          <!-- SERVICES & PILOTAGE -->
          <div class="nav-section-title" *ngIf="!isSidebarCollapsed">Services &amp; Pilotage</div>
          <a class="nav-item"
             *ngFor="let item of serviceItems"
             [routerLink]="item.link"
             [queryParams]="item.queryParams || {}"
             (click)="closeMobileSidebar()"
             [title]="item.label">
            <i class="fa-solid nav-icon" [ngClass]="item.icon"></i>
            <span class="nav-text" *ngIf="!isSidebarCollapsed">{{ item.label }}</span>
            <span class="nav-badge" *ngIf="!isSidebarCollapsed && item.badge" [ngClass]="item.badgeClass">{{ item.badge }}</span>
          </a>

        </nav>

        <!-- Statut système -->
        <div class="sidebar-footer" *ngIf="!isSidebarCollapsed">
          <div class="system-status-indicator">
            <span class="status-ping"></span>
            <span class="status-text">Système ERP Actif</span>
          </div>
          <span class="version-text">OptiVision v2.4 Pro</span>
        </div>
      </aside>

      <!-- ═══════════════════════════════════════════════════════════════
           2. TOP BAR — recherche globale, magasin, notifications, profil
      ═══════════════════════════════════════════════════════════════ -->
      <header class="admin-top-header">

        <div class="header-left">
          <button class="mobile-toggle-btn" (click)="isMobileSidebarOpen = !isMobileSidebarOpen" title="Menu">
            <i class="fa-solid fa-bars"></i>
          </button>

          <nav class="admin-breadcrumb" aria-label="Fil d'Ariane">
            <span class="crumb-parent"><i class="fa-solid fa-shield-halved"></i> Administration</span>
            <i class="fa-solid fa-chevron-right crumb-sep"></i>
            <span class="crumb-section">{{ breadcrumbSection }}</span>
            <i class="fa-solid fa-chevron-right crumb-sep"></i>
            <span class="crumb-active">{{ breadcrumbTitle }}</span>
          </nav>
        </div>

        <!-- Recherche globale avec dropdown -->
        <div class="header-center" (click)="$event.stopPropagation()">
          <div class="admin-search-wrap" [class.search-focused]="isSearchOpen">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input type="text"
                   [(ngModel)]="globalSearchQuery"
                   (ngModelChange)="onSearchInput()"
                   (focus)="onSearchFocus()"
                   placeholder="Rechercher un produit, SKU, marque, référence..."
                   class="admin-search-input"
                   autocomplete="off">
            <button *ngIf="globalSearchQuery" class="search-clear" (click)="clearSearch()" title="Effacer">
              <i class="fa-solid fa-xmark"></i>
            </button>
            <span class="search-kbd" *ngIf="!globalSearchQuery">CTRL + K</span>
          </div>

          <!-- Dropdown résultats -->
          <div class="search-dropdown" *ngIf="isSearchOpen && globalSearchQuery.length >= 2">
            <div class="search-dropdown__section" *ngIf="navMatches.length > 0">
              <span class="search-dropdown__label">Navigation</span>
              <button class="search-result search-result--nav"
                      *ngFor="let nav of navMatches"
                      (click)="goToNav(nav)">
                <span class="search-result__icon"><i class="fa-solid" [ngClass]="nav.icon"></i></span>
                <span class="search-result__main">
                  <span class="search-result__title">{{ nav.label }}</span>
                  <span class="search-result__sub">Page administration</span>
                </span>
              </button>
            </div>

            <div class="search-dropdown__section" *ngIf="searchResults.length > 0">
              <span class="search-dropdown__label">Produits ({{ searchResults.length }})</span>
              <button class="search-result"
                      *ngFor="let p of searchResults"
                      (click)="openProduct(p)">
                <img class="search-result__thumb" [src]="getProductThumb(p)" [alt]="p.name">
                <span class="search-result__main">
                  <span class="search-result__title">{{ p.name }}</span>
                  <span class="search-result__sub">{{ p.brandName }} · {{ p.sku }}</span>
                </span>
                <span class="search-result__price">{{ p.commercial.sellingPriceTnd | number:'1.3-3' }} DT</span>
              </button>
            </div>

            <div class="search-dropdown__empty"
                 *ngIf="!isSearchLoading && searchResults.length === 0 && navMatches.length === 0">
              <i class="fa-solid fa-circle-question"></i>
              Aucun résultat pour « {{ globalSearchQuery }} »
            </div>
          </div>
        </div>

        <!-- Actions de droite -->
        <div class="header-right">

          <div class="store-selector">
            <i class="fa-solid fa-location-dot store-icon"></i>
            <select [(ngModel)]="selectedStore" class="store-select" title="Magasin actif">
              <option *ngFor="let s of stores" [value]="s.id">{{ s.name }}</option>
            </select>
          </div>

          <div class="header-dropdown-wrap" (click)="$event.stopPropagation()">
            <button class="icon-btn" (click)="toggleNotifications()" title="Notifications">
              <i class="fa-regular fa-bell"></i>
              <span class="notif-dot">{{ notifications.length }}</span>
            </button>
            <div class="header-dropdown" *ngIf="isNotificationsOpen">
              <div class="header-dropdown__head">
                <span>Alertes &amp; notifications</span>
                <span class="header-dropdown__count">{{ notifications.length }}</span>
              </div>
              <div class="notif-row" *ngFor="let n of notifications">
                <span class="notif-row__icon" [ngClass]="n.tone"><i class="fa-solid" [ngClass]="n.icon"></i></span>
                <span class="notif-row__body">
                  <span class="notif-title">{{ n.title }}</span>
                  <span class="notif-desc">{{ n.desc }}</span>
                  <span class="notif-time">{{ n.time }}</span>
                </span>
              </div>
              <a class="header-dropdown__footer" routerLink="/admin/stock/alerts">Ouvrir le centre d'alertes</a>
            </div>
          </div>

          <div class="header-dropdown-wrap" (click)="$event.stopPropagation()">
            <button class="admin-user-profile" (click)="toggleProfile()" title="Mon profil">
              <span class="profile-avatar">{{ userInitials }}</span>
              <span class="profile-info">
                <span class="profile-name">{{ userName }}</span>
                <span class="profile-role">{{ userRoleLabel }}</span>
              </span>
              <i class="fa-solid fa-chevron-down profile-chevron"></i>
            </button>

            <div class="header-dropdown header-dropdown--profile" *ngIf="isProfileOpen">
              <div class="profile-card">
                <span class="profile-avatar profile-avatar--lg">{{ userInitials }}</span>
                <span class="profile-card__text">
                  <span class="notif-title">{{ userName }}</span>
                  <span class="notif-desc">{{ userEmail }}</span>
                </span>
              </div>
              <a class="header-dropdown__item" routerLink="/admin/dashboard"><i class="fa-solid fa-gauge"></i> Tableau de bord</a>
              <a class="header-dropdown__item" routerLink="/admin/products"><i class="fa-solid fa-glasses"></i> Catalogue produits</a>
              <a class="header-dropdown__item" routerLink="/admin/stock/dashboard"><i class="fa-solid fa-warehouse"></i> Inventaire multi-sites</a>
              <button class="header-dropdown__item header-dropdown__item--danger" (click)="logout()">
                <i class="fa-solid fa-right-from-bracket"></i> Se déconnecter
              </button>
            </div>
          </div>

        </div>
      </header>

      <!-- 3. CONTENU ROUTÉ -->
      <main class="admin-main-content">
        <router-outlet></router-outlet>
      </main>

    </div>
  `,
  styles: [`
    /* ── Shell global ── */
    .admin-shell {
      display: grid;
      grid-template-columns: 264px 1fr;
      grid-template-rows: 66px 1fr;
      grid-template-areas: "sidebar header" "sidebar main";
      min-height: 100vh;
      background-color: #F4F6FA;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      color: #1E293B;
      transition: grid-template-columns 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .admin-shell.sidebar-collapsed { grid-template-columns: 78px 1fr; }

    @media (max-width: 1024px) {
      .admin-shell {
        grid-template-columns: 1fr;
        grid-template-areas: "header" "main";
      }
    }

    /* ── Sidebar ── */
    .admin-sidebar {
      grid-area: sidebar;
      background-color: #0F172A;
      color: #94A3B8;
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      position: fixed;
      top: 0; bottom: 0; left: 0;
      width: 264px;
      z-index: 200;
      transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      overflow-x: hidden;
      overflow-y: auto;
    }
    .admin-shell.sidebar-collapsed .admin-sidebar { width: 78px; }

    .sidebar-brand {
      height: 66px;
      padding: 0 1.1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      flex-shrink: 0;
    }
    .brand-logo-icon {
      width: 2.35rem; height: 2.35rem;
      background: linear-gradient(135deg, #C5A880 0%, #8F724C 100%);
      color: #FFFFFF;
      border-radius: 0.65rem;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
      box-shadow: 0 2px 10px rgba(197, 168, 128, 0.35);
      flex-shrink: 0;
    }
    .brand-title-wrap { display: flex; flex-direction: column; white-space: nowrap; flex: 1; }
    .brand-name {
      font-size: 1.1rem; font-weight: 800; letter-spacing: 0.14em;
      color: #F8FAFC; line-height: 1;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }
    .brand-accent { color: #C5A880; }
    .brand-tag {
      font-size: 0.5rem; font-weight: 700; letter-spacing: 0.16em;
      color: #64748B; margin-top: 3px;
    }
    .collapse-toggle-btn {
      background: transparent; border: none; color: #64748B;
      cursor: pointer; padding: 0.35rem; border-radius: 0.4rem;
      transition: color 0.2s, background 0.2s;
    }
    .collapse-toggle-btn:hover { color: #F8FAFC; background: rgba(255, 255, 255, 0.06); }

    .sidebar-nav {
      padding: 0.85rem 0.7rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      flex: 1;
    }
    .nav-section-title {
      font-size: 0.62rem; font-weight: 700; letter-spacing: 0.14em;
      text-transform: uppercase; color: #475569;
      padding: 0.9rem 0.75rem 0.35rem;
      white-space: nowrap;
    }
    .nav-item {
      width: 100%;
      display: flex; align-items: center; gap: 0.8rem;
      padding: 0.6rem 0.8rem;
      font-size: 0.82rem; font-weight: 600;
      color: #94A3B8; background: transparent;
      border: none; border-left: 3px solid transparent;
      border-radius: 0.55rem;
      cursor: pointer; transition: all 0.18s ease;
      white-space: nowrap; text-align: left; text-decoration: none;
    }
    .nav-item:hover { color: #F8FAFC; background: rgba(255, 255, 255, 0.05); }
    .nav-item.active {
      color: #FFFFFF;
      background: linear-gradient(90deg, rgba(197, 168, 128, 0.26) 0%, rgba(197, 168, 128, 0.06) 100%);
      border-left-color: #C5A880;
      font-weight: 700;
    }
    .nav-item.active .nav-icon { color: #E2C48D; }
    .nav-item--group.group-open { color: #E2E8F0; }
    .nav-icon { font-size: 0.95rem; width: 1.15rem; text-align: center; flex-shrink: 0; }
    .nav-text { flex: 1; overflow: hidden; text-overflow: ellipsis; }
    .chevron-icon { font-size: 0.62rem; color: #64748B; }

    .nav-sub-list {
      display: flex; flex-direction: column; gap: 0.1rem;
      margin: 0.15rem 0 0.35rem 1.5rem;
      padding-left: 0.65rem;
      border-left: 1px solid rgba(148, 163, 184, 0.22);
    }
    .nav-sub-item {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.42rem 0.6rem;
      font-size: 0.775rem; font-weight: 600;
      color: #8FA0B6; text-decoration: none;
      border-radius: 0.45rem;
      transition: all 0.16s ease;
      white-space: nowrap;
    }
    .nav-sub-item i { font-size: 0.75rem; width: 1rem; text-align: center; color: #64748B; }
    .nav-sub-item:hover { color: #F8FAFC; background: rgba(255, 255, 255, 0.05); }
    .nav-sub-item.active-sub {
      color: #F8FAFC;
      background: rgba(197, 168, 128, 0.14);
      font-weight: 700;
    }
    .nav-sub-item.active-sub i { color: #C5A880; }

    .nav-badge {
      padding: 0.12rem 0.45rem; border-radius: 9999px;
      background: #EF4444; color: #FFFFFF;
      font-size: 0.62rem; font-weight: 800; flex-shrink: 0;
    }
    .nav-badge.badge-red { background: #EF4444; }
    .nav-badge.badge-blue { background: #3B82F6; }
    .nav-badge.badge-gold { background: #C5A880; }

    .sidebar-footer {
      padding: 0.9rem 1.15rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex; flex-direction: column; gap: 0.2rem;
      flex-shrink: 0;
    }
    .system-status-indicator {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.72rem; color: #10B981; font-weight: 600;
    }
    .status-ping {
      width: 7px; height: 7px; border-radius: 50%;
      background-color: #10B981; box-shadow: 0 0 8px #10B981;
    }
    .version-text { font-size: 0.64rem; color: #475569; }

    @media (max-width: 1024px) {
      .admin-sidebar { transform: translateX(-100%); width: 264px !important; }
      .admin-sidebar.mobile-open { transform: translateX(0); }
    }

    /* ── Top bar ── */
    .admin-top-header {
      grid-area: header;
      background: #FFFFFF;
      border-bottom: 1px solid #E2E8F0;
      padding: 0 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      position: sticky; top: 0;
      z-index: 100;
      height: 66px;
    }
    .header-left { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
    .mobile-toggle-btn {
      display: none; background: none; border: none;
      font-size: 1.1rem; color: #334155; cursor: pointer;
    }
    .admin-breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; }
    .crumb-parent { color: #64748B; font-weight: 500; display: inline-flex; gap: 0.4rem; align-items: center; }
    .crumb-section { color: #94A3B8; font-weight: 600; }
    .crumb-sep { color: #CBD5E1; font-size: 0.6rem; }
    .crumb-active { color: #0F172A; font-weight: 700; }

    /* Recherche globale */
    .header-center { flex: 1; max-width: 560px; position: relative; }
    .admin-search-wrap {
      position: relative;
      display: flex;
      align-items: center;
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      border-radius: 0.7rem;
      transition: all 0.2s ease;
    }
    .admin-search-wrap.search-focused {
      background: #FFFFFF;
      border-color: #C5A880;
      box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.18);
    }
    .search-icon { position: absolute; left: 0.85rem; color: #94A3B8; font-size: 0.85rem; }
    .admin-search-input {
      width: 100%;
      border: none; background: transparent; outline: none;
      padding: 0.6rem 5.2rem 0.6rem 2.3rem;
      font-size: 0.82rem; color: #0F172A;
      font-family: inherit;
    }
    .admin-search-input::placeholder { color: #94A3B8; }
    .search-clear {
      position: absolute; right: 0.7rem;
      background: none; border: none; color: #94A3B8;
      cursor: pointer; font-size: 0.85rem;
    }
    .search-clear:hover { color: #475569; }
    .search-kbd {
      position: absolute; right: 0.6rem;
      font-size: 0.6rem; font-weight: 700; color: #94A3B8;
      background: #FFFFFF; border: 1px solid #E2E8F0;
      border-radius: 0.35rem; padding: 0.15rem 0.4rem;
    }
    .search-dropdown {
      position: absolute; top: calc(100% + 0.5rem); left: 0; right: 0;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 0.85rem;
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
      z-index: 300;
      padding: 0.5rem;
      max-height: 26rem; overflow-y: auto;
    }
    .search-dropdown__section + .search-dropdown__section {
      border-top: 1px solid #F1F5F9; margin-top: 0.35rem; padding-top: 0.35rem;
    }
    .search-dropdown__label {
      display: block; padding: 0.4rem 0.6rem;
      font-size: 0.6rem; font-weight: 800; letter-spacing: 0.12em;
      text-transform: uppercase; color: #94A3B8;
    }
    .search-result {
      width: 100%; display: flex; align-items: center; gap: 0.7rem;
      padding: 0.55rem 0.6rem; border: none; background: transparent;
      border-radius: 0.6rem; cursor: pointer; text-align: left;
      transition: background 0.15s;
    }
    .search-result:hover { background: #F8FAFC; }
    .search-result__icon {
      width: 2.1rem; height: 2.1rem; border-radius: 0.55rem;
      background: #F1F5F9; color: #C5A880;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .search-result__thumb {
      width: 2.4rem; height: 2.4rem; border-radius: 0.55rem;
      object-fit: cover; border: 1px solid #E2E8F0; flex-shrink: 0;
    }
    .search-result__main { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .search-result__title {
      font-size: 0.8rem; font-weight: 700; color: #0F172A;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .search-result__sub { font-size: 0.68rem; color: #64748B; }
    .search-result__price { font-size: 0.75rem; font-weight: 800; color: #0F172A; font-family: ui-monospace, monospace; }
    .search-dropdown__empty {
      padding: 1rem; text-align: center;
      font-size: 0.78rem; color: #94A3B8;
      display: flex; flex-direction: column; gap: 0.4rem; align-items: center;
    }

    /* ── Actions header ── */
    .header-right { display: flex; align-items: center; gap: 0.85rem; flex-shrink: 0; }
    .store-selector {
      display: flex; align-items: center; gap: 0.45rem;
      background: #F1F5F9; border-radius: 0.6rem;
      padding: 0.42rem 0.7rem;
    }
    .store-icon { color: #C5A880; font-size: 0.8rem; }
    .store-select {
      border: none; background: transparent; outline: none;
      font-size: 0.76rem; font-weight: 700; color: #334155;
      font-family: inherit; cursor: pointer;
    }
    .header-dropdown-wrap { position: relative; }
    .icon-btn {
      position: relative;
      width: 2.3rem; height: 2.3rem; border-radius: 0.6rem;
      background: #F1F5F9; border: none; color: #475569;
      cursor: pointer; font-size: 0.9rem;
      transition: background 0.15s;
    }
    .icon-btn:hover { background: #E2E8F0; }
    .notif-dot {
      position: absolute; top: -4px; right: -4px;
      min-width: 1.05rem; height: 1.05rem; padding: 0 0.2rem;
      border-radius: 9999px; background: #EF4444; color: #FFFFFF;
      font-size: 0.6rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #FFFFFF;
    }
    .admin-user-profile {
      display: flex; align-items: center; gap: 0.55rem;
      padding: 0.2rem 0.5rem; background: transparent;
      border: none; border-left: 1px solid #E2E8F0;
      margin-left: 0.35rem; cursor: pointer;
    }
    .profile-avatar {
      width: 2.25rem; height: 2.25rem; border-radius: 50%;
      background: #0F172A; color: #E2C48D;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 800; flex-shrink: 0;
    }
    .profile-avatar--lg { width: 2.75rem; height: 2.75rem; font-size: 0.95rem; }
    .profile-info { display: flex; flex-direction: column; text-align: left; }
    .profile-name { font-size: 0.78rem; font-weight: 700; color: #0F172A; white-space: nowrap; }
    .profile-role { font-size: 0.65rem; color: #64748B; }
    .profile-chevron { font-size: 0.6rem; color: #94A3B8; }

    /* ── Dropdowns (notifications / profil) ── */
    .header-dropdown {
      position: absolute; top: calc(100% + 0.6rem); right: 0;
      width: 21rem; background: #FFFFFF;
      border: 1px solid #E2E8F0; border-radius: 0.85rem;
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
      z-index: 300; padding: 0.5rem;
    }
    .header-dropdown--profile { width: 16rem; }
    .header-dropdown__head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.5rem 0.65rem; border-bottom: 1px solid #F1F5F9;
      font-size: 0.78rem; font-weight: 700; color: #0F172A;
    }
    .header-dropdown__count {
      background: #FEF2F2; color: #DC2626;
      font-size: 0.62rem; font-weight: 800;
      padding: 0.1rem 0.45rem; border-radius: 9999px;
    }
    .notif-row { display: flex; gap: 0.6rem; padding: 0.6rem 0.65rem; border-radius: 0.6rem; }
    .notif-row:hover { background: #F8FAFC; }
    .notif-row__icon {
      width: 1.9rem; height: 1.9rem; border-radius: 0.5rem;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; flex-shrink: 0;
    }
    .notif-row__icon.tone-danger { background: #FEF2F2; color: #DC2626; }
    .notif-row__icon.tone-warning { background: #FFFBEB; color: #D97706; }
    .notif-row__icon.tone-info { background: #EFF6FF; color: #2563EB; }
    .notif-row__body { display: flex; flex-direction: column; }
    .notif-title { font-size: 0.76rem; font-weight: 700; color: #0F172A; }
    .notif-desc { font-size: 0.7rem; color: #64748B; }
    .notif-time { font-size: 0.63rem; color: #94A3B8; margin-top: 2px; }
    .header-dropdown__footer {
      display: block; text-align: center; padding: 0.55rem;
      margin-top: 0.35rem; border-top: 1px solid #F1F5F9;
      font-size: 0.75rem; font-weight: 700; color: #8F724C;
      text-decoration: none;
    }
    .header-dropdown__footer:hover { color: #0F172A; }
    .profile-card {
      display: flex; align-items: center; gap: 0.7rem;
      padding: 0.7rem 0.65rem; border-bottom: 1px solid #F1F5F9; margin-bottom: 0.35rem;
    }
    .profile-card__text { display: flex; flex-direction: column; }
    .header-dropdown__item {
      width: 100%; display: flex; align-items: center; gap: 0.6rem;
      padding: 0.55rem 0.65rem; border: none; background: transparent;
      border-radius: 0.55rem; cursor: pointer; text-align: left;
      font-size: 0.78rem; font-weight: 600; color: #334155;
      text-decoration: none; font-family: inherit;
    }
    .header-dropdown__item i { width: 1rem; color: #94A3B8; font-size: 0.78rem; }
    .header-dropdown__item:hover { background: #F8FAFC; color: #0F172A; }
    .header-dropdown__item--danger { color: #DC2626; }
    .header-dropdown__item--danger i { color: #DC2626; }
    .header-dropdown__item--danger:hover { background: #FEF2F2; }

    /* ── Contenu routé ── */
    .admin-main-content {
      grid-area: main;
      padding: 0;
      min-height: calc(100vh - 66px);
      overflow-x: hidden;
    }
    .admin-main-content ::ng-deep .catalog-root { min-height: auto; padding: 1.75rem 2rem; }

    @media (max-width: 1024px) {
      .mobile-toggle-btn { display: block; }
      .admin-top-header { padding: 0 1rem; gap: 0.75rem; }
      .admin-breadcrumb { display: none; }
      .header-center { max-width: none; }
      .search-kbd { display: none; }
      .profile-info { display: none; }
      .store-selector { display: none; }
      .admin-main-content ::ng-deep .catalog-root { padding: 1.25rem 1rem; }
    }

  `]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = false;
  isMobileSidebarOpen = false;
  isNotificationsOpen = false;
  isProfileOpen = false;

  // Recherche globale
  isSearchOpen = false;
  isSearchLoading = false;
  globalSearchQuery = '';
  searchResults: Product[] = [];
  navMatches: AdminNavLink[] = [];

  // Magasin actif
  selectedStore = 'ALL';
  stores = [
    { id: 'ALL', name: 'Tous les magasins' },
    { id: '1', name: 'Tunis Centre Flagship' },
    { id: '2', name: 'Sousse Centre Boutique' },
    { id: '3', name: 'Sfax Mall Optique' }
  ];

  // Fil d'Ariane
  breadcrumbSection = 'Pilotage';
  breadcrumbTitle = 'Tableau de bord';

  notifications = [
    { icon: 'fa-triangle-exclamation', tone: 'tone-danger', title: 'Rupture de stock', desc: 'Ray-Ban Aviator — Sousse Centre', time: 'Il y a 12 min' },
    { icon: 'fa-arrow-trend-down', tone: 'tone-warning', title: 'Stock faible', desc: 'Tom Ford FT5634 — Tunis Centre', time: 'Il y a 1 h' },
    { icon: 'fa-arrow-right-arrow-left', tone: 'tone-info', title: 'Transfert en attente', desc: 'Gucci GG0089S → Sfax Mall', time: 'Il y a 3 h' }
  ];

  // Compteurs dynamiques alimentant les badges de navigation (sidebar)
  stockAlertCount = 0;
  activeOrdersCount = 0;
  pendingPrescriptionsCount = 0;

  catalogueGroup: AdminNavGroup = {
    id: 'CATALOGUE',
    label: 'Catalogue',
    icon: 'fa-boxes-packing',
    isOpen: true,
    children: [
      { label: 'Produits', icon: 'fa-glasses', link: '/admin/products' },
      { label: 'Variantes', icon: 'fa-layer-group', link: '/admin/products/variants' },
      { label: 'Marques', icon: 'fa-tags', link: '/admin/products/brands' },
      { label: 'Catégories', icon: 'fa-folder-tree', link: '/admin/products/categories' },
      { label: 'Fournisseurs', icon: 'fa-truck-field', link: '/admin/products/suppliers' }
    ]
  };

  inventoryGroup: AdminNavGroup = {
    id: 'INVENTAIRE',
    label: 'Inventaire',
    icon: 'fa-warehouse',
    isOpen: true,
    children: this.buildInventoryChildren()
  };

  commercialItems: AdminNavLink[] = this.buildCommercialItems();

  serviceItems: AdminNavLink[] = this.buildServiceItems();

  /** Enfants du groupe Inventaire — le badge « Alertes » reflète les alertes stock réelles */
  private buildInventoryChildren(): AdminNavLink[] {
    return [
      { label: 'Vue du stock', icon: 'fa-chart-simple', link: '/admin/stock/dashboard' },
      { label: 'Stock produits', icon: 'fa-boxes-stacked', link: '/admin/stock/products' },
      { label: 'Entrées', icon: 'fa-circle-arrow-down', link: '/admin/stock/entries' },
      { label: 'Sorties', icon: 'fa-circle-arrow-up', link: '/admin/stock/exits' },
      { label: 'Transferts', icon: 'fa-arrow-right-arrow-left', link: '/admin/stock/transfers' },
      { label: 'Inventaires', icon: 'fa-clipboard-check', link: '/admin/stock/inventory' },
      { label: 'Mouvements', icon: 'fa-clock-rotate-left', link: '/admin/stock/movements' },
      {
        label: 'Alertes',
        icon: 'fa-bell',
        link: '/admin/stock/alerts',
        badge: this.stockAlertCount > 0 ? String(this.stockAlertCount) : undefined,
        badgeClass: 'badge-red'
      },
      { label: 'Réapprovisionnement', icon: 'fa-arrows-spin', link: '/admin/stock/replenishment' }
    ];
  }

  /** Entrées commerciales — le badge « Commandes » compte les dossiers en atelier */
  private buildCommercialItems(): AdminNavLink[] {
    return [
      {
        label: 'Commandes',
        icon: 'fa-box-archive',
        link: '/admin/dashboard',
        queryParams: { tab: 'ORDERS' },
        badge: this.activeOrdersCount > 0 ? String(this.activeOrdersCount) : undefined,
        badgeClass: 'badge-blue'
      },
      { label: 'Clients', icon: 'fa-users', link: '/admin/dashboard', queryParams: { tab: 'USERS' } }
    ];
  }

  /** Entrées services — le badge « Ordonnances » compte les ordonnances à valider */
  private buildServiceItems(): AdminNavLink[] {
    return [
      { label: 'Rendez-vous', icon: 'fa-calendar-check', link: '/admin/dashboard', queryParams: { tab: 'APPOINTMENTS' } },
      {
        label: 'Ordonnances',
        icon: 'fa-file-prescription',
        link: '/admin/dashboard',
        queryParams: { tab: 'PRESCRIPTIONS' },
        badge: this.pendingPrescriptionsCount > 0 ? String(this.pendingPrescriptionsCount) : undefined,
        badgeClass: 'badge-gold'
      },
      { label: 'Rapports', icon: 'fa-chart-column', link: '/admin/dashboard', queryParams: { tab: 'OVERVIEW' } },
      { label: 'Paramètres', icon: 'fa-gear', link: '/admin/dashboard', queryParams: { tab: 'AUDIT_LOG' } }
    ];
  }

  /** Recalcule les badges de navigation après réception des données (sans casser l'état replié/déplié) */
  private refreshNavBadges(): void {
    this.inventoryGroup.children = this.buildInventoryChildren();
    this.commercialItems = this.buildCommercialItems();
    this.serviceItems = this.buildServiceItems();
  }

  private readonly pageTitles: Record<string, { section: string; title: string }> = {
    '/admin/dashboard': { section: 'Pilotage', title: 'Tableau de bord' },
    '/admin/products': { section: 'Gestion commerciale', title: 'Catalogue produits' },
    '/admin/products/new': { section: 'Catalogue', title: 'Nouveau produit' },
    '/admin/products/variants': { section: 'Catalogue', title: 'Variantes' },
    '/admin/products/brands': { section: 'Catalogue', title: 'Marques' },
    '/admin/products/categories': { section: 'Catalogue', title: 'Catégories' },
    '/admin/products/suppliers': { section: 'Catalogue', title: 'Fournisseurs' },
    '/admin/stock/dashboard': { section: 'Inventaire', title: 'Vue du stock' },
    '/admin/stock/locations': { section: 'Inventaire', title: 'Boutiques' },
    '/admin/stock/products': { section: 'Inventaire', title: 'Stock produits' },
    '/admin/stock/entries': { section: 'Inventaire', title: 'Entrées' },
    '/admin/stock/exits': { section: 'Inventaire', title: 'Sorties' },
    '/admin/stock/transfers': { section: 'Inventaire', title: 'Transferts' },
    '/admin/stock/inventory': { section: 'Inventaire', title: 'Inventaires' },
    '/admin/stock/movements': { section: 'Inventaire', title: 'Mouvements' },
    '/admin/stock/alerts': { section: 'Inventaire', title: 'Alertes stock' },
    '/admin/stock/replenishment': { section: 'Inventaire', title: 'Réapprovisionnement' }
  };

  private user: UserProfile | null = null;
  private readonly searchTerms = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authRole: AuthRoleService,
    private productService: ProductService,
    private stockAlertService: StockAlertService,
    private optiVision: OptiVisionService
  ) {}

  ngOnInit(): void {
    this.authRole.currentUser$.subscribe(u => this.user = u);
    this.authRole.restoreSession().subscribe();

    this.updateBreadcrumb(this.router.url);
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(e => {
        this.updateBreadcrumb((e as NavigationEnd).urlAfterRedirects);
        this.closeAllDropdowns();
        this.isMobileSidebarOpen = false;
      });

    // Recherche globale (debounce 300ms)
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(q => this.productService.getProducts({
        query: q,
        category: 'ALL',
        brandId: 'ALL',
        type: 'ALL',
        gender: 'ALL',
        material: 'ALL',
        status: 'ALL',
        sortBy: 'name',
        sortDirection: 'asc',
        page: 1,
        pageSize: 5
      }).pipe(catchError(() => of(undefined))))
    ).subscribe(res => {
      this.searchResults = res ? res.items.slice(0, 5) : [];
      this.isSearchLoading = false;
    });

    // Badges dynamiques de la sidebar : alertes stock, commandes en atelier, ordonnances à valider
    this.stockAlertService.getAlerts()
      .pipe(catchError(() => of([])))
      .subscribe(alerts => {
        this.stockAlertCount = alerts.length;
        this.refreshNavBadges();
      });

    this.optiVision.getOrders()
      .pipe(catchError(() => of([])))
      .subscribe(orders => {
        this.activeOrdersCount = orders.filter(o => o.status === 'TAILLAGE_VERRES' || o.status === 'VALIDEE').length;
        this.refreshNavBadges();
      });

    this.optiVision.getPrescriptions()
      .pipe(catchError(() => of([])))
      .subscribe(prescriptions => {
        this.pendingPrescriptionsCount = prescriptions.filter(p => !p.isVerified).length;
        this.refreshNavBadges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Identité utilisateur ──
  get userName(): string {
    return this.user?.fullName || 'Super Admin';
  }
  get userEmail(): string {
    return this.user?.email || 'admin@optivision.tn';
  }
  get userInitials(): string {
    return this.userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
  get userRoleLabel(): string {
    return this.user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur';
  }

  // ── Navigation ──
  toggleGroup(group: AdminNavGroup): void {
    group.isOpen = !group.isOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  get allNavLinks(): AdminNavLink[] {
    return [
      { label: 'Tableau de bord', icon: 'fa-chart-pie', link: '/admin/dashboard' },
      ...this.catalogueGroup.children,
      ...this.commercialItems,
      ...this.inventoryGroup.children,
      ...this.serviceItems
    ];
  }

  // ── Recherche globale ──
  onSearchFocus(): void {
    this.isSearchOpen = true;
  }

  onSearchInput(): void {
    const q = this.globalSearchQuery.trim();
    this.isSearchOpen = true;

    if (q.length < 2) {
      this.searchResults = [];
      this.navMatches = [];
      return;
    }

    const needle = q.toLowerCase();
    this.navMatches = this.allNavLinks
      .filter(link => link.label.toLowerCase().includes(needle))
      .slice(0, 3);

    this.isSearchLoading = true;
    this.searchTerms.next(q);
  }

  clearSearch(): void {
    this.globalSearchQuery = '';
    this.searchResults = [];
    this.navMatches = [];
    this.isSearchOpen = false;
  }

  goToNav(nav: AdminNavLink): void {
    this.router.navigate([nav.link], { queryParams: nav.queryParams || {} });
    this.clearSearch();
  }

  openProduct(product: Product): void {
    this.router.navigate(['/admin/products', product.id]);
    this.clearSearch();
  }

  getProductThumb(product: Product): string {
    const primary = product.images?.find(i => i.isPrimary);
    if (primary) return primary.url;
    if (product.images?.length) return product.images[0].url;
    return 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=120&auto=format&fit=crop&q=80';
  }

  // ── Dropdowns ──
  toggleNotifications(): void {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    this.isProfileOpen = false;
    this.isSearchOpen = false;
  }

  toggleProfile(): void {
    this.isProfileOpen = !this.isProfileOpen;
    this.isNotificationsOpen = false;
    this.isSearchOpen = false;
  }

  closeAllDropdowns(): void {
    this.isNotificationsOpen = false;
    this.isProfileOpen = false;
    this.isSearchOpen = false;
  }

  logout(): void {
    this.authRole.logout().subscribe(() => {
      this.closeAllDropdowns();
      this.router.navigate(['/connexion']);
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAllDropdowns();
  }

  // ── Fil d'Ariane ──
  private updateBreadcrumb(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];

    const known = this.pageTitles[cleanUrl];
    if (known) {
      this.breadcrumbSection = known.section;
      this.breadcrumbTitle = known.title;
      return;
    }

    if (/^\/admin\/products\/\d+\/edit$/.test(cleanUrl)) {
      this.breadcrumbSection = 'Catalogue';
      this.breadcrumbTitle = 'Édition produit';
    } else if (/^\/admin\/products\/\d+$/.test(cleanUrl)) {
      this.breadcrumbSection = 'Catalogue';
      this.breadcrumbTitle = 'Fiche produit';
    } else if (/^\/admin\/stock\/transfers\/[^/]+$/.test(cleanUrl)) {
      this.breadcrumbSection = 'Inventaire';
      this.breadcrumbTitle = 'Détail du transfert';
    } else {
      this.breadcrumbSection = 'Administration';
      this.breadcrumbTitle = "Vue d'ensemble";
    }
  }
}
