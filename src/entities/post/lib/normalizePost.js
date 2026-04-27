export function normalizePost(post = {}) {
  const owner = post.owner || {}

  return {
    ...post,
    tags: Array.isArray(post.tags)
      ? post.tags
          .map(tag => (typeof tag === 'string' ? tag : tag?.name))
          .filter(Boolean)
      : [],
    owner: {
      id: owner.id ?? post.user_id ?? post.company_id ?? null,
      name: owner.name ?? 'Unknown user',
      role: owner.role ?? (post.company_id ? 'company' : 'user'),
      avatar: owner.avatar ?? null,
    },
  }
}

export function normalizePosts(posts = []) {
  return posts.map(normalizePost)
}
