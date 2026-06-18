import type { User } from '@/shared/types'

type ProfileActor = Pick<User, 'id' | 'role'> | null | undefined

export function canViewProfileRatingBreakdown (
  viewer: ProfileActor,
  profileUser: ProfileActor
): boolean {
  if (!viewer || !profileUser) {
    return false
  }

  return (
    Number(viewer.id) === Number(profileUser.id) ||
    viewer.role === 'admin' ||
    viewer.role === 'super_admin' ||
    viewer.role === 'moderator'
  )
}
