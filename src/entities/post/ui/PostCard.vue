<template>
  <v-card v-if="variant === 'feed'" v-bind="$attrs" :class="cardClasses">
    <v-card-title class="post-card__feed-header">
      <div class="post-card__feed-owner">
        <v-avatar
          :size="avatarSize"
          :class="['post-card__avatar', { 'post-card__avatar--clickable': ownerClickable }]"
          @click="handleOwnerClick"
        >
          <v-img :src="ownerAvatarUrl" />
        </v-avatar>

        <div class="post-card__feed-owner-copy">
          <div class="post-card__owner-name">
            {{ ownerName }}
          </div>

          <div v-if="ownerRating" class="post-card__owner-rating">
            <UserRating :rating="ownerRating" />
          </div>

          <div class="post-card__feed-date">
            {{ formattedDate }}
          </div>

          <div v-if="postTags.length" class="post-card__tags post-card__tags--feed">
            <v-chip v-for="tag in postTags" :key="tag" size="small" variant="outlined">
              {{ tagLabel(tag) }}
            </v-chip>
          </div>
        </div>
      </div>

      <div class="post-card__feed-badges">
        <span
          v-if="showOwnerRole && ownerRole"
          class="post-card__role"
          :class="{ 'post-card__role--company': ownerRole === 'company' }"
        >
          {{ ownerRole }}
        </span>

        <v-chip v-if="post.intent" size="small" variant="outlined" class="post-card__intent-chip">
          {{ post.intent }}
        </v-chip>

        <slot name="header-actions" />

        <v-btn
          v-if="canReport"
          class="post-card__report-btn"
          type="button"
          icon
          size="small"
          :ripple="false"
          title="Report post"
          variant="text"
          @click.stop="openReportDialog"
        >
          <v-icon>mdi-flag-outline</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text class="post-card__feed-body">
      <div v-if="post.title" class="post-card__title post-card__title--feed">
        {{ post.title }}
      </div>

      <div v-if="post.content" class="post-card__content-box">
        {{ post.content }}
      </div>

      <div
        v-if="firstImageUrl"
        class="post-card__image-box"
        role="button"
        tabindex="0"
        @click="isImageDialogOpen = true"
        @keydown.enter.prevent="isImageDialogOpen = true"
        @keydown.space.prevent="isImageDialogOpen = true"
      >
        <v-img :src="firstImageUrl" :alt="post.title || 'Post image'" cover />
      </div>

      <slot />
    </v-card-text>

    <v-card-actions v-if="$slots.actions" class="post-card__actions">
      <slot name="actions" />
    </v-card-actions>

    <slot name="details" />

    <v-dialog v-model="isImageDialogOpen" class="post-card__image-dialog" max-width="980">
      <v-card class="post-card__image-dialog-card">
        <v-btn
          class="post-card__image-dialog-close"
          icon="mdi-close"
          size="small"
          variant="flat"
          @click="isImageDialogOpen = false"
        />

        <v-img :src="firstImageUrl" :alt="post.title || 'Post image'" class="post-card__image-dialog-img" />
      </v-card>
    </v-dialog>
  </v-card>

  <v-card v-else v-bind="$attrs" :class="cardClasses">
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
              <div class="post-card__meta-copy">
                <span class="post-card__owner-name">
                  {{ ownerName }}
                </span>
                <div v-if="ownerRating" class="post-card__owner-rating">
                  <UserRating :rating="ownerRating" />
                </div>
              </div>
              <span>{{ formattedDate }}</span>
            </div>
          </template>

          <template v-else>
            <div class="post-card__owner-name">
              {{ ownerName }}
            </div>
            <div v-if="ownerRating" class="post-card__owner-rating">
              <UserRating :rating="ownerRating" />
            </div>
            <div class="post-card__meta">
              {{ formattedDate }}
            </div>
          </template>
        </div>
      </div>

      <div v-if="showOwnerRole || $slots['header-actions'] || canReport" class="post-card__header-actions">
        <span
          v-if="showOwnerRole && ownerRole"
          class="post-card__role"
          :class="{ 'post-card__role--company': ownerRole === 'company' }"
        >
          {{ ownerRole }}
        </span>
        <slot name="header-actions" />

        <v-btn
          v-if="canReport"
          class="post-card__report-btn"
          type="button"
          icon
          size="small"
          :ripple="false"
          title="Report post"
          variant="text"
          @click.stop="openReportDialog"
        >
          <v-icon>mdi-flag-outline</v-icon>
        </v-btn>
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

      <div v-if="postTags.length" class="post-card__tags">
        <v-chip v-for="tag in postTags" :key="tag" size="small" variant="outlined" class="ma-1">
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

  <v-dialog v-model="reportDialog" max-width="520px">
    <v-card class="post-card__report-dialog">
      <v-card-title class="post-card__report-dialog-title">
        Report post
      </v-card-title>

      <v-card-text class="post-card__report-dialog-body">
        <p class="post-card__report-dialog-copy">
          Tell us what is wrong with this post. The report will be sent to moderation.
        </p>

        <v-select
          v-model="reportTags"
          :items="reportReasons"
          chips
          item-title="label"
          item-value="value"
          label="Reason"
          multiple
          variant="outlined"
        />
      </v-card-text>

      <v-card-actions class="post-card__report-dialog-actions">
        <v-btn class="post-card__report-cancel" :disabled="reportLoading" @click="closeReportDialog">
          Cancel
        </v-btn>

        <v-btn
          class="post-card__report-submit"
          :disabled="!reportTags.length || !canReport"
          :loading="reportLoading"
          prepend-icon="mdi-flag-outline"
          @click="submitReport"
        >
          Send report
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    location="bottom"
    multi-line
    rounded="pill"
    timeout="2500"
  >
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatPostDate } from '@/shared/lib/date/formatPostDate'
import { API_ORIGIN } from '@/shared/config/api'
import { api } from '@/shared/api/api'
import { useSnackbar } from '@/shared/lib/composables/useSnackbar'
import { getAvatarUrl } from '@/shared/lib/media/getAvatarUrl'
import type { EntityId, Nullable, Post, PostOwner } from '@/shared/types'
import UserRating from '@/entities/user/ui/UserRating.vue'

type PostCardVariant = 'feed' | 'profile'
type PostCardTitlePlacement = 'header' | 'body'
type ReportReason = 'spam' | 'harassment' | 'scam' | 'privacy_violation' | 'impersonation' | 'other'
type RatingSummary = {
  value: number
  total: number
}

interface PostCardImage {
  url?: Nullable<string>
}

type PostCardData = Omit<Post, 'owner'> & {
  owner?: Nullable<PostOwner & {
    rating?: RatingSummary | null
  }>
  title?: Nullable<string>
  content?: Nullable<string>
  intent?: Nullable<string>
  created_at?: Nullable<string>
  images?: Nullable<Array<string | PostCardImage>>
}

interface PostCardProps {
  post: PostCardData
  variant?: PostCardVariant
  titlePlacement?: PostCardTitlePlacement
  tagPrefix?: string
  showOwnerRole?: boolean
  ownerClickable?: boolean
  hoverable?: boolean
  avatarSize?: number
  rating?: RatingSummary | null
}

const props = withDefaults(defineProps<PostCardProps>(), {
  variant: 'feed',
  titlePlacement: 'body',
  tagPrefix: '',
  showOwnerRole: false,
  ownerClickable: false,
  hoverable: false,
  avatarSize: 36,
  rating: null,
})

const emit = defineEmits<{
  (event: 'owner-click', ownerId: EntityId): void
}>()
const isImageDialogOpen = ref(false)
const reportDialog = ref(false)
const reportLoading = ref(false)
const reportTags = ref<ReportReason[]>(['other'])
const reportReasons: Array<{ label: string, value: ReportReason }> = [
  { label: 'Spam', value: 'spam' },
  { label: 'Harassment', value: 'harassment' },
  { label: 'Scam or fraud', value: 'scam' },
  { label: 'Privacy violation', value: 'privacy_violation' },
  { label: 'Impersonation', value: 'impersonation' },
  { label: 'Other', value: 'other' },
]
const { showToast, snackbar } = useSnackbar()

const owner = computed(() => props.post.owner ?? null)
const ownerName = computed(() => owner.value?.name || 'Unknown user')
const ownerRole = computed(() => owner.value?.role || '')
const ownerRating = computed(() => props.rating ?? owner.value?.rating ?? null)
const ownerAvatarUrl = computed(() => getAvatarUrl(owner.value?.avatar ?? null))
const formattedDate = computed(() => formatPostDate(props.post.created_at))
const postTags = computed<string[]>(() => (Array.isArray(props.post.tags) ? props.post.tags : []))
const canReport = computed(() => props.post.id != null)
const firstImageUrl = computed(() => {
  const [image] = Array.isArray(props.post.images) ? props.post.images : []
  const imageUrl = typeof image === 'string' ? image : image?.url

  if (!imageUrl) return ''
  return imageUrl.startsWith('http') ? imageUrl : `${API_ORIGIN}${imageUrl}`
})
const cardClasses = computed(() => [
  'entity-post-card',
  `entity-post-card--${props.variant}`,
  { 'entity-post-card--hoverable': props.hoverable },
])

function handleOwnerClick() {
  if (!props.ownerClickable || owner.value?.id == null) return
  emit('owner-click', owner.value.id)
}

function tagLabel(tag: string) {
  return props.tagPrefix ? `${props.tagPrefix}${tag}` : tag
}

function openReportDialog() {
  if (!canReport.value) {
    return
  }

  reportDialog.value = true
}

function closeReportDialog() {
  if (reportLoading.value) {
    return
  }

  reportDialog.value = false
  reportTags.value = ['other']
}

async function submitReport() {
  if (!props.post.id) {
    showToast('Unable to report this post', 'error')
    return
  }

  const selectedTags = reportTags.value.filter(Boolean)

  if (!selectedTags.length) {
    showToast('Please choose at least one reason', 'warning')
    return
  }

  showToast('Sending report to moderation...', 'info')
  reportLoading.value = true

  try {
    await api.post('/reports', {
      targetType: 'post',
      targetId: props.post.id,
      tags: selectedTags,
    })

    showToast('Report sent to moderation', 'success')
    closeReportDialog()
  } catch (error) {
    console.error('Failed to send post report', error)
    showToast('Failed to send report', 'error')
  } finally {
    reportLoading.value = false
  }
}
</script>

<style scoped>
.entity-post-card {
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.entity-post-card--hoverable:hover {
  transform: translateY(-2px);
}

.entity-post-card--feed {
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 24px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.entity-post-card--feed.entity-post-card--hoverable:hover,
.entity-post-card--feed:hover {
  border-color: rgba(151, 229, 238, 0.9);
  box-shadow: 0 22px 52px rgba(15, 23, 42, 0.12);
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

.post-card__owner-rating {
  margin-top: 4px;
}

.post-card__meta-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.post-card__feed-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  padding: 26px 32px 18px;
  background: linear-gradient(180deg, #fbfdff 0%, #fff 100%);
  border-bottom: 1px solid #eef3f7;
}

.post-card__feed-owner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
}

.post-card__feed-owner .post-card__avatar {
  box-shadow: 0 0 0 3px #fff, 0 8px 18px rgba(15, 23, 42, 0.12);
}

.post-card__feed-owner-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding-top: 2px;
}

.post-card__feed-header .post-card__owner-name {
  font-size: 21px;
  line-height: 1.2;
  letter-spacing: 0;
}

.post-card__feed-date {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
}

.post-card__feed-badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  flex-shrink: 0;
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

.post-card__report-btn {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  color: #dc2626;
}

.post-card__role {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 6px 16px;
  border-radius: 999px;
  background: #e9fbef;
  border: 1px solid #D3FFAD;
  color: #73AA43;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.1;
  text-transform: capitalize;
}

.post-card__role--company {
  background: #edfbfd;
  border-color: #97E5EE;
  color: #63B5BE;
}

.post-card__body {
  padding-top: 0;
}

.post-card__feed-body {
  display: flex;
  flex-direction: column;
  padding: 24px 32px 32px;
}

.post-card__title--feed {
  align-self: flex-start;
  max-width: 100%;
  margin: 0 0 16px;
  color: #0f172a;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
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

.post-card__content-box {
  width: 100%;
  min-height: 120px;
  margin: 0 auto;
  padding: 22px 24px;
  border-radius: 18px;
  background: #f8fafc;
  border-left: 4px solid #97e5ee;
  color: #1f2937;
  font-size: 16px;
  line-height: 1.65;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.post-card__image-box {
  width: min(78%, 600px);
  margin: 26px auto 0;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  aspect-ratio: 16 / 9;
  background: #f8fafc;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  cursor: zoom-in;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.post-card__image-box:hover,
.post-card__image-box:focus-visible {
  border-color: #97e5ee;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.13);
  transform: translateY(-1px);
  outline: none;
}

.post-card__image-box :deep(.v-img) {
  width: 100%;
  height: 100%;
}

.post-card__image-dialog :deep(.v-overlay__content) {
  width: min(92vw, 980px);
}

.post-card__image-dialog-card {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: #0f172a;
}

.post-card__image-dialog-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
}

.post-card__image-dialog-img {
  width: 100%;
  max-height: 82vh;
}

.post-card__intent {
  margin-top: 12px;
}

.post-card__intent-chip {
  min-height: 30px;
  padding-inline: 13px;
  border-color: #cfcfcf;
  background: transparent;
  color: #3B6DBF;
  font-weight: 600;
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

.post-card__tags--feed {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  max-width: 420px;
  margin-top: 0;
}

.post-card__tags :deep(.v-chip) {
  border-radius: 12px;
  border: 1px solid #97e5ee;
  color: #0f172a;
  background-color: #fff;
  font-weight: 500;
}

.post-card__tags--feed :deep(.v-chip) {
  margin: 0;
  border-radius: 999px;
  border-color: #DBE7FF;
  background: #E5E7EB;
  color: #374151;
  font-weight: 600;
}

.post-card__actions {
  padding-top: 0;
}

.post-card__report-dialog {
  border-radius: 20px !important;
}

.post-card__report-dialog-title {
  font-weight: 800;
}

.post-card__report-dialog-body {
  display: grid;
  gap: 14px;
}

.post-card__report-dialog-copy {
  color: #64748b;
  margin: 0;
}

.post-card__report-dialog-actions {
  justify-content: flex-end;
  padding: 0 16px 16px;
}

.post-card__report-cancel,
.post-card__report-submit {
  border-radius: 14px;
  font-weight: 700;
  text-transform: none;
}

.post-card__report-cancel {
  color: #0f172a;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.35);
}

.post-card__report-submit {
  color: #ffffff;
  background: linear-gradient(135deg, #dc2626, #f97316);
}

@media (max-width: 960px) {
  .post-card__feed-header {
    flex-direction: column;
    gap: 16px;
    padding: 22px 20px 16px;
  }

  .post-card__feed-badges {
    flex-direction: row;
    align-items: center;
    align-self: stretch;
    flex-wrap: wrap;
  }

  .post-card__feed-body {
    padding: 20px 20px 24px;
  }

  .post-card__title--feed {
    margin-left: 0;
  }

  .post-card__content-box,
  .post-card__image-box {
    width: 100%;
  }

  .post-card__content-box {
    min-height: 150px;
    padding: 20px;
  }

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

@media (max-width: 600px) {
  .post-card__feed-owner {
    width: 100%;
  }

  .post-card__feed-header .post-card__owner-name {
    font-size: 20px;
  }

  .post-card__feed-date {
    font-size: 12px;
  }

  .post-card__role {
    min-height: 32px;
    font-size: 14px;
  }
}
</style>
