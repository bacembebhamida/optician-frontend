// OptiVision Permission Models

export type ProductPermission = 
  | 'PRODUCT_VIEW'
  | 'PRODUCT_CREATE'
  | 'PRODUCT_UPDATE'
  | 'PRODUCT_DELETE'
  | 'PRODUCT_EXPORT';

export interface UserPermissions {
  role: string;
  permissions: ProductPermission[];
}
