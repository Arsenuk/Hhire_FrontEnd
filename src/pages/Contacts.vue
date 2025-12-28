<template>
  <v-container class="feed-page">
    <v-row dense>
      <!-- ===== LEFT: NAVIGATION PANEL ===== -->
      <v-col cols="12" md="3">
        <div class="sticky-sidebar">
          <v-card class="sidebar-card">
            <v-list nav density="comfortable">
              <v-list-item
                v-for="tab in tabs"
                :key="tab.key"
                :active="currentTab === tab.key"
                @click="currentTab = tab.key"
                class="nav-item"
                rounded="xl"
              >
                <v-list-item-title class="nav-title">
                  {{ tab.label }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </div>
      </v-col>

      <!-- ===== RIGHT: MAIN CONTENT ===== -->
      <v-col cols="12" md="9">
        <v-card class="content-card">
          <component :is="currentComponent" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script setup>
import { ref, computed } from 'vue'

import Follows from '@/components/Follows.vue'
import SuggestedUsers from '@/components/SuggestedUsers.vue'
import UnrepliedSignals from '@/components/UnrepliedSignals.vue'
import SendSignals from '@/components/SendSignals.vue'

const currentTab = ref('follows')

const tabs = [
  { key: 'follows', label: 'Follows', component: Follows },
  { key: 'suggested', label: 'Suggested Users', component: SuggestedUsers },
  { key: 'unreplied', label: 'Unreplied Signals', component: UnrepliedSignals },
  { key: 'send', label: 'Send Signals', component: SendSignals },

]

const currentComponent = computed(() => {
  const tab = tabs.find(t => t.key === currentTab.value)
  return tab ? tab.component : null
})
</script>

<style scoped>
.feed-page {
  margin-top: 60px;
  background-color: #f7f9fc;
  min-height: 100vh;
  padding-top: 40px;
  font-family: 'Junge', serif;
}

/* ===== SIDEBAR ===== */
.sticky-sidebar {
  position: sticky;
  top: 80px;
}

.sidebar-card {
  border-radius: 18px;
  padding: 12px 8px;
  background-color: #ffffff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
}

/* ===== NAV ITEMS ===== */
.nav-item {
  margin: 4px 0;
  cursor: pointer;
  transition: background 0.25s ease, transform 0.15s ease;
}

.nav-item:hover {
  background: rgba(151, 229, 238, 0.2);
  transform: translateX(2px);
}

.nav-item.v-list-item--active {
  background: rgba(151, 229, 238, 0.35);
}

.nav-title {
  font-weight: 600;
  font-size: 14px;
}

/* ===== CONTENT ===== */
.content-card {
  border-radius: 18px;
  padding: 16px;
  background-color: #ffffff;
  min-height: 300px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
}
</style>

