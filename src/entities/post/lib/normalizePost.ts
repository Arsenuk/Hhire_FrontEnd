import { normalizeUser } from '@/entities/user/lib/normalizeUser'
import type { EntityId, Post, PostOwner } from '@/shared/types'

type TagLike = string | { name?: string | null } | null | undefined

type PostSource = Record<string, unknown> & {
  id?: EntityId | null
  user_id?: EntityId | null
  company_id?: EntityId | null
  owner?: Record<string, unknown> & {
    id?: EntityId | null
    role?: string | null
  }
  tags?: TagLike[]
}

export function normalizePost (post: PostSource = {}): Post {
  const owner = normalizeUser(post.owner, {
    id: post.owner?.id ?? post.user_id ?? post.company_id ?? null,
    role: post.owner?.role ?? (post.company_id ? 'company' : 'user'),
  }) as PostOwner

  return {
    ...post,
    tags: Array.isArray(post.tags)
      ? post.tags
          .map(tag => (typeof tag === 'string' ? tag : tag?.name))
          .filter((tag): tag is string => Boolean(tag))
      : [],
    owner,
  }
}

export function normalizePosts (posts: PostSource[] = []): Post[] {
  return posts.map(normalizePost)
}
