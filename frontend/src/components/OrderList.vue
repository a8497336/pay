<template>
  <div class="order-list-container">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="orders.length === 0" class="empty-orders">
      <div class="empty-icon">📋</div>
      <div class="empty-text">暂无订单记录</div>
      <div class="empty-tip">快去充值吧~</div>
    </div>
    <div v-else>
      <div v-for="order in orders" :key="order.orderNumber" class="order-item">
        <div class="order-header-info">
          <div class="order-number">{{ order.orderNumber }}</div>
          <div class="order-status" :class="statusClass(order.status)">{{ statusText(order.status) }}</div>
        </div>
        <div class="order-body">
          <div class="order-info-item">
            <div class="order-info-label">充值户号</div>
            <div class="order-info-value">{{ order.accountNumber }}</div>
          </div>
          <div class="order-info-item">
            <div class="order-info-label">充值类型</div>
            <div class="order-info-value">{{ order.typeName }}</div>
          </div>
          <div class="order-info-item">
            <div class="order-info-label">充值面额</div>
            <div class="order-info-value">{{ order.faceAmount }}元</div>
          </div>
          <div class="order-info-item">
            <div class="order-info-label">实付金额</div>
            <div class="order-info-value" style="color: #ff6b6b;">{{ order.payAmount }}元</div>
          </div>
          <div class="order-info-item">
            <div class="order-info-label">下单时间</div>
            <div class="order-info-value">{{ formatTime(order.createTime) }}</div>
          </div>
          <div class="order-info-item">
            <div class="order-info-label">支付方式</div>
            <div class="order-info-value">{{ paymentName(order.paymentMethod) }}</div>
          </div>
        </div>
        <div class="order-progress" v-if="order.status === 'processing'">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: order.progress + '%' }"></div>
          </div>
          <div class="progress-text">预计还需{{ order.remainingTime }}小时到账</div>
        </div>
        <div class="order-actions">
          <button class="order-btn" @click="$emit('view-detail', order)">查看详情</button>
          <button
            v-if="order.status === 'processing' || order.status === 'success'"
            class="order-btn primary"
            @click="$emit('apply-aftersale', order.orderNumber)"
          >
            申请售后
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  orders: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view-detail', 'apply-aftersale'])

const statusText = (status) => {
  const map = {
    'pending': '待支付',
    'completed': '已付款',
    'processing': '充值中',
    'success': '充值成功',
    'failed': '充值失败',
    'aftersale': '售后处理中'
  }
  return map[status] || '未知'
}

const statusClass = (status) => {
  const map = {
    'pending': 'status-pending',
    'completed': 'status-completed',
    'processing': 'status-processing',
    'success': 'status-success',
    'failed': 'status-failed',
    'aftersale': 'status-aftersale'
  }
  return map[status] || ''
}

const paymentName = (type) => {
  if (!type) return '未选择'
  
  const map = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    'card': '银行卡',
    'wechatpay': '微信支付',
    'weixin': '微信支付',
    'ali': '支付宝',
    'alipay': '支付宝'
  }
  
  const normalizedType = type.toLowerCase().trim()
  return map[normalizedType] || type
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}
</script>

<style scoped>
.order-list-container {
  padding: 0 15px;
  padding-bottom: 80px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e8ecef;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  margin-top: 16px;
  font-size: 14px;
  color: #999;
}

.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.empty-tip {
  font-size: 13px;
  color: #999;
}

.order-item {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.order-item:active {
  transform: scale(0.98);
}

.order-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.order-number {
  font-size: 12px;
  color: #999;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  letter-spacing: 0.5px;
}

.order-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-completed {
  background: #cce5ff;
  color: #004085;
}

.status-processing {
  background: #d1ecf1;
  color: #0c5460;
}

.status-success {
  background: #d4edda;
  color: #155724;
}

.status-failed {
  background: #f8d7da;
  color: #721c24;
}

.status-aftersale {
  background: #e2e3e5;
  color: #383d41;
}

.order-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  font-size: 13px;
  margin-bottom: 12px;
}

.order-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-info-label {
  color: #999;
  font-size: 12px;
}

.order-info-value {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.order-progress {
  margin: 12px 0;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  text-align: center;
}

.order-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.order-btn {
  padding: 10px 16px;
  border: 1px solid #e8ecef;
  background: white;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.order-btn:active {
  transform: scale(0.95);
}

.order-btn:hover {
  background: #f8f9fa;
  border-color: #6366f1;
}

.order-btn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-color: transparent;
}

.order-btn.primary:hover {
  opacity: 0.9;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

@media (max-width: 480px) {
  .order-list-container {
    padding: 0 12px;
  }

  .order-item {
    padding: 14px;
    border-radius: 14px;
    margin-bottom: 12px;
  }

  .order-body {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .order-info-item {
    flex-direction: row;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f8f9fa;
  }

  .order-info-item:last-child {
    border-bottom: none;
  }

  .order-actions {
    flex-direction: column;
  }

  .order-btn {
    width: 100%;
    padding: 12px;
    font-size: 14px;
  }
}

@media (min-width: 768px) {
  .order-list-container {
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>
