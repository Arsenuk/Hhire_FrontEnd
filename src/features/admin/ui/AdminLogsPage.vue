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

          <v-btn class="gradient-primary-btn" prepend-icon="mdi-refresh" :loading="loading" @click="fetchLogs">
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

          <v-btn class="gradient-primary-btn" :loading="loading" @click="fetchLogs">
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
                    <div v-if="hasPayload(log.payload)" class="admin-logs__payload-cell-content">
                      <div class="admin-logs__payload-preview">
                        {{ getPayloadSummary(log.payload) }}
                      </div>

                      <div class="admin-logs__payload-actions">
                        <v-btn
                          size="small"
                          variant="text"
                          @click="toggleExpanded(log.id)"
                        >
                          {{ expandedLogId === log.id ? 'Hide details' : 'View details' }}
                        </v-btn>

                        <v-btn
                          icon="mdi-content-copy"
                          size="small"
                          variant="text"
                          :aria-label="`Copy payload for log ${log.id}`"
                          @click="copyPayload(log.payload)"
                        />
                      </div>
                    </div>
                    <span v-else>-</span>
                  </td>
                </tr>

                <tr v-if="expandedLogId === log.id">
                  <td colspan="7" class="admin-logs__payload-row">
                    <div class="admin-logs__payload-panel">
                      <div class="admin-logs__payload-panel-header">
                        <div>
                          <div class="admin-logs__payload-title">Payload details</div>
                          <div class="admin-logs__payload-subtitle">
                            {{ getPayloadTypeLabel(log.payload) }}
                            <span v-if="getPayloadFieldCount(log.payload) >= 0">
                              | {{ getPayloadFieldCount(log.payload) }} {{ getPayloadCountLabel(log.payload) }}
                            </span>
                          </div>
                        </div>

                        <v-btn
                          prepend-icon="mdi-content-copy"
                          size="small"
                          variant="tonal"
                          @click="copyPayload(log.payload)"
                        >
                          Copy JSON
                        </v-btn>
                      </div>

                      <div v-if="getPayloadEntries(log.payload).length" class="admin-logs__payload-grid">
                        <article
                          v-for="entry in getPayloadEntries(log.payload)"
                          :key="entry.key"
                          class="admin-logs__payload-card"
                        >
                          <div class="admin-logs__payload-card-label">{{ entry.key }}</div>
                          <div class="admin-logs__payload-card-value">{{ entry.value }}</div>
                        </article>
                      </div>

                      <div class="admin-logs__payload-raw">
                        <div class="admin-logs__payload-raw-label">Raw payload</div>
                        <pre>{{ formatPayload(log.payload) }}</pre>
                      </div>
                    </div>
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

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { api } from '@/shared/api/api'
  import { useSnackbar } from '@/shared/lib/composables/useSnackbar'

  type Severity = 'critical' | 'high' | 'medium' | 'low' | string

  type AuditLog = {
    id: number | string
    created_at?: string | null
    actor_id?: number | string | null
    actor_role?: string | null
    action?: string | null
    entity_type?: string | null
    entity_id?: number | string | null
    severity?: Severity | null
    ip?: string | null
    payload?: unknown
  }

  type PayloadEntry = {
    key: string
    value: string
  }

  const router = useRouter()
  const { showToast, snackbar } = useSnackbar()

  const logs = ref<AuditLog[]>([])
  const loading = ref(false)
  const expandedLogId = ref<number | string | null>(null)
  const limit = ref(50)
  const limitOptions = [25, 50, 100]

  function formatDateTime(value: string | null | undefined) {
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

  function getSeverityColor(severity: Severity | null | undefined) {
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

  function parsePayload(payload: unknown) {
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

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  function truncate(value: string, limit = 96) {
    if (value.length <= limit) {
      return value
    }

    return `${value.slice(0, limit - 3).trimEnd()}...`
  }

  function formatScalar(value: unknown) {
    if (value === null || value === undefined) {
      return 'null'
    }

    if (typeof value === 'string') {
      return value.trim() || '""'
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }

    if (Array.isArray(value)) {
      return `Array(${value.length})`
    }

    if (isRecord(value)) {
      return 'Object'
    }

    return String(value)
  }

  function hasPayload(payload: unknown) {
    const parsed = parsePayload(payload)

    if (!parsed) {
      return false
    }

    if (typeof parsed === 'string') {
      return parsed.trim().length > 0 && parsed.trim() !== '{}'
    }

    return typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0
  }

  function getPayloadFieldCount(payload: unknown) {
    const parsed = parsePayload(payload)

    if (Array.isArray(parsed)) {
      return parsed.length
    }

    if (isRecord(parsed)) {
      return Object.keys(parsed).length
    }

    return -1
  }

  function getPayloadEntries(payload: unknown): PayloadEntry[] {
    const parsed = parsePayload(payload)

    if (!isRecord(parsed)) {
      return []
    }

    const preferredKeys = ['newRole', 'reason', 'flag', 'outcome', 'method', 'path', 'previousIp', 'currentIp', 'affectedCount']
    const entries = Object.entries(parsed).map(([key, value]) => ({
      key,
      value: formatScalar(value),
    }))

    return entries.sort((left, right) => {
      const leftIndex = preferredKeys.indexOf(left.key)
      const rightIndex = preferredKeys.indexOf(right.key)

      if (leftIndex !== -1 || rightIndex !== -1) {
        if (leftIndex === -1) return 1
        if (rightIndex === -1) return -1
        return leftIndex - rightIndex
      }

      return left.key.localeCompare(right.key)
    })
  }

  function getPayloadTypeLabel(payload: unknown) {
    const parsed = parsePayload(payload)

    if (parsed === null || parsed === undefined) {
      return 'Empty payload'
    }

    if (typeof parsed === 'string') {
      return 'Text payload'
    }

    if (Array.isArray(parsed)) {
      return 'Array payload'
    }

    if (isRecord(parsed)) {
      return 'JSON payload'
    }

    return 'Payload'
  }

  function getPayloadCountLabel(payload: unknown) {
    const parsed = parsePayload(payload)

    if (Array.isArray(parsed)) {
      return parsed.length === 1 ? 'item' : 'items'
    }

    return getPayloadFieldCount(payload) === 1 ? 'field' : 'fields'
  }

  function getPayloadSummary(payload: unknown) {
    const parsed = parsePayload(payload)

    if (parsed === null || parsed === undefined) {
      return '-'
    }

    if (typeof parsed === 'string') {
      return truncate(parsed.replace(/\s+/g, ' '), 88)
    }

    if (Array.isArray(parsed)) {
      return `Array(${parsed.length})`
    }

    if (!isRecord(parsed)) {
      return formatScalar(parsed)
    }

    const entries = getPayloadEntries(parsed)

    if (!entries.length) {
      return 'JSON object'
    }

    const head = entries.slice(0, 2).map(entry => `${entry.key}: ${truncate(entry.value, 36)}`)

    if (entries.length > head.length) {
      return `${head.join(' | ')} +${entries.length - head.length} more`
    }

    return head.join(' | ')
  }

  function formatPayload(payload: unknown) {
    const parsed = parsePayload(payload)

    if (!parsed) {
      return '{}'
    }

    if (typeof parsed === 'string') {
      return parsed
    }

    return JSON.stringify(parsed, null, 2)
  }

  async function copyPayload(payload: unknown) {
    const text = formatPayload(payload)

    try {
      await navigator.clipboard.writeText(text)
      showToast('Payload copied to clipboard', 'success')
    } catch (error) {
      console.error('Failed to copy payload', error)
      showToast('Could not copy payload', 'error')
    }
  }

  function toggleExpanded(id: number | string) {
    expandedLogId.value = expandedLogId.value === id ? null : id
  }

  async function fetchLogs() {
    loading.value = true

    try {
      const response = await api.get<AuditLog[]>('/admin/logs', {
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
  min-width: 250px;
}

.admin-logs__payload-cell-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-logs__payload-preview {
  color: #24403c;
  font-size: 13px;
  line-height: 1.45;
  word-break: break-word;
}

.admin-logs__payload-actions {
  align-items: center;
  display: flex;
  gap: 4px;
  margin-left: -8px;
}

.admin-logs__payload-row {
  background: #f3f8f6;
}

.admin-logs__payload-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-logs__payload-panel-header {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

.admin-logs__payload-title {
  color: #10201d;
  font-size: 15px;
  font-weight: 700;
}

.admin-logs__payload-subtitle {
  color: #60716e;
  font-size: 13px;
  margin-top: 4px;
}

.admin-logs__payload-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.admin-logs__payload-card {
  background: #ffffff;
  border: 1px solid #dce8e5;
  border-radius: 14px;
  padding: 14px 16px;
}

.admin-logs__payload-card-label {
  color: #55706c;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.admin-logs__payload-card-value {
  color: #17302c;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  word-break: break-word;
}

.admin-logs__payload-raw {
  background: #ffffff;
  border: 1px solid #dce8e5;
  border-radius: 14px;
  overflow: hidden;
}

.admin-logs__payload-raw-label {
  border-bottom: 1px solid #dce8e5;
  color: #55706c;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 12px 16px 10px;
  text-transform: uppercase;
}

.admin-logs__payload-raw pre {
  color: #314542;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  line-height: 1.55;
  margin: 0;
  max-height: 320px;
  overflow: auto;
  padding: 14px 16px 16px;
  white-space: pre-wrap;
  word-break: break-word;
}

.gradient-primary-btn {
  background: linear-gradient(90deg, #c3f894 0%, #4edeee 100%) !important;
  color: #020617 !important;
  font-weight: 600;
  text-transform: none;
}

.gradient-primary-btn:hover {
  background: linear-gradient(90deg, #c3f894 0%, #4edeee 100%) !important;
  color: #020617 !important;
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
