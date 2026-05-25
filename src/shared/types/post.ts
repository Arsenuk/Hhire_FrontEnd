import type { EntityId, Nullable, UnknownRecord } from '@/shared/types/common'
import type { User } from '@/shared/types/user'

export interface PostOwner extends User {}

export interface Post extends UnknownRecord {
  id?: Nullable<EntityId>
  owner: PostOwner
  tags: string[]
}
