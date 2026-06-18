<template>
  <v-container fluid class="home-page pa-0">
    <section class="hero-shell">
      <v-container class="section-shell">
        <v-row align="center" class="hero-row" justify="space-between">
          <v-col cols="12" md="6" class="hero-copy">
            <div class="eyebrow">
              Trusted company reviews
            </div>

            <h1 class="hero-title">
              Find trusted companies and share reviews that actually help people decide.
            </h1>

            <p class="hero-subtitle">
              Compare verified businesses, read authentic feedback, and build trust in the community with a cleaner
              and more transparent experience.
            </p>

            <div class="hero-actions">
              <v-btn
                class="primary-cta"
                color="#111111"
                size="large"
                to="/signup"
                variant="flat"
              >
                Get started
              </v-btn>

              <v-btn
                class="secondary-cta"
                size="large"
                to="/feed"
                variant="text"
              >
                Explore feed
              </v-btn>
            </div>

            <div class="trust-row">
              <div
                v-for="item in trustStats"
                :key="item.label"
                class="trust-pill"
              >
                <strong>{{ item.value }}</strong>
                <span>{{ item.label }}</span>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6" class="hero-visual-col">
            <div class="hero-visual">
              <v-img
                alt="People working together"
                class="hero-image"
                cover
                src="https://images.unsplash.com/photo-1759844197486-5b3612c7d534?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvbW11bmljYXRpb24lMjB0ZWFtfGVufDF8fHx8MTc2NDkyNDQzM3ww&ixlib=rb-4.1.0&q=80&w=1080"
              />

              <div class="floating-card floating-card-top">
                <span class="floating-label">Posts created today</span>
                <strong>{{ todayPostsDisplay }}</strong>
                <small>Fresh activity from the community</small>
              </div>

              <div class="floating-card floating-card-bottom">
                <span class="floating-label">Trust score</span>
                <strong>4.9/5</strong>
                <small>Based on community feedback</small>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="section-shell section-spacing">
      <v-row justify="center" class="text-center">
        <v-col cols="12" md="8">
          <div class="section-kicker">
            Why people use Hhire
          </div>
          <h2 class="section-title">
            A clearer way to discover, compare, and trust businesses.
          </h2>
          <p class="section-subtitle">
            Everything on the page should help a visitor understand the value in a few seconds, so we keep the message
            direct and the layout focused.
          </p>
        </v-col>
      </v-row>

      <v-row class="metrics-grid" justify="center">
        <v-col
          v-for="metric in metrics"
          :key="metric.label"
          cols="12"
          md="4"
        >
          <v-card class="metric-card" rounded="xl" variant="flat">
            <v-icon :color="metric.color" size="36">
              {{ metric.icon }}
            </v-icon>
            <strong class="metric-value">{{ metric.value }}</strong>
            <span class="metric-label">{{ metric.label }}</span>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <section class="section-shell section-spacing">
      <v-row justify="center" class="text-center">
        <v-col cols="12" md="8">
          <div class="section-kicker">
            How it works
          </div>
          <h2 class="section-title">
            Three simple steps to get from browsing to trusting.
          </h2>
        </v-col>
      </v-row>

      <v-row class="cards-grid" justify="center">
        <v-col
          v-for="step in steps"
          :key="step.title"
          cols="12"
          md="4"
        >
          <v-card class="info-card" rounded="xl" variant="flat">
            <div class="card-badge">
              0{{ step.index }}
            </div>
            <v-icon :color="step.color" size="44">
              {{ step.icon }}
            </v-icon>
            <h3 class="card-title">
              {{ step.title }}
            </h3>
            <p class="card-text">
              {{ step.text }}
            </p>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <section class="section-shell section-spacing section-bottom">
      <v-row justify="center" class="text-center">
        <v-col cols="12" md="8">
          <div class="section-kicker">
            Core benefits
          </div>
          <h2 class="section-title">
            Built to feel trustworthy, modern, and easy to scan.
          </h2>
        </v-col>
      </v-row>

      <v-row class="cards-grid" justify="center">
        <v-col
          v-for="feature in features"
          :key="feature.title"
          cols="12"
          md="4"
        >
          <v-card class="feature-card" rounded="xl" variant="flat">
            <div class="feature-icon-wrap">
              <v-icon :color="feature.color" size="40">
                {{ feature.icon }}
              </v-icon>
            </div>
            <h3 class="card-title">
              {{ feature.title }}
            </h3>
            <p class="card-text">
              {{ feature.text }}
            </p>
          </v-card>
        </v-col>
      </v-row>

      <v-row justify="center" class="cta-row">
        <v-col cols="12" md="6" class="text-center">
          <v-btn
            class="primary-cta"
            color="#000000"
            size="large"
            to="/signup"
            variant="flat"
          >
            Sign up now
          </v-btn>
        </v-col>
      </v-row>
    </section>
  </v-container>
</template>

<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue'
  import { api } from '@/shared/api/api'

  type TodayPostsResponse = {
    todayPosts?: number
  }

  const todayPosts = ref(0)
  const todayPostsDisplay = computed(() => todayPosts.value.toLocaleString())

  async function loadTodayPosts () {
    try {
      const { data } = await api.get<TodayPostsResponse>('/posts/stats/today')

      todayPosts.value = Number(data.todayPosts || 0)
    } catch (error) {
      console.error('Failed to load today posts count', error)
    }
  }

  onMounted(() => {
    void loadTodayPosts()
  })

  const trustStats = [
    { value: 'Verified', label: 'business profiles' },
    { value: 'Real', label: 'community reviews' },
    { value: 'Fast', label: 'sign-up flow' },
  ]

  const metrics = [
    {
      value: 'Trusted',
      label: 'Profiles are built for clearer decision-making',
      icon: 'mdi-shield-check',
      color: '#97e5ee',
    },
    {
      value: 'Honest',
      label: 'Reviews feel more useful when the layout is calm',
      icon: 'mdi-star-circle',
      color: '#d3ffad',
    },
    {
      value: 'Connected',
      label: 'A community-first look makes the product feel alive',
      icon: 'mdi-account-group',
      color: '#111111',
    },
  ]

  const steps = [
    {
      index: 1,
      title: 'Sign up',
      text: 'Create an account in a few clicks and start exploring businesses right away.',
      icon: 'mdi-account-check',
      color: '#97e5ee',
    },
    {
      index: 2,
      title: 'Browse and review',
      text: 'Read verified feedback, compare options, and leave your own experience.',
      icon: 'mdi-clipboard-list',
      color: '#d3ffad',
    },
    {
      index: 3,
      title: 'Connect',
      text: 'Use what you learn to make more confident decisions and build trust.',
      icon: 'mdi-handshake',
      color: '#111111',
    },
  ]

  const features = [
    {
      title: 'Verified businesses',
      text: 'Cleaner content hierarchy helps users spot authenticity sooner.',
      icon: 'mdi-shield-check',
      color: '#97e5ee',
    },
    {
      title: 'Real reviews',
      text: 'The page now guides attention to user feedback instead of competing noise.',
      icon: 'mdi-star-circle',
      color: '#d3ffad',
    },
    {
      title: 'Community driven',
      text: 'More spacing, better contrast, and stronger CTAs make the page feel premium.',
      icon: 'mdi-account-group',
      color: '#111111',
    },
  ]
</script>

<style scoped>
.home-page {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(151, 229, 238, 0.24), transparent 28%),
    radial-gradient(circle at top right, rgba(211, 255, 173, 0.22), transparent 24%),
    linear-gradient(180deg, #ffffff 0%, #fbfbf7 100%);
}

.home-page::before,
.home-page::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  filter: blur(8px);
  opacity: 0.75;
  pointer-events: none;
}

.home-page::before {
  top: 96px;
  left: -120px;
  width: 260px;
  height: 260px;
  background: rgba(151, 229, 238, 0.14);
}

.home-page::after {
  right: -140px;
  top: 280px;
  width: 320px;
  height: 320px;
  background: rgba(211, 255, 173, 0.14);
}

.section-shell {
  position: relative;
  z-index: 1;
  width: min(100% - 32px, 1180px);
  margin: 0 auto;
}

.hero-shell {
  padding: 76px 0 24px;
}

.hero-row {
  row-gap: 32px;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.eyebrow,
.section-kicker {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 8px 14px;
  border: 1px solid rgba(17, 17, 17, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  color: rgba(17, 17, 17, 0.7);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-title,
.section-title,
.card-title {
  font-family: 'Junge', serif;
  color: #111111;
  letter-spacing: -0.02em;
}

.hero-title {
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 4.5rem);
  line-height: 0.95;
  max-width: 11ch;
}

.hero-subtitle,
.section-subtitle,
.card-text,
.metric-label,
.trust-pill span,
.floating-card small {
  color: rgba(17, 17, 17, 0.72);
  line-height: 1.65;
}

.hero-subtitle {
  margin: 0;
  font-size: 1.05rem;
  max-width: 58ch;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
}

.primary-cta {
  background: linear-gradient(90deg, #D3FFAD 11%, #97e5ee 100%);
  color: #000000;
  min-width: 170px;
  border-radius: 999px;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0.01em;
  box-shadow: 0 12px 30px rgba(17, 17, 17, 0.14);
}

.secondary-cta {
  min-width: 150px;
  border-radius: 999px;
  color: #111111;
  font-weight: 700;
  text-transform: none;
}

.trust-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.trust-pill {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 134px;
  padding: 14px 16px;
  border: 1px solid rgba(17, 17, 17, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(8px);
}

.trust-pill strong {
  font-family: 'Junge', serif;
  font-size: 1.05rem;
  color: #111111;
}

.hero-visual-col {
  display: flex;
  justify-content: center;
}

.hero-visual {
  position: relative;
  width: min(100%, 560px);
  min-height: 520px;
}

.hero-image {
  min-height: 520px;
  border-radius: 32px;
  box-shadow: 0 28px 60px rgba(17, 17, 17, 0.14);
}

.floating-card {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 220px;
  padding: 18px 20px;
  border: 1px solid rgba(17, 17, 17, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 40px rgba(17, 17, 17, 0.12);
  backdrop-filter: blur(10px);
}

.floating-card strong {
  font-family: 'Junge', serif;
  font-size: 1.45rem;
  color: #111111;
}

.floating-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(17, 17, 17, 0.55);
}

.floating-card-top {
  top: 24px;
  left: -18px;
}

.floating-card-bottom {
  right: -12px;
  bottom: 26px;
}

.section-spacing {
  padding: 42px 0 0;
}

.section-bottom {
  padding-bottom: 72px;
}

.section-title {
  margin: 14px auto 12px;
  font-size: clamp(1.9rem, 3vw, 3rem);
  line-height: 1.05;
  max-width: 14ch;
}

.section-subtitle {
  margin: 0 auto;
  max-width: 68ch;
  font-size: 1rem;
}

.metrics-grid,
.cards-grid,
.cta-row {
  margin-top: 18px;
}

.metric-card,
.info-card,
.feature-card {
  height: 100%;
  padding: 26px;
  border: 1px solid rgba(17, 17, 17, 0.08);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 36px rgba(17, 17, 17, 0.06);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.metric-value {
  font-family: 'Junge', serif;
  font-size: 1.6rem;
  color: #111111;
}

.metric-label {
  font-size: 0.98rem;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.card-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  padding: 7px 12px;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.card-title {
  margin: 0;
  font-size: 1.4rem;
}

.card-text {
  margin: 0;
  font-size: 0.98rem;
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: rgba(17, 17, 17, 0.04);
}

.metric-card:hover,
.info-card:hover,
.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 44px rgba(17, 17, 17, 0.1);
  border-color: rgba(17, 17, 17, 0.14);
}

.cta-row {
  margin-top: 36px;
}

@media (max-width: 960px) {
  .hero-shell {
    padding-top: 24px;
  }

  .hero-visual {
    min-height: 400px;
  }

  .hero-image {
    min-height: 400px;
  }

  .floating-card {
    max-width: 180px;
  }

  .floating-card-top {
    left: 8px;
  }

  .floating-card-bottom {
    right: 8px;
  }
}

@media (max-width: 600px) {
  .hero-shell {
    padding-top: 20px;
  }

  .hero-title {
    line-height: 1.02;
    max-width: 100%;
  }

  .hero-actions,
  .trust-row {
    flex-direction: column;
  }

  .primary-cta,
  .secondary-cta {
    width: 100%;
  }

  .hero-visual {
    min-height: 320px;
  }

  .hero-image {
    min-height: 320px;
    border-radius: 24px;
  }

  .floating-card {
    position: static;
    max-width: none;
    margin-top: 12px;
  }

  .section-spacing {
    padding-top: 28px;
  }

  .section-bottom {
    padding-bottom: 56px;
  }
}
</style>
