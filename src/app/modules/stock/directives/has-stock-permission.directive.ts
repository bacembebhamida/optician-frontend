import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { StockPermissionService } from '../services/stock-permission.service';
import { StockPermission } from '../models/permission.model';

@Directive({
  selector: '[appHasStockPermission]',
  standalone: true
})
export class HasStockPermissionDirective {
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: StockPermissionService
  ) {}

  @Input() set appHasStockPermission(val: StockPermission | StockPermission[]) {
    const permissions = Array.isArray(val) ? val : [val];
    const hasPermission = this.permissionService.hasAnyPermission(permissions);

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
