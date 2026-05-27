import { normalizeUser } from '@/entities/user/lib/normalizeUser'
import type {
  ConversationMessageDto,
  ConversationMessageVm,
  ConversationSummaryDto,
  ConversationSummaryVm,
  ConversationView,
} from '@/features/signals/model/conversation.types'

export function normalizeConversationSummary (
  conversation: ConversationSummaryDto,
  view: ConversationView = 'inbox',
): ConversationSummaryVm {
  const senderUser = normalizeUser({
    id: conversation.sender_id,
    ...(conversation.sender_name !== undefined ? { name: conversation.sender_name } : {}),
    ...(conversation.sender_avatar !== undefined ? { avatar: conversation.sender_avatar } : {}),
  })
  const receiverUser = normalizeUser({
    id: conversation.receiver_id,
    ...(conversation.receiver_name !== undefined ? { name: conversation.receiver_name } : {}),
    ...(conversation.receiver_avatar !== undefined ? { avatar: conversation.receiver_avatar } : {}),
  })
  const counterpart = view === 'inbox'
    ? senderUser
    : receiverUser

  return {
    id: conversation.conversation_id ?? null,
    messageId: conversation.id ?? null,
    parentId: conversation.parent_id ?? null,
    rootId: conversation.root_id ?? null,
    postId: conversation.post_id ?? null,
    subject: conversation.subject ?? null,
    message: conversation.message ?? null,
    createdAt: conversation.created_at ?? null,
    status: conversation.conversation_status ?? null,
    outcome: conversation.conversation_outcome ?? null,
    closedAt: conversation.closed_at ?? null,
    closeRequestedByMe: Boolean(conversation.close_requested_by_me),
    closeRequestedByCounterparty: Boolean(conversation.close_requested_by_counterparty),
    ownContactsShared: Boolean(conversation.own_contacts_shared),
    contactInfoSharedWithMe: Boolean(conversation.contact_info_shared_with_me),
    counterpart,
    sender: senderUser,
    receiver: receiverUser,
  }
}

export function normalizeConversationMessage (message: ConversationMessageDto): ConversationMessageVm {
  const senderUser = normalizeUser({
    id: message.sender_id,
    ...(message.sender_name !== undefined ? { name: message.sender_name } : {}),
    ...(message.sender_avatar !== undefined ? { avatar: message.sender_avatar } : {}),
  })
  const receiverUser = normalizeUser({
    id: message.receiver_id,
    ...(message.receiver_name !== undefined ? { name: message.receiver_name } : {}),
    ...(message.receiver_avatar !== undefined ? { avatar: message.receiver_avatar } : {}),
  })

  return {
    id: message.id ?? null,
    message: message.message ?? null,
    createdAt: message.created_at ?? null,
    senderType: message.sender_type ?? null,
    senderId: message.sender_id ?? null,
    receiverType: message.receiver_type ?? null,
    receiverId: message.receiver_id ?? null,
    sender: senderUser,
    receiver: receiverUser,
  }
}
