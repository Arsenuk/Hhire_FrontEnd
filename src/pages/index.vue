<template>
  <v-container fluid class="welcome-page pa-0">
    <!-- Заголовок -->
    <v-row justify="center" class="mt-16 text-center">
      <v-col cols="12" md="8">
        <h2 class="main-title">
          Find Trusted Companies and Share Your Experience
        </h2>
        <p class="subtitle">
          Connect with verified businesses, share authentic reviews, and build trust in the corporate community.
          Join thousands of users making informed decisions every day.
        </p>

        <!-- Кнопка Get Started -->
        <RouterLink to="/signup">
          <v-btn class="get-started-btn mt-6" large>
            Get Started →
          </v-btn>
        </RouterLink>
      </v-col>
    </v-row>

    <!-- Фото після тексту -->
    <v-row justify="center" class="mt-12">
      <v-col cols="12" md="8">
        <v-img
          src="https://images.unsplash.com/photo-1759844197486-5b3612c7d534?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvbW11bmljYXRpb24lMjB0ZWFtfGVufDF8fHx8MTc2NDkyNDQzM3ww&ixlib=rb-4.1.0&q=80&w=1080"
          aspect-ratio="16/9"
          class="rounded-image"
          contain
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Тут можна додати реактивність або props пізніше
</script>

<style scoped>
.welcome-page {
  background-color: #ffffff;
}

/* Заголовок */
.main-title {
  font-family: 'Junge', serif;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 16px;
  margin-top: 16px;
}

/* Підзаголовок */
.subtitle {
  font-size: 18px;
  color: #333333;
  margin-bottom: 32px;
  line-height: 1.5;
}

/* Кнопка Get Started (як Header Sign Up) */
.get-started-btn {
  background: linear-gradient(90deg, #D3FFAD 11%, #97e5ee 100%);
  color: #000;
  font-family: 'Junge', serif;
  text-transform: none;
  font-weight: 600;
}

/* Картинка */
.rounded-image {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
</style>
