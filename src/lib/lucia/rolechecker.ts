import { RoleType } from '@/lib/db/schema/_enum';

export const adminRoles: RoleType[] = ['super_admin', 'admin'];
const hasAdminPrivileges = (roles: RoleType[]) => {
  return roles.some((r) => adminRoles.includes(r));
};

export const roleIsSuperAdmin = (role: RoleType[]) => role.includes('super_admin');
export const roleIsAdmin = (role: RoleType[]) => hasAdminPrivileges(role);
export const roleIsEditor = (roles: RoleType[]) => hasAdminPrivileges(roles) || roles.includes('editor');
export const roleIsMediaManager = (roles: RoleType[]) => hasAdminPrivileges(roles) || roles.includes('media_manager');
