<template>
  <div class="container">
    <div class="order-header">
      <div class="back-btn" @click="goBack">←</div>
      <div class="order-title">订单查询</div>
    </div>

    <div class="order-search">
      <div class="search-input-group">
        <input
          type="text"
          class="search-input"
          v-model="searchKeyword"
          placeholder="请输入订单号或户号"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">查询</button>
      </div>
      <div class="search-tabs">
        <div
          class="search-tab"
          :class="{ active: currentTab === 'all' }"
          @click="switchTab('all')"
        >
          全部订单
        </div>
        <div
          class="search-tab"
          :class="{ active: currentTab === 'completed' }"
          @click="switchTab('completed')"
        >
          已付款
        </div>
        <div
          class="search-tab"
          :class="{ active: currentTab === 'processing' }"
          @click="switchTab('processing')"
        >
          充值中
        </div>
        <div
          class="search-tab"
          :class="{ active: currentTab === 'success' }"
          @click="switchTab('success')"
        >
          已完成
        </div>
      </div>
    </div>

    <div class="order-list">
      <OrderList
        :orders="filteredOrders"
        :loading="loading"
        @view-detail="viewDetail"
        @apply-aftersale="applyAftersale"
      />
    </div>

    <OrderDetailModal
      v-model:visible="detailVisible"
      :order="currentOrder"
      @apply-aftersale="applyAftersale"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { orderApi } from '@/api'
import OrderList from '@/components/OrderList.vue'
import OrderDetailModal from '@/components/OrderDetailModal.vue'

const router = useRouter()
const orderStore = useOrderStore()

const searchKeyword = ref('')
const currentTab = ref('all')
const loading = ref(false)
const detailVisible = ref(false)
const currentOrder = ref(null)

const filteredOrders = computed(() => {
  let orders = orderStore.orders

  if (currentTab.value !== 'all') {
    orders = orders.filter(order => order.status === currentTab.value)
  }

  if (searchKeyword.value) {
    orders = orders.filter(order =>
      order.orderNumber.includes(searchKeyword.value) ||
      order.accountNumber.includes(searchKeyword.value)
    )
  }

  return orders
})

const goBack = () => {
  router.push('/')
}

const switchTab = (tab) => {
  currentTab.value = tab
}

const handleSearch = () => {
  if (searchKeyword.value) {
    loadOrders()
  }
}

const loadOrders = async () => {
  loading.value = true
  try {
    const params = {
      status: currentTab.value === 'all' ? undefined : currentTab.value,
      keyword: searchKeyword.value || undefined
    }
    const data = await orderApi.getOrders(params)
    orderStore.setOrders(data)
  } catch (error) {
    console.error('加载订单失败:', error)
  } finally {
    loading.value = false
  }
}

const viewDetail = (order) => {
  currentOrder.value = order
  detailVisible.value = true
}

const applyAftersale = async (orderNumber) => {
  try {
    await orderApi.updateOrderStatus(orderNumber, 'aftersale')
    orderStore.updateOrder(orderNumber, { status: 'aftersale' })
    alert('售后申请已提交，客服将在24小时内联系您')
    detailVisible.value = false
  } catch (error) {
    console.error('申请售后失败:', error)
    alert('申请售后失败，请稍后重试')
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.container {
  max-width: 420px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
  position: relative;
}

.order-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 20px;
  color: white;
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-btn {
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.9);
}

.order-title {
  font-size: 18px;
  font-weight: 600;
}

.order-search {
  padding: 20px;
  background: white;
  margin: 15px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.search-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.search-input {
  flex: 1;
  padding: 14px 16px;
  border: 2px solid #e8ecef;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafafa;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-input::placeholder {
  color: #adb5bd;
}

.search-btn {
  padding: 14px 20px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
}

.search-btn:active {
  transform: scale(0.97);
}

.search-btn:hover {
  opacity: 0.92;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.search-tabs {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.search-tab {
  flex: 1;
  padding: 10px;
  text-align: center;
  border: 2px solid #e8ecef;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  color: #666;
}

.search-tab:active {
  transform: scale(0.95);
}

.search-tab.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.order-list {
  padding: 0 15px;
  padding-bottom: 80px;
}

@media (max-width: 480px) {
  .container {
    max-width: 100%;
  }

  .order-header {
    padding: 18px 16px;
  }

  .order-search {
    margin: 12px;
    padding: 16px;
    border-radius: 14px;
  }

  .search-input-group {
    flex-direction: column;
    gap: 8px;
  }

  .search-input {
    padding: 12px 14px;
    font-size: 14px;
  }

  .search-btn {
    padding: 12px 16px;
    font-size: 13px;
  }

  .search-tabs {
    gap: 8px;
  }

  .search-tab {
    padding: 9px;
    font-size: 12px;
  }

  .order-list {
    padding: 0 12px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 600px;
    margin: 40px auto;
    min-height: calc(100vh - 80px);
  }
}
</style>
