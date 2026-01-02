import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)

  const setOrders = (data) => {
    orders.value = data
  }

  const setCurrentOrder = (order) => {
    currentOrder.value = order
  }

  const addOrder = (order) => {
    orders.value.unshift(order)
  }

  const updateOrder = (orderId, updates) => {
    const index = orders.value.findIndex(o => o.orderNumber === orderId)
    if (index !== -1) {
      orders.value[index] = { ...orders.value[index], ...updates }
    }
  }

  const setLoading = (status) => {
    loading.value = status
  }

  return {
    orders,
    currentOrder,
    loading,
    setOrders,
    setCurrentOrder,
    addOrder,
    updateOrder,
    setLoading
  }
})
