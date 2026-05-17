<template>
  <v-container class="feed-page">
    <v-row dense>
      <v-col cols="12" md="3">
        <div class="sticky-sidebar">
          <v-card class="sidebar-card">
            <div class="sidebar-title">
              Contacts
            </div>

            <v-list class="nav-list" nav>
              <v-list-item
                v-for="tab in tabs"
                :key="tab.key"
                class="nav-item"
                :active="currentTab === tab.key"
                @click="currentTab = tab.key"
              >
                <v-list-item-title class="nav-title">
                  {{ tab.label }}
                </v-list-item-title>

                <template #append>
                  <div v-if="currentTab === tab.key" class="active-dot" />
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </div>
      </v-col>

      <v-col cols="12" md="9">
        <v-card class="content-card">
          <component :is="currentComponent" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import Follows from '@/features/signals/ui/Follows.vue'
  import SendSignals from '@/features/signals/ui/SendSignals.vue'
  import SuggestedUsers from '@/features/signals/ui/SuggestedUsers.vue'
  import UnrepliedSignals from '@/features/signals/ui/UnrepliedSignals.vue'

  const currentTab = ref('follows')

  const tabs = [
    { key: 'follows', label: 'Follows', component: Follows },
    { key: 'suggested', label: 'Suggested Users', component: SuggestedUsers },
    { key: 'unreplied', label: 'Inbox', component: UnrepliedSignals },
    { key: 'send', label: 'Sent Dialogs', component: SendSignals },
  ]

  const currentComponent = computed(() => {
    const tab = tabs.find(item => item.key === currentTab.value)
    return tab ? tab.component : null
  })
</script>

<style scoped>
.feed-page {
  margin-top: 60px;
  background: #f4f6fb;
  min-height: 100vh;
  padding-top: 40px;
  font-family: system-ui, -apple-system, sans-serif;
}

.sticky-sidebar {
  position: sticky;
  top: 80px;
}

.sidebar-card {
  border-radius: 18px;
  padding: 14px;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.sidebar-title {
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
  padding-left: 6px;
}

.nav-list {
  padding: 0;
}

.nav-item {
  border-radius: 12px;
  margin: 4px 0;
  padding: 10px 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-item:hover {
  background: #e3fdff;
  transform: translateX(2px);
}

.nav-item.v-list-item--active {
   background: linear-gradient(135deg, #9BFF43, #31EAFF);
    color: #ffffff;
}

.nav-title {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.active-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 10px rgb(255, 255, 255);
}

.content-card {
  border-radius: 18px;
  padding: 16px;
  background: #ffffff;
  min-height: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.content-card:hover {
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
}
</style>
