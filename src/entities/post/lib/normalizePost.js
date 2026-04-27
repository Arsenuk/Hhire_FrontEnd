import { normalizeUser } from '@/entities/user/lib/normalizeUser.js'

export function normalizePost(post = {}) {
  const owner = normalizeUser(post.owner, {
    id: post.owner?.id ?? post.user_id ?? post.company_id ?? null,
    role: post.owner?.role ?? (post.company_id ? 'company' : 'user'),
  })

  return {
    ...post,
    tags: Array.isArray(post.tags)
      ? post.tags
          .map(tag => (typeof tag === 'string' ? tag : tag?.name))
          .filter(Boolean)
      : [],
    owner,
  }
}

export function normalizePosts(posts = []) {
  return posts.map(normalizePost)
}
