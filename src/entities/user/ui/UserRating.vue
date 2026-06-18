<template>
  <div v-if="hasRating" class="user-rating" :class="[`user-rating--${variant}`]">
    <div class="user-rating__icon">
      <v-icon size="14">mdi-star</v-icon>
    </div>

    <div class="user-rating__content">
      <div class="user-rating__score">
        {{ scoreText }}
      </div>

      <div v-if="showCount" class="user-rating__count">
        {{ countText }}
      </div>
    </div>
  </div>

  <div v-else-if="showEmpty" class="user-rating user-rating--empty" :class="[`user-rating--${variant}`]">
    <div class="user-rating__icon user-rating__icon--empty">
      <v-icon size="14">mdi-star-outline</v-icon>
    </div>

    <div class="user-rating__content">
      <div class="user-rating__score">
        No rating yet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { Nullable } from '@/shared/types'

  type RatingSummary = {
    value: number
    total: number
    breakdown?: {
      success: number
      rejected: number
      ignored: number
    }
  }

  interface UserRatingProps {
    rating?: Nullable<RatingSummary>
    showCount?: boolean
    showEmpty?: boolean
    variant?: 'compact' | 'panel'
  }

  const props = withDefaults(defineProps<UserRatingProps>(), {
    rating: null,
    showCount: true,
    showEmpty: false,
    variant: 'compact',
  })

  const hasRating = computed(() => Boolean(props.rating && props.rating.total > 0))
  const scoreText = computed(() => {
    if (!props.rating) {
      return ''
    }

    return `${(props.rating.value * 5).toFixed(1)}/5`
  })
  const countText = computed(() => {
    if (!props.rating) {
      return ''
    }

    return `${props.rating.total} ${props.rating.total === 1 ? 'rating' : 'ratings'}`
  })
</script>

<style scoped>
.user-rating {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.user-rating--compact {
  min-height: 24px;
}

.user-rating--panel {
  min-height: 28px;
}

.user-rating__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(250, 204, 21, 0.22), rgba(245, 158, 11, 0.16));
  color: #b45309;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.12);
}

.user-rating--compact .user-rating__icon {
  width: 22px;
  height: 22px;
}

.user-rating--panel .user-rating__icon {
  width: 26px;
  height: 26px;
}

.user-rating__icon--empty {
  background: rgba(148, 163, 184, 0.14);
  color: #64748b;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.16);
}

.user-rating__content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-rating__score {
  color: #0f172a;
  font-weight: 800;
  line-height: 1.1;
}

.user-rating--compact .user-rating__score {
  font-size: 13px;
}

.user-rating--panel .user-rating__score {
  font-size: 15px;
}

.user-rating__count {
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  margin-top: 2px;
}

.user-rating--empty .user-rating__score {
  color: #64748b;
  font-weight: 700;
}
</style>
