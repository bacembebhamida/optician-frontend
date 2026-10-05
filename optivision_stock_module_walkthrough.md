# Documentation Technique & Architecture du Module Stock Multi-site OptiVision

## 🌟 Context & Architecture Summary

Le **Module Stock OptiVision** est une solution ERP complète, hautement sécurisée et prête pour l'audit, conçue pour les réseaux de boutiques d'optique. Il permet la supervision multi-magasins des lunettes de vue, lunettes de soleil, lentilles de contact et accessoires.

---

## 🗂️ Structure du Code (`src/app/modules/stock/`)

```
src/app/modules/stock/
├── components/
│   ├── stock-kpis/                  # 📊 Cartes KPI temps réel (stock total, faible, rupture, réservé)
│   ├── store-location-card/          # 🏬 Carte synthétique par boutique avec barres de niveau HSL
│   ├── stock-filters/               # 🔍 Barres de recherche déboguée, filtre code-barres et bascules rapides
│   ├── stock-table/                 # 📋 Tableau adaptatif des stocks avec badges de statut et pagination
│   ├── movement-table/              # 📜 Journal d'audit chronologique des mouvements (Entrées/Sorties/Transferts)
│   ├── transfer-form/               # 🚚 Assistant wizard en 4 étapes pour les transferts inter-boutiques
│   ├── inventory-table/             # 📝 Grille de saisie des comptages physiques et calcul d'écart en direct
│   ├── barcode-scanner-modal/       # 📷 Modal lecteur code-barres (douchette USB & presets démo)
│   └── confirm-dialog/              # ⚠️ Dialog de confirmation réutilisable (évite alert/confirm natifs)
│
├── pages/
│   ├── stock-dashboard-page/        # 🏠 Route: /admin/stock/dashboard
│   ├── stock-locations-page/        # 🏬 Route: /admin/stock/locations
│   ├── stock-list-page/             # 📦 Route: /admin/stock/products
│   ├── stock-entry-page/            # ➕ Route: /admin/stock/entries
│   ├── stock-exit-page/             # ➖ Route: /admin/stock/exits
│   ├── stock-transfer-page/         # 🚚 Route: /admin/stock/transfers
│   ├── stock-transfer-detail-page/  # 📄 Route: /admin/stock/transfers/:id
│   ├── inventory-page/              # 📋 Route: /admin/stock/inventory
│   ├── movements-page/              # ⏳ Route: /admin/stock/movements
│   └── alerts-page/                 # 🔔 Route: /admin/stock/alerts
│
├── directives/
│   └── has-stock-permission.directive.ts # 🛡️ Control d'accès visuel selon le rôle (RBAC)
│
├── guards/
│   └── stock-permission.guard.ts     # 🔒 Guard de route Angular (stockPermissionGuard)
│
├── models/
│   ├── stock.model.ts               # Interfaces StockItem, StockDashboardSummary, StockFilterParams
│   ├── movement.model.ts            # Interfaces StockMovement, MovementType, MovementFilterParams
│   ├── transfer.model.ts            # Interfaces StockTransfer, TransferStatus, CreateTransferRequest
│   ├── inventory.model.ts           # Interfaces StockInventory, InventoryItemCount, CreateInventoryRequest
│   ├── alert.model.ts               # Interfaces StockAlert, AlertType
│   └── permission.model.ts          # Type StockPermission
│
├── services/
│   ├── stock.service.ts             # Service central d'API avec BehaviorSubject et fallback démo
│   ├── stock-movement.service.ts    # Service de traçabilité et filtres d'audit
│   ├── stock-transfer.service.ts    # Service de workflow de transfert inter-magasins
│   ├── inventory.service.ts         # Service de gestion et régularisation des inventaires physiques
│   ├── stock-alert.service.ts       # Service de gestion et acquittement des alertes
│   └── stock-permission.service.ts  # Service d'évaluation des rôles (ADMIN, OPTICIEN, CLIENT)
│
└── stock.routes.ts                  # Configuration du Lazy Loading pour /admin/stock/*
```

---

## 🧭 Intégration au Shell Admin Unifié

Les modules **Produits** et **Stock** ne sont plus des pages autonomes : ils sont montés à l'intérieur du shell
professionnel `AdminLayoutComponent` (`src/app/components/admin/layout/admin-layout.component.ts`), qui fournit
la sidebar rétractable, la top bar (recherche globale `Ctrl+K`, sélecteur de magasin, notifications, profil) et le
fil d'Ariane.

### Arborescence de routing

```ts
// src/app/app.routes.ts
{
  path: 'admin',
  component: AdminLayoutComponent,
  canActivate: [adminAuthGuard],
  children: [
    { path: 'products',   loadChildren: () => import('./modules/products/products.routes').then(m => m.PRODUCT_ROUTES) },
    { path: 'categories', loadComponent: () => import('./modules/products/pages/category-list-page/...') },
    { path: 'brands',     loadComponent: () => import('./modules/products/pages/brand-list-page/...') },
    { path: 'stock',      loadChildren: () => import('./modules/stock/stock.routes').then(m => m.STOCK_ROUTES) }
  ]
}
```

| URL | Composant chargé | Section sidebar | Fil d'Ariane |
| --- | --- | --- | --- |
| `/admin/dashboard` | `AdminDashboardComponent` | Pilotage | Pilotage › Tableau de bord |
| `/admin/products` | `ProductListPageComponent` | Gestion commerciale › Catalogue | Gestion commerciale › Catalogue produits |
| `/admin/products/new` | `ProductFormPageComponent` | Gestion commerciale › Catalogue | Catalogue › Nouveau produit |
| `/admin/products/:id` | `ProductDetailPageComponent` | Gestion commerciale › Catalogue | Catalogue › Fiche produit |
| `/admin/products/:id/edit` | `ProductFormPageComponent` | Gestion commerciale › Catalogue | Catalogue › Édition produit |
| `/admin/products/variants` | `VariantListPageComponent` | Gestion commerciale › Variantes | Catalogue › Variantes |
| `/admin/products/brands` | `BrandListPageComponent` | Gestion commerciale › Marques | Catalogue › Marques |
| `/admin/products/categories` | `CategoryListPageComponent` | Gestion commerciale › Catégories | Catalogue › Catégories |
| `/admin/products/suppliers` | `SupplierListPageComponent` | Gestion commerciale › Fournisseurs | Catalogue › Fournisseurs |
| `/admin/stock/dashboard` | `StockDashboardPageComponent` | Inventaire › Vue du stock | Inventaire › Vue du stock |
| `/admin/stock/locations` | `StockLocationsPageComponent` | Inventaire › Boutiques | Inventaire › Boutiques |
| `/admin/stock/products` | `StockListPageComponent` | Inventaire › Stock produits | Inventaire › Stock produits |
| `/admin/stock/entries` \| `exits` | `StockEntryPageComponent` / `StockExitPageComponent` | Inventaire › Entrées / Sorties | Inventaire › Entrées / Sorties |
| `/admin/stock/transfers` (+ `:id`) | `StockTransferPageComponent` / `StockTransferDetailPageComponent` | Inventaire › Transferts | Inventaire › Transferts (ou Détail du transfert) |
| `/admin/stock/inventory` \| `movements` \| `alerts` \| `replenishment` | Pages dédiées | Inventaire › … | Inventaire › … |

### Points clés de l'intégration

1. **Zéro double chrome** : sur toute URL commençant par `/admin`, `AppComponent` masque le header client, le
   footer et le widget OptiAssistant (`*ngIf="!isAdminRoute"`) et met le conteneur en `p-0`, afin que le shell
   occupe 100 % de la viewport.
2. **Double barrière de sécurité** :
   - `adminAuthGuard` sur le parent `admin` (redirection vers `/connexion?returnUrl=…` si l'utilisateur n'est pas
     authentifié avec un rôle d'administration).
   - `productPermissionGuard` (`data: { permission: 'PRODUCT_VIEW' | 'PRODUCT_CREATE' | 'PRODUCT_UPDATE' }`) et
     `stockPermissionGuard` sur les routes enfants pour le contrôle fin du RBAC.
3. **Lazy loading préservé** : chaque page est chargée via `loadComponent`, les sous-modules via `loadChildren`,
   le tout en `standalone components` (aucun `NgModule` intermédiaire).
4. **Navigation active contextuelle** : la sidebar calcule l'élément actif à partir de l'URL courante, y compris
   pour les routes profondes (`/admin/products/12/edit` surligne « Catalogue »).
5. **Badges de navigation dynamiques** : les compteurs de la sidebar sont calculés à partir des données réelles
   via `refreshNavBadges()` — « Alertes » depuis `StockAlertService.getAlerts()`, « Commandes » depuis
   `OptiVisionService.getOrders()` (statuts `TAILLAGE_VERRES` / `VALIDEE`) et « Ordonnances » depuis
   `OptiVisionService.getPrescriptions()` (non vérifiées). Un badge disparaît lorsque le compteur tombe à zéro, et
   l'état replié/déplié des groupes est préservé lors du rafraîchissement.
6. **Padding géré localement** : chaque page (`stock-dashboard-page`, `stock-list-page`, `product-list-page`, …)
   conserve son propre `padding: 1.5rem`, il n'y a donc pas de double marge avec le conteneur du shell.

---

## 🚀 Fonctionnalités Clés Implémentées

1. **Dashboard Synthétique (`/admin/stock/dashboard`)** :
   - Cartes KPI réactives (Unités en stock, Valeur valorisée, Alertes ruptures, Transferts actifs).
   - Répartition visuelle par boutique avec indicateurs de santé.
   - Liste des alertes prioritaires et raccourcis de réapprovisionnement.

2. **Inventaire par Boutiques (`/admin/stock/locations`)** :
   - Vue multi-sites avec filtres contextuels.

3. **Catalogue Produit & Filtrage Avancé (`/admin/stock/products`)** :
   - Recherche textuelle déboguée (`debounceTime(350)`).
   - Filtrage par boutique, catégorie, marque, statut ou code-barres.
   - Scanner de code-barres intégré (support douchette hardware USB).
   - Export CSV conditionné aux permissions.

4. **Entrées & Réception Stock (`/admin/stock/entries`)** :
   - Formulaire complet de réception fournisseur, retour client ou ajustement positif.
   - Prévisualisation de l'impact sur le stock avant validation.

5. **Sorties & Ventes (`/admin/stock/exits`)** :
   - Motifs : Vente, Perte/Vol, Casse monture/verre défectueux, Correction.
   - Garde-fou visuel empêchant de déduire une quantité supérieure au stock disponible.

6. **Transferts Inter-Boutiques (`/admin/stock/transfers`)** :
   - Assistant wizard en 4 étapes (Source -> Destination -> Produits -> Validation).
   - Suivi du workflow (`REQUESTED` -> `APPROVED` -> `IN_TRANSIT` -> `RECEIVED`).

7. **Inventaire Physique & Audit (`/admin/stock/inventory`)** :
   - Grille de comptage physique en direct.
   - Calcul automatique et visuel des écarts en temps réel (Stock physique - Stock théorique).
   - Processus de clôture avec régularisation automatique.

8. **Journal d'Audit des Mouvements (`/admin/stock/movements`)** :
   - Traçabilité inaltérable avec horodatage, utilisateur, quantité delta (+/-) et référence de pièce.

9. **Centre d'Alertes (`/admin/stock/alerts`)** :
   - Catégorisation prioritaire (Ruptures 🔴, Stock faible 🟠, Surstock 🟣).
   - Actions rapides vers le réapprovisionnement ou transfert.

---

## 🔒 Sécurité et Rôles (RBAC)

- **ADMIN / SUPER_ADMIN** : Accès complet (lecture, écriture, transferts, régularisations, exports).
- **OPTICIEN** : Accès aux opérations courantes (Entrées, Sorties, Transferts), sans export CSV.
- **CLIENT / GUEST** : Accès strictement bloqué via `stockPermissionGuard` et `appHasStockPermission`.
