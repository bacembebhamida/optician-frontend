import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductPermission } from '../models/permission.model';
import { AuthRoleService } from '../../../services/auth-role.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private permissionsSubject = new BehaviorSubject<Set<ProductPermission>>(new Set([
    'PRODUCT_VIEW',
    'PRODUCT_CREATE',
    'PRODUCT_UPDATE',
    'PRODUCT_DELETE',
    'PRODUCT_EXPORT'
  ]));

  readonly permissions$: Observable<Set<ProductPermission>> = this.permissionsSubject.asObservable();

  constructor(private authService: AuthRoleService) {
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        // Fallback default for demo/admin view
        this.setPermissions(['PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'PRODUCT_EXPORT']);
        return;
      }

      if (user.role === 'ADMIN') {
        this.setPermissions(['PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'PRODUCT_EXPORT']);
      } else {
        // Standard user or guest
        this.setPermissions(['PRODUCT_VIEW']);
      }
    });
  }

  setPermissions(perms: ProductPermission[]): void {
    this.permissionsSubject.next(new Set(perms));
  }

  hasPermission(permission: ProductPermission): boolean {
    return this.permissionsSubject.value.has(permission);
  }

  hasAnyPermission(permissions: ProductPermission[]): boolean {
    return permissions.some(p => this.hasPermission(p));
  }
}
