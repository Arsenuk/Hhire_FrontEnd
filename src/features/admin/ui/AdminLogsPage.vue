<template>
  <main class="admin-logs">
    <section class="admin-logs__shell">
      <div class="admin-logs__header">
        <div>
          <p class="admin-logs__eyebrow">Administration</p>
          <h1>Audit Logs</h1>
          <p class="admin-logs__subtitle">
            Track staff actions, moderation decisions, and security-sensitive events.
          </p>
        </div>

        <div class="admin-logs__header-actions">
          <v-btn prepend-icon="mdi-arrow-left" variant="text" @click="router.push('/AdminPanel')">
            Back to panel
          </v-btn>

          <v-btn color="primary" prepend-icon="mdi-refresh" :loading="loading" @click="fetchLogs">
            Refresh
          </v-btn>
        </div>
      </div>

      <v-card class="admin-logs__filters" flat>
        <div class="admin-logs__filters-row">
          <v-select
            v-model="limit"
            :items="limitOptions"
            hide-details
            label="Entries"
            variant="outlined"
          />

          <v-btn color="primary" :loading="loading" @click="fetchLogs">
            Load logs
          </v-btn>
        </div>
      </v-card>

      <v-card class="admin-logs__table-card" flat>
        <div v-if="loading" class="admin-logs__state">
          <v-progress-circular color="primary" indeterminate />
          <p>Loading logs...</p>
        </div>

        <div v-else-if="logs.length === 0" class="admin-logs__state">
          <v-icon icon="mdi-shield-search-outline" size="36" />
          <p>No audit entries found.</p>
        </div>

        <div v-else class="admin-logs__table-wrap">
          <v-table class="admin-logs__table">
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Severity</th>
                <th>IP</th>
                <th>Payload</th>
              </tr>
            </thead>

            <tbody>
              <template v-for="log in logs" :key="log.id">
                <tr>
                  <td>{{ formatDateTime(log.created_at) }}</td>
                  <td>
                    <div class="admin-logs__admin">
                      <div class="admin-logs__admin-id">#{{ log.actor_id ?? '-' }}</div>
                      <div class="admin-logs__actor-role">{{ log.actor_role || '-' }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="admin-logs__action">{{ log.action }}</div>
                  </td>
                  <td>
                    <div class="admin-logs__entity">
                      <span>{{ log.entity_type }}</span>
                      <span class="admin-logs__entity-id">#{{ log.entity_id }}</span>
                    </div>
                  </td>
                  <td>
                    <v-chip :color="getSeverityColor(log.severity)" size="small" variant="tonal">
                      {{ log.severity }}
                    </v-chip>
                  </td>
                  <td>{{ log.ip || '-' }}</td>
                  <td class="admin-logs__payload-cell">
                    <v-btn
                      v-if="hasPayload(log.payload)"
                      size="small"
                      variant="text"
                      @click="toggleExpanded(log.id)"
                    >
                      {{ expandedLogId === log.id ? 'Hide payload' : 'View payload' }}
                    </v-btn>
                    <span v-else>-</span>
                  </td>
                </tr>

                <tr v-if="expandedLogId === log.id">
                  <td colspan="7" class="admin-logs__payload-row">
                    <pre>{{ formatPayload(log.payload) }}</pre>
                  </td>
                </tr>
              </template>
            </tbody>
          </v-table>
        </div>
      </v-card>
    </section>
  </main>

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

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { api } from '@/shared/api/api'
  import { useSnackbar } from '@/shared/lib/composables/useSnackbar.js'

  const router = useRouter()
  const { showToast, snackbar } = useSnackbar()

  const logs = ref([])
  const loading = ref(false)
  const expandedLogId = ref(null)
  const limit = ref(50)
  const limitOptions = [25, 50, 100]

  function formatDateTime(value) {
    if (!value) {
      return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return new Intl.DateTimeFormat('en', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  function getSeverityColor(severity) {
    switch (severity) {
      case 'critical':
        return 'error'
      case 'high':
        return 'deep-orange'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'default'
    }
  }

  function parsePayload(payload) {
    if (!payload) {
      return null
    }

    if (typeof payload === 'object') {
      return payload
    }

    if (typeof payload === 'string') {
      try {
        return JSON.parse(payload)
      } catch {
        return payload
      }
    }

    return payload
  }

  function hasPayload(payload) {
    const parsed = parsePayload(payload)

    if (!parsed) {
      return false
    }

    if (typeof parsed === 'string') {
      return parsed.trim().length > 0 && parsed.trim() !== '{}'
    }

    return Object.keys(parsed).length > 0
  }

  function formatPayload(payload) {
    const parsed = parsePayload(payload)

    if (!parsed) {
      return '{}'
    }

    if (typeof parsed === 'string') {
      return parsed
    }

    return JSON.stringify(parsed, null, 2)
  }

  function toggleExpanded(id) {
    expandedLogId.value = expandedLogId.value === id ? null : id
  }

  async function fetchLogs() {
    loading.value = true

    try {
      const response = await api.get('/admin/logs', {
        params: {
          limit: limit.value,
        },
      })

      logs.value = Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Failed to load admin logs', error)
      showToast('Failed to load audit logs', 'error')
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchLogs)
</script>

<style scoped>
.admin-logs {
  min-height: calc(100vh - 84px);
  background: #f7faf9;
  padding: 118px 20px 48px;
}

.admin-logs__shell {
  margin: 0 auto;
  max-width: 1180px;
}

.admin-logs__header {
  align-items: flex-start;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 24px;
}

.admin-logs__eyebrow {
  color: #51756f;
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.admin-logs h1 {
  color: #10201d;
  font-family: 'Junge', serif;
  font-size: 40px;
  font-weight: 400;
  line-height: 1.1;
  margin: 0;
}

.admin-logs__subtitle {
  color: #52615e;
  font-size: 16px;
  margin: 10px 0 0;
  max-width: 620px;
}

.admin-logs__header-actions {
  display: flex;
  gap: 12px;
}

.admin-logs__filters,
.admin-logs__table-card {
  border: 1px solid #dce8e5;
  border-radius: 16px;
}

.admin-logs__filters {
  margin-bottom: 18px;
  padding: 18px;
}

.admin-logs__filters-row {
  align-items: center;
  display: flex;
  gap: 14px;
  justify-content: flex-end;
}

.admin-logs__table-wrap {
  overflow-x: auto;
}

.admin-logs__table :deep(th) {
  color: #45625d;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.admin-logs__table :deep(td) {
  padding: 18px 16px;
  vertical-align: top;
}

.admin-logs__admin-id,
.admin-logs__actor-role,
.admin-logs__entity-id {
  color: #60716e;
  font-size: 13px;
}

.admin-logs__action {
  color: #172522;
  font-size: 14px;
  font-weight: 700;
  min-width: 180px;
  word-break: break-word;
}

.admin-logs__entity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-logs__payload-cell {
  min-width: 120px;
}

.admin-logs__payload-row {
  background: #f3f8f6;
}

.admin-logs__payload-row pre {
  color: #314542;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  margin: 0;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.admin-logs__state {
  align-items: center;
  color: #60716e;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  min-height: 280px;
  padding: 24px;
  text-align: center;
}

@media (max-width: 860px) {
  .admin-logs__header {
    flex-direction: column;
  }

  .admin-logs__header-actions {
    flex-wrap: wrap;
  }

  .admin-logs__filters-row {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .admin-logs {
    padding: 158px 14px 36px;
  }

  .admin-logs h1 {
    font-size: 32px;
  }
}
</style>
