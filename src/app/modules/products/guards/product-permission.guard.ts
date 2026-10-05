import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { ProductPermission } from '../models/permission.model';
import { NotificationService } from '../services/notification.service';

export const productPermissionGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  const requiredPermission = route.data['permission'] as ProductPermission | undefined;

  if (!requiredPermission || permissionService.hasPermission(requiredPermission)) {
    return true;
  }

  notificationService.error(
    'Accès refusé',
    `Vous ne possédez pas la permission requise (${requiredPermission}) pour accéder à cette section.`
  );
  router.navigate(['/admin/dashboard']);
  return false;
};
