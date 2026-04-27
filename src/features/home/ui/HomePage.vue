<template>
  <v-container fluid class="welcome-page pa-0">
    <v-row justify="center" class="mt-16 text-center">
      <v-col cols="12" md="8">
        <h2 class="main-title">
          Find Trusted Companies and Share Your Experience
        </h2>
        <p class="subtitle">
          Connect with verified businesses, share authentic reviews, and build trust in the corporate community.
          Join thousands of users making informed decisions every day.
        </p>

        <RouterLink to="/signup">
          <v-btn class="get-started-btn mt-6" large>
            Get Started ->
          </v-btn>
        </RouterLink>
      </v-col>
    </v-row>

    <v-row justify="center" class="mt-12">
      <v-col cols="12" md="8">
        <v-img
          src="https://images.unsplash.com/photo-1759844197486-5b3612c7d534?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvbW11bmljYXRpb24lMjB0ZWFtfGVufDF8fHx8MTc2NDkyNDQzM3ww&ixlib=rb-4.1.0&q=80&w=1080"
          aspect-ratio="16/9" class="rounded-image" contain />
      </v-col>
    </v-row>

    <v-row justify="center" class="mt-16 text-center">
      <v-col cols="12" md="8">
        <h2 class="main-title">
          How it works
        </h2>
        <p class="subtitle">
          Get started in three simple steps and join our growing community
        </p>
      </v-col>
    </v-row>

    <v-row justify="center" class="mt-8">
      <v-col cols="12" md="10">
        <v-row dense>
          <v-col cols="12" md="4" class="mb-6 text-center">
            <v-card class="step-card pa-6" outlined>
              <v-icon size="48" color="#97e5ee">mdi-account-check</v-icon>
              <h3 class="step-title mt-4">Sign Up</h3>
              <p class="step-text mt-2">
                Create your account quickly and easily to start connecting with trusted companies.
              </p>
            </v-card>
          </v-col>

          <v-col cols="12" md="4" class="mb-6 text-center">
            <v-card class="step-card pa-6" outlined>
              <v-icon size="48" color="#97e5ee">mdi-clipboard-list</v-icon>
              <h3 class="step-title mt-4">Browse &amp; Review</h3>
              <p class="step-text mt-2">
                Explore verified businesses, read real reviews, and share your own experiences.
              </p>
            </v-card>
          </v-col>

          <v-col cols="12" md="4" class="mb-6 text-center">
            <v-card class="step-card pa-6" outlined>
              <v-icon size="48" color="#97e5ee">mdi-handshake</v-icon>
              <h3 class="step-title mt-4">Connect</h3>
              <p class="step-text mt-2">
                Build meaningful connections with businesses and make informed decisions confidently.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row justify="center" class="mt-12">
      <v-col cols="12" md="10">
        <v-row dense>
          <v-col cols="12" md="4" class="mb-6 text-center">
            <v-card class="feature-card pa-6" outlined>
              <v-icon size="48" color="#D3FFAD">mdi-shield-check</v-icon>
              <h3 class="feature-title mt-4">Verified Businesses</h3>
              <p class="feature-text mt-2">
                All companies are verified to ensure authenticity and trust.
              </p>
            </v-card>
          </v-col>

          <v-col cols="12" md="4" class="mb-6 text-center">
            <v-card class="feature-card pa-6" outlined>
              <v-icon size="48" color="#D3FFAD">mdi-star-circle</v-icon>
              <h3 class="feature-title mt-4">Real Reviews</h3>
              <p class="feature-text mt-2">
                Read honest feedback from real users before making decisions.
              </p>
            </v-card>
          </v-col>

          <v-col cols="12" md="4" class="mb-6 text-center">
            <v-card class="feature-card pa-6" outlined>
              <v-icon size="48" color="#D3FFAD">mdi-account-group</v-icon>
              <h3 class="feature-title mt-4">Community Driven</h3>
              <p class="feature-text mt-2">
                Join a growing community of informed users and share your experience.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row justify="center" class="mt-8 mb-16">
      <v-col cols="12" md="6" class="text-center">
        <RouterLink to="/signup">
          <v-btn class="get-started-btn" large>
            Sign Up Now ->
          </v-btn>
        </RouterLink>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.welcome-page {
  background-color: #ffffff;
}

.main-title {
  font-family: 'Junge', serif;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 16px;
  margin-top: 16px;
}

.subtitle {
  font-family: 'Junge', serif;
  font-size: 18px;
  color: #333333;
  margin-bottom: 32px;
  line-height: 1.5;
}

.get-started-btn {
  background: linear-gradient(90deg, #d3ffad 11%, #97e5ee 100%);
  color: #000;
  font-family: 'Junge', serif;
  text-transform: none;
  font-weight: 600;
}

.rounded-image {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.step-card {
  border-radius: 12px;
  transition: transform 0.3s;
}

.step-card:hover {
  transform: translateY(-6px);
}

.step-title {
  font-family: 'Junge', serif;
  font-size: 20px;
  font-weight: 600;
}

.step-text {
  font-family: 'Junge', serif;
  font-size: 16px;
  color: #555555;
}

.feature-card {
  border-radius: 12px;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-6px);
}

.feature-title {
  font-family: 'Junge', serif;
  font-size: 20px;
  font-weight: 600;
}

.feature-text {
  font-family: 'Junge', serif;
  font-size: 16px;
  color: #555555;
}
</style>
