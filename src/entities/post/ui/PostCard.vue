<template>
  <v-card :class="cardClasses">
    <v-card-title class="post-card__header">
      <div class="post-card__owner">
        <v-avatar
          :size="avatarSize"
          :class="['post-card__avatar', { 'post-card__avatar--clickable': ownerClickable }]"
          @click="handleOwnerClick"
        >
          <v-img :src="ownerAvatarUrl" />
        </v-avatar>

        <div class="post-card__owner-copy">
          <template v-if="titlePlacement === 'header'">
            <div class="post-card__title post-card__title--header">
              {{ post.title }}
            </div>
            <div class="post-card__meta post-card__meta--split">
              <span>{{ ownerName }}</span>
              <span>{{ formattedDate }}</span>
            </div>
          </template>

          <template v-else>
            <div class="post-card__owner-name">
              {{ ownerName }}
            </div>
            <div class="post-card__meta">
              {{ formattedDate }}
            </div>
          </template>
        </div>
      </div>

      <div v-if="showOwnerRole || $slots['header-actions']" class="post-card__header-actions">
        <span
          v-if="showOwnerRole && ownerRole"
          class="post-card__role"
          :class="{ 'post-card__role--company': ownerRole === 'company' }"
        >
          {{ ownerRole }}
        </span>
        <slot name="header-actions" />
      </div>
    </v-card-title>

    <v-card-text class="post-card__body">
      <h4 v-if="titlePlacement === 'body' && post.title" class="post-card__title post-card__title--body">
        {{ post.title }}
      </h4>

      <p v-if="post.content" class="post-card__content">
        {{ post.content }}
      </p>

      <div v-if="post.intent" class="post-card__intent">
        <v-chip size="small" variant="outlined" color="secondary">
          {{ post.intent }}
        </v-chip>
      </div>

      <div v-if="post.tags?.length" class="post-card__tags">
        <v-chip v-for="tag in post.tags" :key="tag" size="small" variant="outlined" class="ma-1">
          {{ tagLabel(tag) }}
        </v-chip>
      </div>

      <slot />
    </v-card-text>

    <v-card-actions v-if="$slots.actions" class="post-card__actions">
      <slot name="actions" />
    </v-card-actions>

    <slot name="details" />
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { formatPostDate } from '@/shared/lib/date/formatPostDate.js'
import { getAvatarUrl } from '@/shared/lib/media/getAvatarUrl.js'

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
  variant: {
    type: String,
    default: 'feed',
  },
  titlePlacement: {
    type: String,
    default: 'body',
  },
  tagPrefix: {
    type: String,
    default: '',
  },
  showOwnerRole: {
    type: Boolean,
    default: false,
  },
  ownerClickable: {
    type: Boolean,
    default: false,
  },
  hoverable: {
    type: Boolean,
    default: false,
  },
  avatarSize: {
    type: Number,
    default: 36,
  },
})

const emit = defineEmits(['owner-click'])

const owner = computed(() => props.post?.owner || {})
const ownerName = computed(() => owner.value.name || 'Unknown user')
const ownerRole = computed(() => owner.value.role || '')
const ownerAvatarUrl = computed(() => getAvatarUrl(owner.value.avatar))
const formattedDate = computed(() => formatPostDate(props.post?.created_at))
const cardClasses = computed(() => [
  'entity-post-card',
  `entity-post-card--${props.variant}`,
  { 'entity-post-card--hoverable': props.hoverable },
])

function handleOwnerClick() {
  if (!props.ownerClickable || !owner.value.id) return
  emit('owner-click', owner.value.id)
}

function tagLabel(tag) {
  return props.tagPrefix ? `${props.tagPrefix}${tag}` : tag
}
</script>

<style scoped>
.entity-post-card {
  border-radius: 18px;
  background: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.entity-post-card--hoverable:hover {
  transform: translateY(-2px);
}

.entity-post-card--feed {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.entity-post-card--profile {
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
}

.entity-post-card--profile.entity-post-card--hoverable:hover {
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.16);
}

.post-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding-bottom: 12px;
}

.post-card__owner {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.post-card__avatar {
  flex-shrink: 0;
}

.post-card__avatar--clickable {
  cursor: pointer;
}

.post-card__owner-copy {
  min-width: 0;
  flex: 1;
}

.post-card__owner-name,
.post-card__title--header,
.post-card__title--body {
  color: #0f172a;
  font-weight: 600;
}

.post-card__title--header {
  font-size: 16px;
  line-height: 1.35;
  margin-bottom: 6px;
}

.post-card__title--body {
  font-size: 18px;
  margin-bottom: 8px;
}

.post-card__meta {
  color: #64748b;
  font-size: 12px;
}

.post-card__meta--split {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.post-card__header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.post-card__role {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
  color: #000;
}

.post-card__role--company {
  background: linear-gradient(90deg, #fde68a 0%, #f59e0b 100%);
}

.post-card__body {
  padding-top: 0;
}

.post-card__content {
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
}

.entity-post-card--feed .post-card__content {
  font-size: 15px;
  color: #374151;
}

.post-card__intent {
  margin-top: 12px;
}

.post-card__intent :deep(.v-chip) {
  background: rgba(255, 193, 7, 0.12);
  border-color: #facc15;
  color: #a16207;
  font-weight: 600;
}

.post-card__tags {
  margin-top: 12px;
}

.post-card__tags :deep(.v-chip) {
  border-radius: 12px;
  border: 1px solid #97e5ee;
  color: #0f172a;
  background-color: #fff;
  font-weight: 500;
}

.post-card__actions {
  padding-top: 0;
}

@media (max-width: 960px) {
  .post-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-card__header-actions {
    align-self: flex-end;
  }

  .post-card__meta--split {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
