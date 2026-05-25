<template>
  <main class="admin-users">
    <section class="admin-users__shell">
      <div class="admin-users__header">
        <div>
          <p class="admin-users__eyebrow">Administration</p>
          <h1>Users</h1>
          <p class="admin-users__subtitle">
            Review account status and manage access to the platform.
          </p>
        </div>

        <div class="admin-users__header-actions">
          <v-btn prepend-icon="mdi-arrow-left" variant="text" @click="router.push('/AdminPanel')">
            Back to panel
          </v-btn>

          <v-btn color="primary" prepend-icon="mdi-refresh" :loading="loading" @click="fetchUsers">
            Refresh
          </v-btn>
        </div>
      </div>

      <v-card class="admin-users__filters" flat>
        <div class="admin-users__filters-row">
          <v-text-field
            v-model="searchQuery"
            class="admin-users__search"
            clearable
            hide-details
            label="Search by name or email"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            @keyup.enter="fetchUsers"
          />

          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            hide-details
            item-title="label"
            item-value="value"
            label="Status"
            variant="outlined"
          />

          <v-btn color="primary" :loading="loading" @click="fetchUsers">
            Search
          </v-btn>
        </div>
      </v-card>

      <v-card class="admin-users__table-card" flat>
        <div v-if="loading" class="admin-users__state">
          <v-progress-circular color="primary" indeterminate />
          <p>Loading users...</p>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="admin-users__state">
          <v-icon icon="mdi-account-search-outline" size="36" />
          <p>No users found for the current filters.</p>
        </div>

        <div v-else class="admin-users__table-wrap">
          <v-table class="admin-users__table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th class="admin-users__actions-head">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>
                  <div class="admin-users__person">
                    <div class="admin-users__person-name">
                      {{ user.name || 'Unnamed user' }}
                    </div>
                    <div class="admin-users__person-email">
                      {{ user.email || 'No email' }}
                    </div>
                  </div>
                </td>

                <td>
                  <v-chip size="small" variant="outlined">
                    {{ formatRole(user.role) }}
                  </v-chip>
                </td>

                <td>
                  <v-chip
                    :color="getStatusColor(user.status)"
                    size="small"
                    variant="tonal"
                  >
                    {{ user.status || 'unknown' }}
                  </v-chip>
                </td>

                <td>{{ formatDate(user.created_at) }}</td>

                <td class="admin-users__actions">
                  <v-btn
                    v-if="user.status === 'banned'"
                    color="success"
                    size="small"
                    variant="tonal"
                    :loading="actionLoadingId === user.id && pendingAction === 'unban'"
                    @click="openConfirmation(user, 'unban')"
                  >
                    Unban
                  </v-btn>

                  <v-btn
                    v-else
                    color="error"
                    size="small"
                    variant="tonal"
                    :loading="actionLoadingId === user.id && pendingAction === 'ban'"
                    @click="openConfirmation(user, 'ban')"
                  >
                    Ban
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card>
    </section>
  </main>

  <v-dialog v-model="confirmDialog" max-width="460">
    <v-card class="admin-users__dialog">
      <v-card-title class="admin-users__dialog-title">
        {{ pendingAction === 'ban' ? 'Block user account' : 'Restore user access' }}
      </v-card-title>

      <v-card-text class="admin-users__dialog-text">
        <p v-if="selectedUser">
          {{ pendingAction === 'ban' ? 'You are about to block' : 'You are about to unblock' }}
          <strong>{{ selectedUser.name || selectedUser.email || `User #${selectedUser.id}` }}</strong>.
        </p>
        <p>
          {{ pendingAction === 'ban'
            ? 'The user will no longer be able to sign in until an admin unblocks the account.'
            : 'The user status will be set back to active and access will be restored.' }}
        </p>
      </v-card-text>

      <v-card-actions class="admin-users__dialog-actions">
        <v-btn variant="text" @click="closeConfirmation">
          Cancel
        </v-btn>

        <v-btn
          :color="pendingAction === 'ban' ? 'error' : 'success'"
          :loading="Boolean(actionLoadingId)"
          @click="submitAction"
        >
          {{ pendingAction === 'ban' ? 'Confirm ban' : 'Confirm unban' }}
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

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { normalizeUsers } from '@/entities/user/lib/normalizeUser'
  import { api } from '@/shared/api/api'
  import { useSnackbar } from '@/shared/lib/composables/useSnackbar.js'

  const router = useRouter()
  const { showToast, snackbar } = useSnackbar()

  const users = ref([])
  const loading = ref(false)
  const searchQuery = ref('')
  const statusFilter = ref('all')

  const confirmDialog = ref(false)
  const selectedUser = ref(null)
  const pendingAction = ref('ban')
  const actionLoadingId = ref(null)

  const statusOptions = [
    { label: 'All statuses', value: 'all' },
    { label: 'Active', value: 'active' },
    // { label: 'Pending', value: 'pending' },
    { label: 'Frozen', value: 'frozen' },
    { label: 'Banned', value: 'banned' },
  ]

  const filteredUsers = computed(() => {
    if (statusFilter.value === 'all') {
      return users.value
    }

    return users.value.filter(user => user.status === statusFilter.value)
  })

  function formatRole(role = 'user') {
    return role
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  function formatDate(value) {
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
    }).format(date)
  }

  function getStatusColor(status) {
    switch (status) {
      case 'active':
        return 'success'
      case 'banned':
        return 'error'
      case 'pending':
        return 'warning'
      case 'frozen':
        return 'secondary'
      default:
        return 'default'
    }
  }

  async function fetchUsers() {
    loading.value = true

    try {
      const params = {}

      if (searchQuery.value.trim()) {
        params.q = searchQuery.value.trim()
      }

      const response = await api.get('/admin/users', { params })
      users.value = normalizeUsers(response.data || [])
    } catch (error) {
      console.error('Failed to load admin users', error)
      showToast('Failed to load users', 'error')
    } finally {
      loading.value = false
    }
  }

  function openConfirmation(user, action) {
    selectedUser.value = user
    pendingAction.value = action
    confirmDialog.value = true
  }

  function closeConfirmation({ force = false } = {}) {
    if (actionLoadingId.value && !force) {
      return
    }

    confirmDialog.value = false
    selectedUser.value = null
  }

  async function submitAction() {
    if (!selectedUser.value) {
      return
    }

    actionLoadingId.value = selectedUser.value.id

    try {
      const action = pendingAction.value
      await api.post(`/admin/users/${selectedUser.value.id}/${action}`)

      const nextStatus = action === 'ban' ? 'banned' : 'active'
      users.value = users.value.map(user => (
        user.id === selectedUser.value.id
          ? { ...user, status: nextStatus }
          : user
      ))

      showToast(
        action === 'ban' ? 'User has been banned' : 'User has been unbanned',
        'success',
      )
      closeConfirmation({ force: true })
    } catch (error) {
      console.error(`Failed to ${pendingAction.value} user`, error)
      showToast(
        pendingAction.value === 'ban' ? 'Failed to ban user' : 'Failed to unban user',
        'error',
      )
    } finally {
      actionLoadingId.value = null
    }
  }

  onMounted(fetchUsers)
</script>

<style scoped>
.admin-users {
  min-height: calc(100vh - 84px);
  background: #f7faf9;
  padding: 118px 20px 48px;
}

.admin-users__shell {
  margin: 0 auto;
  max-width: 1180px;
}

.admin-users__header {
  align-items: flex-start;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 24px;
}

.admin-users__eyebrow {
  color: #51756f;
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.admin-users h1 {
  color: #10201d;
  font-family: 'Junge', serif;
  font-size: 40px;
  font-weight: 400;
  line-height: 1.1;
  margin: 0;
}

.admin-users__subtitle {
  color: #52615e;
  font-size: 16px;
  margin: 10px 0 0;
  max-width: 560px;
}

.admin-users__header-actions {
  display: flex;
  gap: 12px;
}

.admin-users__filters,
.admin-users__table-card {
  border: 1px solid #dce8e5;
  border-radius: 16px;
}

.admin-users__filters {
  margin-bottom: 18px;
  padding: 18px;
}

.admin-users__filters-row {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1.6fr) minmax(180px, 0.7fr) auto;
}

.admin-users__search {
  min-width: 0;
}

.admin-users__table-wrap {
  overflow-x: auto;
}

.admin-users__table :deep(th) {
  color: #45625d;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.admin-users__table :deep(td) {
  padding: 18px 16px;
  vertical-align: middle;
}

.admin-users__person-name {
  color: #172522;
  font-size: 15px;
  font-weight: 700;
}

.admin-users__person-email {
  color: #60716e;
  font-size: 13px;
  margin-top: 4px;
}

.admin-users__actions,
.admin-users__actions-head {
  text-align: right;
}

.admin-users__state {
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

.admin-users__dialog {
  border-radius: 18px;
}

.admin-users__dialog-title {
  color: #172522;
  font-size: 18px;
  font-weight: 700;
  padding: 18px 20px 0;
}

.admin-users__dialog-text {
  color: #52615e;
  font-size: 14px;
  line-height: 1.6;
  padding: 16px 20px 8px;
}

.admin-users__dialog-actions {
  justify-content: flex-end;
  padding: 12px 20px 20px;
}

@media (max-width: 860px) {
  .admin-users__header {
    flex-direction: column;
  }

  .admin-users__header-actions {
    flex-wrap: wrap;
  }

  .admin-users__filters-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .admin-users {
    padding: 158px 14px 36px;
  }

  .admin-users h1 {
    font-size: 32px;
  }
}
</style>
