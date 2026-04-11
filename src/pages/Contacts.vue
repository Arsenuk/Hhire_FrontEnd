<template>
  <v-container class="feed-page">
    <v-row dense>

      <!-- ===== SIDEBAR ===== -->
      <v-col cols="12" md="3">
        <div class="sticky-sidebar">
          <v-card class="sidebar-card">

            <div class="sidebar-title">
              Contacts
            </div>

            <v-list nav class="nav-list">

              <v-list-item v-for="tab in tabs" :key="tab.key" :active="currentTab === tab.key"
                @click="currentTab = tab.key" class="nav-item">
                <v-list-item-title class="nav-title">
                  {{ tab.label }}
                </v-list-item-title>

                <!-- ACTIVE INDICATOR -->
                <template #append>
                  <div v-if="currentTab === tab.key" class="active-dot" />
                </template>

              </v-list-item>

            </v-list>
          </v-card>
        </div>
      </v-col>

      <!-- ===== CONTENT ===== -->
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
  background: #f4f6fb;
  min-height: 100vh;
  padding-top: 40px;
  font-family: system-ui, -apple-system, sans-serif;
}

/* ===== SIDEBAR ===== */
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

/* SIDEBAR TITLE */
.sidebar-title {
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
  padding-left: 6px;
}

/* NAV LIST */
.nav-list {
  padding: 0;
}

/* ITEM */
.nav-item {
  border-radius: 12px;
  margin: 4px 0;
  padding: 10px 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

/* HOVER */
.nav-item:hover {
  background: rgba(140, 240, 178, 0.207);
  transform: translateX(2px);
}

/* ACTIVE */
.nav-item.v-list-item--active {
  background: rgba(119, 225, 110, 0.346);
}

/* TEXT */
.nav-title {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

/* ACTIVE DOT */
.active-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #b3bced;
  box-shadow: 0 0 10px rgb(255, 255, 255);
}

/* ===== CONTENT ===== */
.content-card {
  border-radius: 18px;
  padding: 16px;
  background: #ffffff;
  min-height: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

/* smooth transition feeling */
.content-card {
  transition: all 0.2s ease;
}

.content-card:hover {
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
}
</style>
