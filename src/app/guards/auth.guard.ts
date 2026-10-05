import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthRoleService, UserRole } from '../services/auth-role.service';

function requiresRole(role: UserRole): CanActivateFn {
  return (_route, state) => {
    const auth = inject(AuthRoleService);
    const router = inject(Router);

    return auth.restoreSession().pipe(
      map(user => user?.role === role
        ? true
        : router.createUrlTree(['/connexion'], {
            queryParams: { mode: role === 'ADMIN' ? 'admin' : 'client', returnUrl: state.url }
          }))
    );
  };
}

export const clientAuthGuard = requiresRole('CLIENT');
export const adminAuthGuard = requiresRole('ADMIN');
