<template>
  <ProfileUser />
</template>

<script setup>
import ProfileUser from '@/components/ProfileUser.vue'
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api/api.js'

const route = useRoute()
const router = useRouter()

const user = ref(null)
const posts = ref([])
const loading = ref(true)

const userId = ref(route.params.id)

const getAvatarUrl = (avatar) =>
  avatar ? `http://localhost:3000${avatar}` : '/assets/default-avatar.png'

async function loadUserProfile() {
  loading.value = true
  try {
    const res = await api.get(`/users/${userId.value}/profile`)
    user.value = res.data       // <- тут змінив .user на res.data
    posts.value = res.data.posts || [] // якщо бекенд не повертає posts, залишиться пустим
  } catch (err) {
    console.error(err)
    router.push('/feed')
  } finally {
    loading.value = false
  }
}


onMounted(loadUserProfile)

// якщо перейти з /profile/1 → /profile/2 без перезавантаження
watch(() => route.params.id, (newId) => {
  userId.value = newId
  loadUserProfile()
})
</script>

<style scoped>
    
</style>