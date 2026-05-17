<template>
  <main class="admin-signals">
    <section class="admin-signals__shell">
      <div class="admin-signals__header">
        <div>
          <p class="admin-signals__eyebrow">Administration</p>
          <h1>Signal Reports</h1>
          <p class="admin-signals__subtitle">
            This page is reserved for signal moderation cases and report review flow.
          </p>
        </div>

        <v-btn prepend-icon="mdi-arrow-left" variant="text" @click="router.push('/AdminPanel')">
          Back to panel
        </v-btn>
      </div>

      <v-card class="admin-signals__placeholder" flat>
        <div class="admin-signals__placeholder-icon">
          <v-icon icon="mdi-message-alert-outline" size="36" />
        </div>
        <h2>Signal report moderation will land here</h2>
        <p>
          We already have a dedicated route and entry point. Next we can connect the report list,
          moderation details, and block actions from this screen.
        </p>
      </v-card>
    </section>
  </main>
</template>

<script setup>
  import { useRouter } from 'vue-router'

  const router = useRouter()
</script>

<style scoped>
.admin-signals {
  min-height: calc(100vh - 84px);
  background: #f7faf9;
  padding: 118px 20px 48px;
}

.admin-signals__shell {
  margin: 0 auto;
  max-width: 1120px;
}

.admin-signals__header {
  align-items: flex-start;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 24px;
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
  max-width: 560px;
}

.admin-signals__placeholder {
  align-items: center;
  border: 1px solid #dce8e5;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  padding: 42px 28px;
  text-align: center;
}

.admin-signals__placeholder-icon {
  align-items: center;
  background: #e8f6ee;
  border-radius: 999px;
  color: #23755f;
  display: flex;
  height: 68px;
  justify-content: center;
  margin-bottom: 16px;
  width: 68px;
}

.admin-signals__placeholder h2 {
  color: #172522;
  font-size: 24px;
  margin: 0 0 10px;
}

.admin-signals__placeholder p {
  color: #60716e;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  max-width: 640px;
}

@media (max-width: 640px) {
  .admin-signals {
    padding: 158px 14px 36px;
  }

  .admin-signals__header {
    flex-direction: column;
  }

  .admin-signals h1 {
    font-size: 32px;
  }
}
</style>
