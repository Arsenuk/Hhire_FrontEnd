import type { ContactLink, EntityId, Post, UsefulLink, User } from '@/shared/types'

export type ProfileRating = {
  value: number
  total: number
  breakdown: {
    success: number
    rejected: number
    ignored: number
  }
}

export type ProfileContactView = ContactLink & {
  id?: EntityId | null
  description: string
  url: string
  value: string
}

export type ProfileLinkView = UsefulLink & {
  id?: EntityId | null
  description: string
  url: string
}

export type ProfilePostView = Post & {
  id?: EntityId | null
  user_id?: EntityId | null
  title?: string
  content?: string
  intent?: string
  created_at?: string
  images?: string[]
}

export type ProfileForm = {
  name: string
  description: string
  avatarFile: File | File[] | null
}

export type ContactForm = {
  url: string
  description: string
}

export type LinkForm = {
  url: string
  description: string
}

export type EditablePostForm = {
  id: EntityId | null
  title: string
  content: string
  intent: string
  tags: string[]
  imageFiles: File[]
  removeImages: boolean
}

export type ValidatableForm = {
  validate: () => Promise<{ valid: boolean }>
}

export type ProfileUserView = User & {
  contactInfoVisible?: boolean
}

export type ProfileMeResponse = User & {
  contactInfoVisible?: boolean
  rating?: ProfileRating
}

export type ProfileUserResponse = ProfileUserView & {
  posts?: ProfilePostView[]
  contacts?: ContactLink[]
  links?: UsefulLink[]
  rating?: ProfileRating
}
