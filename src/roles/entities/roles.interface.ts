import { PermissionsProperties } from './permissions.interface';

export interface RolesProperties {
  read: PermissionsProperties;
  create: PermissionsProperties;
  update: PermissionsProperties;
}
