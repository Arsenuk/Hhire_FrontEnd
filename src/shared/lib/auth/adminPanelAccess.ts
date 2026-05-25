import type { User, UserRole } from '@/shared/types'

const ADMIN_PANEL_ROLES: UserRole[] = ['moderator', 'admin', 'super_admin']

export function canAccessAdminPanel (user: User | null | undefined) {
  return ADMIN_PANEL_ROLES.includes(user?.role ?? '')
}

export { ADMIN_PANEL_ROLES }
