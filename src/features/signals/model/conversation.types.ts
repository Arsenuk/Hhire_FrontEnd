import type { ContactLink, EntityId, Nullable, UnknownRecord, User } from '@/shared/types'

export type ConversationView = 'inbox' | 'sent'

export type ConversationRating = {
  value: number
  total: number
  breakdown?: {
    success: number
    rejected: number
    ignored: number
  }
}

export type ConversationUser = User & {
  rating?: ConversationRating | null
}

export interface ConversationSummaryDto extends UnknownRecord {
  id?: Nullable<EntityId>
  conversation_id?: Nullable<EntityId>
  parent_id?: Nullable<EntityId>
  root_id?: Nullable<EntityId>
  post_id?: Nullable<EntityId>
  subject?: Nullable<string>
  message?: Nullable<string>
  created_at?: Nullable<string>
  conversation_status?: Nullable<string>
  conversation_outcome?: Nullable<string>
  closed_at?: Nullable<string>
  close_requested_by_me?: unknown
  close_requested_by_counterparty?: unknown
  own_contacts_shared?: unknown
  contact_info_shared_with_me?: unknown
  sender_id?: Nullable<EntityId>
  sender_name?: Nullable<string>
  sender_avatar?: Nullable<string>
  sender_type?: Nullable<string>
  sender_rating?: ConversationRating | null
  receiver_id?: Nullable<EntityId>
  receiver_name?: Nullable<string>
  receiver_avatar?: Nullable<string>
  receiver_type?: Nullable<string>
  receiver_rating?: ConversationRating | null
}

export interface ConversationMessageDto extends UnknownRecord {
  id?: Nullable<EntityId>
  message?: Nullable<string>
  created_at?: Nullable<string>
  sender_type?: Nullable<string>
  sender_id?: Nullable<EntityId>
  sender_name?: Nullable<string>
  sender_avatar?: Nullable<string>
  receiver_type?: Nullable<string>
  receiver_id?: Nullable<EntityId>
  receiver_name?: Nullable<string>
  receiver_avatar?: Nullable<string>
}

export interface ConversationContactsDto extends ContactLink {
  description?: Nullable<string>
}

export interface ConversationSummaryVm extends UnknownRecord {
  id: Nullable<EntityId>
  messageId: Nullable<EntityId>
  parentId: Nullable<EntityId>
  rootId: Nullable<EntityId>
  postId: Nullable<EntityId>
  subject: Nullable<string>
  message: Nullable<string>
  createdAt: Nullable<string>
  status: Nullable<string>
  outcome: Nullable<string>
  closedAt: Nullable<string>
  closeRequestedByMe: boolean
  closeRequestedByCounterparty: boolean
  ownContactsShared: boolean
  contactInfoSharedWithMe: boolean
  counterpart: ConversationUser
  sender: ConversationUser
  receiver: ConversationUser
}

export interface ConversationMessageVm extends UnknownRecord {
  id: Nullable<EntityId>
  message: Nullable<string>
  createdAt: Nullable<string>
  senderType: Nullable<string>
  senderId: Nullable<EntityId>
  receiverType: Nullable<string>
  receiverId: Nullable<EntityId>
  sender: ConversationUser
  receiver: ConversationUser
}
