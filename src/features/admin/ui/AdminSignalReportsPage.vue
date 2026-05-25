<template>
  <main class="admin-signals">
    <section class="admin-signals__shell">
      <div class="admin-signals__header">
        <div>
          <p class="admin-signals__eyebrow">Administration</p>
          <h1>Signal Reports</h1>
          <p class="admin-signals__subtitle">
            Review the open moderation queue for reported signals and resolve items supported by the current backend.
          </p>
        </div>

        <div class="admin-signals__header-actions">
          <v-btn prepend-icon="mdi-arrow-left" variant="text" @click="router.push('/AdminPanel')">
            Back to panel
          </v-btn>

          <v-btn color="primary" prepend-icon="mdi-refresh" :loading="loading" @click="fetchReports">
            Refresh
          </v-btn>
        </div>
      </div>

      <v-card class="admin-signals__filters" flat>
        <div class="admin-signals__filters-row">
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            hide-details
            item-title="label"
            item-value="value"
            label="Status"
            variant="outlined"
          />

          <v-select
            v-model="limit"
            :items="limitOptions"
            hide-details
            label="Entries"
            variant="outlined"
          />

          <v-btn color="primary" :loading="loading" @click="fetchReports">
            Load reports
          </v-btn>
        </div>
      </v-card>

      <v-card class="admin-signals__table-card" flat>
        <div v-if="loading" class="admin-signals__state">
          <v-progress-circular color="primary" indeterminate />
          <p>Loading signal reports...</p>
        </div>

        <div v-else-if="reports.length === 0" class="admin-signals__state">
          <v-icon icon="mdi-message-alert-outline" size="36" />
          <p>No open signal reports found in the moderation queue.</p>
        </div>

        <div v-else class="admin-signals__table-wrap">
          <v-table class="admin-signals__table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Status</th>
                <th>Reporter</th>
                <th>Signal</th>
                <th>Tags</th>
                <th>Created</th>
                <th class="admin-signals__actions-head">Actions</th>
              </tr>
            </thead>

            <tbody>
              <template v-for="report in reports" :key="report.id">
                <tr>
                  <td>
                    <div class="admin-signals__report-meta">
                      <div class="admin-signals__report-id">#{{ report.id }}</div>
                      <div class="admin-signals__report-type">{{ report.target_type }}</div>
                    </div>
                  </td>

                  <td>
                    <v-chip
                      :color="getStatusColor(report.status)"
                      size="small"
                      variant="tonal"
                    >
                      {{ report.status }}
                    </v-chip>
                  </td>

                  <td>
                    <div class="admin-signals__person">
                      <div class="admin-signals__person-name">
                        {{ report.reporter_name || `User #${report.reporter_id}` }}
                      </div>
                      <div class="admin-signals__person-email">
                        {{ report.reporter_email || '-' }}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div class="admin-signals__signal-preview">
                      <div class="admin-signals__signal-subject">
                        {{ report.signal_subject || snapshotValue(report, 'subject') || 'No subject' }}
                      </div>
                      <div class="admin-signals__signal-message">
                        {{ truncate(report.signal_message || snapshotValue(report, 'message') || 'No message') }}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div class="admin-signals__tags">
                      <v-chip
                        v-for="tag in parsedTags(report)"
                        :key="`${report.id}-${tag}`"
                        size="x-small"
                        variant="outlined"
                      >
                        {{ tag }}
                      </v-chip>
                    </div>
                  </td>

                  <td>{{ formatDateTime(report.created_at) }}</td>

                  <td class="admin-signals__actions">
                    <v-btn
                      v-for="action in getActionButtons(report)"
                      :key="`${report.id}:${action.key}`"
                      :color="action.color"
                      size="small"
                      :variant="action.variant"
                      :loading="actionLoadingKey === `${report.id}:${action.key}`"
                      @click="runReportAction(report, action)"
                    >
                      {{ action.label }}
                    </v-btn>

                    <v-btn
                      size="small"
                      variant="text"
                      @click="toggleExpanded(report.id)"
                    >
                      {{ expandedReportId === report.id ? 'Hide details' : 'View details' }}
                    </v-btn>
                  </td>
                </tr>

                <tr v-if="expandedReportId === report.id">
                  <td colspan="7" class="admin-signals__details-row">
                    <div class="admin-signals__details-grid">
                      <div class="admin-signals__detail-card">
                        <div class="admin-signals__detail-label">Conversation</div>
                        <div class="admin-signals__detail-value">
                          #{{ report.conversation_id || snapshotValue(report, 'conversation_id') || '-' }}
                        </div>
                      </div>

                      <div class="admin-signals__detail-card">
                        <div class="admin-signals__detail-label">Sender</div>
                        <div class="admin-signals__detail-value">
                          {{ report.sender_name || `User #${report.sender_id || snapshotValue(report, 'sender_id') || '-'}` }}
                        </div>
                        <div class="admin-signals__detail-subvalue">
                          {{ report.sender_email || '-' }}
                        </div>
                      </div>

                      <div class="admin-signals__detail-card">
                        <div class="admin-signals__detail-label">Receiver</div>
                        <div class="admin-signals__detail-value">
                          {{ report.receiver_name || `User #${report.receiver_id || snapshotValue(report, 'receiver_id') || '-'}` }}
                        </div>
                        <div class="admin-signals__detail-subvalue">
                          {{ report.receiver_email || '-' }}
                        </div>
                      </div>

                      <div class="admin-signals__detail-card">
                        <div class="admin-signals__detail-label">Moderator</div>
                        <div class="admin-signals__detail-value">
                          {{ report.moderator_name || (report.moderator_id ? `User #${report.moderator_id}` : '-') }}
                        </div>
                        <div class="admin-signals__detail-subvalue">
                          {{ report.moderator_email || '-' }}
                        </div>
                      </div>
                    </div>

                    <div class="admin-signals__message-card">
                      <div class="admin-signals__detail-label">Reported message</div>
                      <pre>{{ report.signal_message || snapshotValue(report, 'message') || 'No message content' }}</pre>
                    </div>

                    <div class="admin-signals__json-grid">
                      <div class="admin-signals__json-card">
                        <div class="admin-signals__detail-label">Snapshot</div>
                        <pre>{{ formatJson(parseJson(report.snapshot)) }}</pre>
                      </div>

                      <div class="admin-signals__json-card">
                        <div class="admin-signals__detail-label">Resolution</div>
                        <pre>{{ formatJson(parseJson(report.resolution)) }}</pre>
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

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { api } from '@/shared/api/api'
  import { useSnackbar } from '@/shared/lib/composables/useSnackbar'

  const router = useRouter()
  const { showToast, snackbar } = useSnackbar()

  const reports = ref([])
  const loading = ref(false)
  const statusFilter = ref('open')
  const limit = ref(50)
  const expandedReportId = ref(null)
  const actionLoadingKey = ref('')

  const statusOptions = [
    { label: 'Open queue', value: 'open' },
  ]

  const limitOptions = [25, 50, 100]
  const statusActionButtons = {
    open: [
      { key: 'delete-signal', label: 'Delete signal', color: 'error', variant: 'tonal', type: 'delete-signal' },
      { key: 'resolved', label: 'Resolve', color: 'success', variant: 'tonal', type: 'status', status: 'resolved' },
    ],
  }

  function parseJson(value) {
    if (!value) {
      return null
    }

    if (typeof value === 'object') {
      return value
    }

    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }

    return value
  }

  function parsedTags(report) {
    const value = parseJson(report.tags)

    if (Array.isArray(value)) {
      return value
    }

    if (typeof value === 'string' && value.trim()) {
      return [value]
    }

    return []
  }

  function snapshotValue(report, key) {
    const snapshot = parseJson(report.snapshot)

    if (!snapshot || typeof snapshot !== 'object') {
      return ''
    }

    return snapshot.data?.[key] ?? ''
  }

  function getSignalId(report) {
    return report?.target_id || snapshotValue(report, 'id') || null
  }

  function formatJson(value) {
    if (!value) {
      return '{}'
    }

    if (typeof value === 'string') {
      return value
    }

    return JSON.stringify(value, null, 2)
  }

  function truncate(value, maxLength = 96) {
    if (!value || value.length <= maxLength) {
      return value
    }

    return `${value.slice(0, maxLength).trim()}...`
  }

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

  function getStatusColor(status) {
    switch (status) {
      case 'open':
        return 'warning'
      case 'in_review':
        return 'info'
      case 'resolved':
        return 'success'
      case 'rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  function toggleExpanded(reportId) {
    expandedReportId.value = expandedReportId.value === reportId ? null : reportId
  }

  function getActionButtons(report) {
    return statusActionButtons[report.status] || []
  }

  function getStatusSuccessMessage(status) {
    switch (status) {
      case 'resolved':
        return 'Report marked as resolved'
      default:
        return 'Report status updated'
    }
  }

  async function runReportAction(report, action) {
    if (action.type === 'delete-signal') {
      await deleteSignal(report)
      return
    }

    await updateStatus(report, action.status)
  }

  async function fetchReports() {
    loading.value = true

    try {
      const params = {
        limit: limit.value,
      }

      const response = await api.get('/moderation/queue', { params })
      const data = Array.isArray(response.data) ? response.data : []
      reports.value = data.filter(report => report?.target_type === 'message')
    } catch (error) {
      console.error('Failed to load signal reports', error)
      showToast('Failed to load signal reports', 'error')
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(report, status) {
    const loadingKey = `${report.id}:${status}`
    actionLoadingKey.value = loadingKey

    try {
      if (status !== 'resolved') {
        showToast('Only resolve is supported by the current backend', 'warning')
        return
      }

      await api.post('/moderation/resolve', { report })
      showToast(getStatusSuccessMessage(status), 'success')
      await fetchReports()
    } catch (error) {
      console.error('Failed to update signal report status', error)
      showToast('Failed to update report status', 'error')
    } finally {
      actionLoadingKey.value = ''
    }
  }

  async function deleteSignal(report) {
    const signalId = getSignalId(report)
    const loadingKey = `${report.id}:delete-signal`
    actionLoadingKey.value = loadingKey

    try {
      if (!signalId) {
        showToast('Signal id is missing for this report', 'error')
        return
      }

      await api.post(`/admin/signals/${signalId}/delete`)
      showToast('Signal deleted', 'success')
      await fetchReports()
    } catch (error) {
      console.error('Failed to delete signal', error)
      showToast('Failed to delete signal', 'error')
    } finally {
      actionLoadingKey.value = ''
    }
  }

  onMounted(fetchReports)
</script>

<style scoped>
.admin-signals {
  min-height: calc(100vh - 84px);
  background: #f7faf9;
  padding: 118px 20px 48px;
}

.admin-signals__shell {
  margin: 0 auto;
  max-width: 1240px;
}

.admin-signals__header {
  align-items: flex-start;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 24px;
}

.admin-signals__header-actions {
  display: flex;
  gap: 12px;
}

.admin-signals__eyebrow {
  color: #51756f;
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.admin-signals h1 {
  color: #10201d;
  font-family: 'Junge', serif;
  font-size: 40px;
  font-weight: 400;
  line-height: 1.1;
  margin: 0;
}

.admin-signals__subtitle {
  color: #52615e;
  font-size: 16px;
  margin: 10px 0 0;
  max-width: 620px;
}

.admin-signals__filters,
.admin-signals__table-card {
  border: 1px solid #dce8e5;
  border-radius: 18px;
}

.admin-signals__filters {
  margin-bottom: 18px;
  padding: 18px;
}

.admin-signals__filters-row {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(200px, 240px) minmax(140px, 180px) auto;
}

.admin-signals__state {
  align-items: center;
  color: #5c6e69;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  min-height: 260px;
  text-align: center;
}

.admin-signals__table-wrap {
  overflow-x: auto;
}

.admin-signals__table :deep(th) {
  color: #59706b;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.admin-signals__table :deep(td) {
  vertical-align: top;
}

.admin-signals__report-meta,
.admin-signals__person,
.admin-signals__signal-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-signals__report-id,
.admin-signals__person-name,
.admin-signals__signal-subject,
.admin-signals__detail-value {
  color: #162723;
  font-weight: 600;
}

.admin-signals__report-type,
.admin-signals__person-email,
.admin-signals__signal-message,
.admin-signals__detail-subvalue {
  color: #60716e;
  font-size: 13px;
}

.admin-signals__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 220px;
}

.admin-signals__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 260px;
}

.admin-signals__actions-head {
  min-width: 260px;
}

.admin-signals__details-row {
  background: #fbfefd;
  padding: 0;
}

.admin-signals__details-grid,
.admin-signals__json-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 14px;
}

.admin-signals__detail-card,
.admin-signals__message-card,
.admin-signals__json-card {
  background: #ffffff;
  border: 1px solid #dce8e5;
  border-radius: 14px;
  padding: 14px;
}

.admin-signals__detail-label {
  color: #59706b;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.admin-signals__message-card {
  margin-bottom: 14px;
}

.admin-signals__message-card pre,
.admin-signals__json-card pre {
  margin: 0;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.admin-signals__json-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 0;
}

@media (max-width: 960px) {
  .admin-signals__header,
  .admin-signals__header-actions {
    flex-direction: column;
  }

  .admin-signals__filters-row,
  .admin-signals__details-grid,
  .admin-signals__json-grid {
    grid-template-columns: 1fr;
  }

  .admin-signals__actions,
  .admin-signals__actions-head {
    min-width: 0;
  }
}

@media (max-width: 640px) {
  .admin-signals {
    padding: 158px 14px 36px;
  }

  .admin-signals h1 {
    font-size: 32px;
  }
}
</style>
