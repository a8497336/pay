<template>
  <div class="container">
    <div class="detail-header">
      <div class="back-btn" @click="goBack">←</div>
      <div class="detail-title">订单详情</div>
    </div>

    <div class="detail-content" v-if="order">
      <div class="detail-section">
        <div class="section-title">订单信息</div>
        <div class="detail-row">
          <span class="detail-label">订单号</span>
          <span class="detail-value">{{ order.orderNumber }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">下单时间</span>
          <span class="detail-value">{{ formatTime(order.createTime) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">订单状态</span>
          <span class="detail-value" :class="statusClass">{{ statusText }}</span>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">充值信息</div>
        <div class="detail-row">
          <span class="detail-label">充值类型</span>
          <span class="detail-value">{{ order.typeName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">用电户号</span>
          <span class="detail-value">{{ order.accountNumber }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">户主姓名</span>
          <span class="detail-value">{{ order.accountName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">供电区域</span>
          <span class="detail-value">{{ order.city }}</span>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">金额信息</div>
        <div class="detail-row">
          <span class="detail-label">充值面额</span>
          <span class="detail-value">{{ order.faceAmount }}元</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">优惠金额</span>
          <span class="detail-value discount">-{{ order.faceAmount - order.payAmount }}元</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">实付金额</span>
          <span class="detail-value pay-amount">{{ order.payAmount }}元</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">支付方式</span>
          <span class="detail-value">{{ paymentName }}</span>
        </div>
      </div>

      <div class="detail-section" v-if="order.status === 'processing'">
        <div class="section-title">到账进度</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: order.progress + '%' }"></div>
        </div>
        <div class="progress-text">预计还需{{ order.remainingTime }}小时到账</div>
      </div>

      <div class="detail-section" v-if="order.status === 'failed' && order.failReason">
        <div class="section-title">失败原因</div>
        <div class="fail-reason">{{ order.failReason }}</div>
      </div>

      <div class="detail-actions" v-if="order.status === 'processing' || order.status === 'success'">
        <button class="action-btn primary" @click="handleAftersale">申请售后</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { orderApi } from '@/api'

const router = useRouter()
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const order = ref(null)

const statusText = computed(() => {
  const map = {
    'pending': '待支付',
    'processing': '充值中',
    'success': '充值成功',
    'failed': '充值失败',
    'aftersale': '售后处理中'
  }
  return map[order.value?.status] || '未知'
})

const statusClass = computed(() => {
  const map = {
    'pending': 'status-pending',
    'processing': 'status-processing',
    'success': 'status-success',
    'failed': 'status-failed',
    'aftersale': 'status-aftersale'
  }
  return map[order.value?.status] || ''
})

const paymentName = computed(() => {
  const map = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    'card': '银行卡'
  }
  return map[order.value?.paymentMethod] || '未知'
})

const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

const goBack = () => {
  router.push('/orders')
}

const handleAftersale = async () => {
  try {
    await orderApi.updateOrderStatus(props.id, 'aftersale')
    alert('售后申请已提交，客服将在24小时内联系您')
    router.push('/orders')
  } catch (error) {
    console.error('申请售后失败:', error)
    alert('申请售后失败，请稍后重试')
  }
}

const loadOrderDetail = async () => {
  try {
    const data = await orderApi.getOrderDetail(props.id)
    order.value = data
  } catch (error) {
    console.error('加载订单详情失败:', error)
    alert('加载订单详情失败')
    router.push('/orders')
  }
}

loadOrderDetail()
</script>

<style scoped>
.container {
  max-width: 420px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
}

.detail-header {
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

.detail-title {
  font-size: 18px;
  font-weight: 600;
}

.detail-content {
  padding: 16px;
  padding-bottom: 80px;
}

.detail-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #999;
  font-weight: 400;
}

.detail-value {
  font-weight: 500;
  color: #333;
}

.discount {
  color: #52c41a;
  font-weight: 500;
}

.pay-amount {
  color: #ff6b6b;
  font-weight: 600;
}

.status-pending {
  color: #856404;
  background: #fff3cd;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-processing {
  color: #0c5460;
  background: #d1ecf1;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-success {
  color: #155724;
  background: #d4edda;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-failed {
  color: #721c24;
  background: #f8d7da;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-aftersale {
  color: #383d41;
  background: #e2e3e5;
  padding: 4px 8px;
  border-radius: 4px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 13px;
  color: #666;
  text-align: center;
}

.fail-reason {
  color: #ff6b6b;
  font-size: 14px;
  padding: 12px;
  background: #fee2e2;
  border-radius: 8px;
  line-height: 1.6;
}

.detail-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.action-btn {
  flex: 1;
  padding: 14px 20px;
  border: 1px solid #e8ecef;
  background: white;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:active {
  transform: scale(0.97);
}

.action-btn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.action-btn.primary:hover {
  opacity: 0.92;
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}

@media (max-width: 480px) {
  .detail-content {
    padding: 12px;
  }

  .detail-section {
    padding: 16px;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .detail-row {
    font-size: 13px;
    padding: 10px 0;
  }

  .action-btn {
    padding: 12px 16px;
    font-size: 14px;
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
