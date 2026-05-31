<template>
  <v-dialog :model-value="modelValue" max-width="560px" persistent @update:model-value="handleDialogToggle">
    <v-card class="send-signal-dialog">
      <div class="send-signal-dialog__header">
        <div class="send-signal-dialog__title-wrap">
          <div class="send-signal-dialog__eyebrow">
            {{ contextLabel }}
          </div>
          <div class="send-signal-dialog__title">
            {{ title }}
          </div>
          <div class="send-signal-dialog__subtitle">
            {{ contextCopy }}
          </div>
        </div>

        <v-btn icon variant="text" class="close-btn" @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text class="send-signal-dialog__body">
        <div class="recipient-card" v-if="targetUser">
          <UserAvatar class="recipient-card__avatar" :size="54" :user="targetUser" />

          <div class="recipient-card__content">
            <div class="recipient-card__name">
              {{ targetUser.name }}
            </div>
            <div class="recipient-card__meta">
              {{ targetUser.description || 'Recipient profile' }}
            </div>
          </div>
        </div>

        <div class="message-panel">
          <v-textarea
            v-model="message"
            auto-grow
            class="message-field"
            :disabled="loading"
            hide-details="auto"
            label="Your message"
            :placeholder="placeholder"
            rows="5"
            variant="outlined"
            counter
            :maxlength="maxLength"
          />

          <div class="message-panel__hint">
            {{ helperText }}
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="send-signal-dialog__actions">
        <v-btn class="cancel-btn" variant="text" :disabled="loading" @click="handleClose">
          Cancel
        </v-btn>

        <v-btn
          class="send-btn"
          :disabled="!canSubmit"
          :loading="loading"
          @click="submit"
        >
          {{ primaryActionLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import UserAvatar from '@/entities/user/ui/UserAvatar.vue'
  import type { User } from '@/shared/types'

  interface SendSignalDialogProps {
    modelValue?: boolean
    targetUser?: User | null
    title?: string
    contextLabel?: string
    contextCopy?: string
    primaryActionLabel?: string
    helperText?: string
    placeholder?: string
    loading?: boolean
    maxLength?: number
  }

  const emit = defineEmits<{
    (event: 'close'): void
    (event: 'submit', message: string): void
    (event: 'update:modelValue', value: boolean): void
  }>()

  const props = withDefaults(defineProps<SendSignalDialogProps>(), {
    modelValue: false,
    targetUser: null,
    title: 'Send Signal',
    contextLabel: 'Message',
    contextCopy: 'Write a short introduction to start the conversation.',
    primaryActionLabel: 'Send signal',
    helperText: 'Press Send signal to deliver your message and open a conversation thread.',
    placeholder: 'Write a friendly intro, a question, or why you want to connect...',
    loading: false,
    maxLength: 1000,
  })

  const message = ref('')

  const canSubmit = computed(() => Boolean(message.value.trim()) && !props.loading)

  function resetDraft () {
    message.value = ''
  }

  function handleDialogToggle (value: boolean) {
    emit('update:modelValue', value)
    if (!value) {
      emit('close')
    }
  }

  function handleClose () {
    if (props.loading) {
      return
    }

    resetDraft()
    emit('update:modelValue', false)
    emit('close')
  }

  function submit () {
    const trimmedMessage = message.value.trim()
    if (!trimmedMessage || props.loading) {
      return
    }

    emit('submit', trimmedMessage)
  }

  watch(
    () => props.modelValue,
    value => {
      if (!value) {
        resetDraft()
      }
    },
  )

  watch(
    () => props.targetUser?.id,
    () => {
      resetDraft()
    },
  )
</script>

<style scoped>
.send-signal-dialog {
  border-radius: 24px !important;
  overflow: hidden;
  background: radial-gradient(circle at top left, rgba(155, 255, 67, 0.12), transparent 40%), #ffffff;
}

.send-signal-dialog__header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 22px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.send-signal-dialog__title-wrap {
  min-width: 0;
}

.send-signal-dialog__eyebrow {
  display: inline-flex;
  align-items: center;
  margin-bottom: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.1);
  color: #4338ca;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.send-signal-dialog__title {
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
}

.send-signal-dialog__subtitle {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.close-btn {
  flex-shrink: 0;
}

.send-signal-dialog__body {
  display: grid;
  gap: 16px;
  padding: 20px 22px 10px;
}

.recipient-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.96));
}

.recipient-card__avatar {
  flex: 0 0 auto;
}

.recipient-card__content {
  min-width: 0;
}

.recipient-card__name {
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.recipient-card__meta {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.4;
}

.message-panel {
  display: grid;
  gap: 10px;
}

.message-panel__hint {
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.message-field :deep(.v-field) {
  border-radius: 18px;
}

.send-signal-dialog__actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 10px 22px 22px;
}

.cancel-btn,
.send-btn {
  border-radius: 14px;
  font-weight: 700;
  text-transform: none;
}

.cancel-btn {
  color: #0f172a;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.28);
}

.send-btn {
  background: linear-gradient(135deg, #9bff43, #31eaff);
  color: #000000;
  box-shadow: 0 10px 22px rgba(99, 102, 241, 0.24);
}

@media (max-width: 640px) {
  .send-signal-dialog {
    border-radius: 0 !important;
  }

  .send-signal-dialog__header,
  .send-signal-dialog__body,
  .send-signal-dialog__actions {
    padding-left: 16px;
    padding-right: 16px;
  }

  .send-signal-dialog__actions {
    flex-direction: column-reverse;
  }

  .cancel-btn,
  .send-btn {
    width: 100%;
  }
}
</style>
