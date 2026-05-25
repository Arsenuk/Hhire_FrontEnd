import type { EntityId, Nullable, UnknownRecord } from '@/shared/types/common'
import type { User } from '@/shared/types/user'

export interface ConversationSummary extends UnknownRecord {
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
  counterpart: User
  sender: User
  receiver: User
}

export interface ConversationMessage extends UnknownRecord {
  id: Nullable<EntityId>
  message: Nullable<string>
  createdAt: Nullable<string>
  senderType: Nullable<string>
  senderId: Nullable<EntityId>
  receiverType: Nullable<string>
  receiverId: Nullable<EntityId>
  sender: User
  receiver: User
}
