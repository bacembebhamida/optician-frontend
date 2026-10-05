import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StockPermissionService } from '../services/stock-permission.service';
import { StockPermission } from '../models/permission.model';
import { NotificationService } from '../../products/services/notification.service';

export const stockPermissionGuard: CanActivateFn = (route) => {
  const permissionService = inject(StockPermissionService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  const requiredPermission = route.data['permission'] as StockPermission;

  if (!requiredPermission || permissionService.hasPermission(requiredPermission)) {
    return true;
  }

  notificationService.error('Accès refusé', 'Vous ne possédez pas les privilèges requis pour accéder au module Stock.');
  router.navigate(['/admin/dashboard']);
  return false;
};
