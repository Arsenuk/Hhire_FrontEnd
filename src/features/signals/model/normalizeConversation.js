import { normalizeUser } from '@/entities/user/lib/normalizeUser.js'

export function normalizeConversationSummary (conversation, view = 'inbox') {
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
    id: conversation.conversation_id,
    messageId: conversation.id,
    parentId: conversation.parent_id,
    rootId: conversation.root_id,
    postId: conversation.post_id,
    subject: conversation.subject,
    message: conversation.message,
    createdAt: conversation.created_at,
    status: conversation.conversation_status,
    outcome: conversation.conversation_outcome,
    closedAt: conversation.closed_at,
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

export function normalizeConversationMessage (message) {
  return {
    id: message.id,
    message: message.message,
    createdAt: message.created_at,
    senderType: message.sender_type,
    senderId: message.sender_id,
    receiverType: message.receiver_type,
    receiverId: message.receiver_id,
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
