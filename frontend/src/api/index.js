import request from '@/utils/request'

export const orderApi = {
  createOrder(data) {
    return request({
      url: '/orders',
      method: 'post',
      data
    })
  },

  getOrders(params) {
    return request({
      url: '/orders',
      method: 'get',
      params
    })
  },

  getOrderDetail(id) {
    return request({
      url: `/orders/${id}`,
      method: 'get'
    })
  },

  updateOrderStatus(id, status) {
    return request({
      url: `/orders/${id}/status`,
      method: 'put',
      data: { status }
    })
  },

  searchOrders(keyword) {
    return request({
      url: '/orders/search',
      method: 'get',
      params: { keyword }
    })
  }
}

export const aftersaleApi = {
  createAftersale(data) {
    return request({
      url: '/aftersales',
      method: 'post',
      data
    })
  },

  getAftersales(params) {
    return request({
      url: '/aftersales',
      method: 'get',
      params
    })
  }
}

export const paymentApi = {
  processPayment(data) {
    return request({
      url: '/payment',
      method: 'post',
      data
    })
  },

  queryPaymentStatus(orderNumber) {
    return request({
      url: '/payment/query',
      method: 'post',
      data: { orderNumber }
    })
  },

  mockCompletePayment(data) {
    return request({
      url: '/payment/mock/complete',
      method: 'post',
      data
    })
  }
}
