export const ADMIN_PANEL_ROLES = ['moderator', 'admin', 'super_admin']

export function canAccessAdminPanel (user) {
  return ADMIN_PANEL_ROLES.includes(user?.role)
}
