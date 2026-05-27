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
  const counterpart = view === 'inbox'
    ? normalizeUser({
      id: conversation.sender_id,
      name: conversation.sender_name,
      avatar: conversation.sender_avatar,
    })
    : normalizeUser({
      id: conversation.receiver_id,
      name: conversation.receiver_name,
      avatar: conversation.receiver_avatar,
    })

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
    sender: normalizeUser({
      id: conversation.sender_id,
      name: conversation.sender_name,
      avatar: conversation.sender_avatar,
    }),
    receiver: normalizeUser({
      id: conversation.receiver_id,
      name: conversation.receiver_name,
      avatar: conversation.receiver_avatar,
    }),
  }
}

export function normalizeConversationMessage (message: ConversationMessageDto): ConversationMessageVm {
  return {
    id: message.id ?? null,
    message: message.message ?? null,
    createdAt: message.created_at ?? null,
    senderType: message.sender_type ?? null,
    senderId: message.sender_id ?? null,
    receiverType: message.receiver_type ?? null,
    receiverId: message.receiver_id ?? null,
    sender: normalizeUser({
      id: message.sender_id,
      name: message.sender_name,
      avatar: message.sender_avatar,
    }),
    receiver: normalizeUser({
      id: message.receiver_id,
      name: message.receiver_name,
      avatar: message.receiver_avatar,
    }),
  }
}
