import { Injectable } from '@angular/core';
import { AuthRoleService } from '../../../services/auth-role.service';
import { StockPermission } from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class StockPermissionService {

  constructor(private authRoleService: AuthRoleService) {}

  hasPermission(permission: StockPermission): boolean {
    const user = this.authRoleService.getCurrentUser();
    const role: string = user?.role || (this.authRoleService.isAdmin() ? 'ADMIN' : 'CLIENT');

    // SUPER_ADMIN and ADMIN have full permissions
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return true;
    }

    // OPTICIEN has view, entry, exit, transfer, inventory
    if (role === 'OPTICIEN') {
      return permission !== 'STOCK_EXPORT';
    }

    // CLIENT or GUEST has no stock access
    return false;
  }

  hasAnyPermission(permissions: StockPermission[]): boolean {
    return permissions.some(p => this.hasPermission(p));
  }

  hasAllPermissions(permissions: StockPermission[]): boolean {
    return permissions.every(p => this.hasPermission(p));
  }
}
