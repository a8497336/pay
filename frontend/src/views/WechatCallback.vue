<template>
  <div class="callback-container">
    <div class="loading">
      <div class="spinner"></div>
      <p>正在处理授权...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1])
  const openid = urlParams.get('openid')
  const accessToken = urlParams.get('access_token')

  if (openid) {
    userStore.setOpenid(openid)
    if (accessToken) {
      userStore.setAccessToken(accessToken)
    }
    
    setTimeout(() => {
      router.replace('/')
    }, 500)
  } else {
    alert('授权失败，请重试')
    router.replace('/')
  }
})
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

p {
  font-size: 16px;
  margin: 0;
}
</style>
