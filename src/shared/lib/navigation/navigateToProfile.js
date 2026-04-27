export function navigateToProfile(router, userId, currentUserId = null) {
  if (!userId) {
    return
  }

  if (currentUserId && userId === currentUserId) {
    router.push('/ProfileMe')
    return
  }

  router.push(`/profile/${userId}`)
}
