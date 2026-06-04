import type { Router } from 'vue-router'
import type { EntityId } from '@/shared/types'

export function navigateToProfile (
  router: Router,
  userId: EntityId | null | undefined,
  currentUserId: EntityId | null = null,
) {
  if (!userId) {
    return
  }

  if (currentUserId && userId === currentUserId) {
    return router.push('/ProfileMe')
  }

  return router.push(`/Profile/${userId}`)
}
