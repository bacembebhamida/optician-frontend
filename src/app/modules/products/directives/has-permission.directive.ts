import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionService } from '../services/permission.service';
import { ProductPermission } from '../models/permission.model';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private requiredPermission?: ProductPermission;
  private sub?: Subscription;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  @Input() set appHasPermission(permission: ProductPermission) {
    this.requiredPermission = permission;
    this.updateView();
  }

  ngOnInit(): void {
    this.sub = this.permissionService.permissions$.subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private updateView(): void {
    if (!this.requiredPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      return;
    }

    const hasAccess = this.permissionService.hasPermission(this.requiredPermission);
    if (hasAccess) {
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear();
    }
  }
}
