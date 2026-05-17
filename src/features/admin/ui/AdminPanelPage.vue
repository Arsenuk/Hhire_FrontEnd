<template>
  <main class="admin-panel">
    <section class="admin-panel__shell">
      <div class="admin-panel__header">
        <div>
          <p class="admin-panel__eyebrow">Workspace</p>
          <h1>Admin Panel</h1>
          <p class="admin-panel__subtitle">
            Central place for moderation and administrative workflows.
          </p>
        </div>

        <v-chip class="admin-panel__role" color="success" variant="tonal">
          {{ roleLabel }}
        </v-chip>
      </div>

      <div class="admin-panel__grid">
        <v-card
          v-for="item in panelItems"
          :key="item.title"
          class="admin-panel__card"
          flat
        >
          <v-card-text>
            <div class="admin-panel__card-icon">
              <v-icon :icon="item.icon" />
            </div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.description }}</p>

            <div class="admin-panel__card-actions">
              <v-btn
                v-if="item.to"
                color="primary"
                variant="flat"
                @click="router.push(item.to)"
              >
                Open
              </v-btn>

              <v-chip v-else size="small" variant="outlined">
                Coming soon
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </section>
  </main>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/features/auth/model/auth.store.js'

  const authStore = useAuthStore()
  const router = useRouter()

  const roleLabel = computed(() => {
    const role = authStore.user?.role || 'staff'
    return role
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  })

  const panelItems = [
    {
      title: 'Users',
      description: 'Review users, roles, status, and account actions.',
      icon: 'mdi-account-group',
      to: '/AdminPanelUsers',
    },
    {
      title: 'Posts',
      description: 'Moderate reported posts and visibility decisions.',
      icon: 'mdi-file-document-outline',
    },
    {
      title: 'Signals',
      description: 'Inspect reported signals and conversation safety cases.',
      icon: 'mdi-message-alert-outline',
      to: '/AdminPanelSignalReports',
    },
    {
      title: 'Audit Logs',
      description: 'Track staff actions and security-sensitive changes.',
      icon: 'mdi-shield-search',
      to: '/AdminPanelLogs',
    },
  ]
</script>

<style scoped>
.admin-panel {
  min-height: calc(100vh - 84px);
  background: #f7faf9;
  padding: 118px 20px 48px;
}

.admin-panel__shell {
  max-width: 1120px;
  margin: 0 auto;
}

.admin-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.admin-panel__eyebrow {
  color: #51756f;
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.admin-panel h1 {
  color: #10201d;
  font-family: 'Junge', serif;
  font-size: 40px;
  font-weight: 400;
  line-height: 1.1;
  margin: 0;
}

.admin-panel__subtitle {
  color: #52615e;
  font-size: 16px;
  margin: 10px 0 0;
  max-width: 560px;
}

.admin-panel__role {
  flex: 0 0 auto;
  font-weight: 700;
}

.admin-panel__grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.admin-panel__card {
  border: 1px solid #dce8e5;
  border-radius: 8px;
  min-height: 214px;
}

.admin-panel__card :deep(.v-card-text) {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.admin-panel__card-icon {
  align-items: center;
  background: #e8f6ee;
  border-radius: 8px;
  color: #23755f;
  display: flex;
  height: 42px;
  justify-content: center;
  margin-bottom: 18px;
  width: 42px;
}

.admin-panel__card h2 {
  color: #172522;
  font-size: 18px;
  line-height: 1.25;
  margin: 0 0 8px;
}

.admin-panel__card p {
  color: #5a6966;
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 18px;
}

@media (max-width: 960px) {
  .admin-panel__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .admin-panel {
    padding: 158px 14px 36px;
  }

  .admin-panel__header {
    align-items: stretch;
    flex-direction: column;
  }

  .admin-panel h1 {
    font-size: 32px;
  }

  .admin-panel__grid {
    grid-template-columns: 1fr;
  }

  .admin-panel__role {
    align-self: flex-start;
  }
}
</style>
