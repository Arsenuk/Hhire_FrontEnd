import type { User, UserRole } from '@/shared/types'

const ADMIN_PANEL_ROLES = ['moderator', 'admin', 'super_admin'] as const satisfies readonly UserRole[]
type AdminPanelRole = typeof ADMIN_PANEL_ROLES[number]

export function canAccessAdminPanel (user: User | null) {
  return ADMIN_PANEL_ROLES.includes((user?.role ?? '') as AdminPanelRole)
}

export { ADMIN_PANEL_ROLES }
