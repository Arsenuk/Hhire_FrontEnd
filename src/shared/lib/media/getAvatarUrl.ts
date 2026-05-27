import defaultAvatar from '@/shared/assets/default-avatar.png'
import { API_ORIGIN } from '@/shared/config/api'

export function getAvatarUrl (avatar: string | null | undefined) {
  if (!avatar) {
    return defaultAvatar
  }

  return avatar.startsWith('http') ? avatar : `${API_ORIGIN}${avatar}`
}
