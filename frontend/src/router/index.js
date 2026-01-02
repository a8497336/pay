import { createRouter, createWebHashHistory } from 'vue-router'
import Recharge from '@/views/Recharge.vue'
import Orders from '@/views/Orders.vue'
import OrderDetail from '@/views/OrderDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Recharge',
    component: Recharge
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: OrderDetail
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
