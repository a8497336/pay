<template>
  <div class="modal" v-if="visible" @click="handleOutsideClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">订单详情</h3>
        <div class="order-status" :class="statusClass">{{ statusText }}</div>
      </div>
      <div class="modal-body">
        <div class="detail-section">
          <div class="section-title">订单信息</div>
          <div class="detail-row">
            <span class="detail-label">订单号</span>
            <span class="detail-value">{{ order?.orderNumber }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">下单时间</span>
            <span class="detail-value">{{ formatTime(order?.createTime) }}</span>
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
            <span class="detail-value">{{ order?.typeName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">用电户号</span>
            <span class="detail-value">{{ order?.accountNumber }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">户主姓名</span>
            <span class="detail-value">{{ order?.accountName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">供电区域</span>
            <span class="detail-value">{{ order?.city }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">金额信息</div>
          <div class="detail-row">
            <span class="detail-label">充值面额</span>
            <span class="detail-value">{{ order?.faceAmount }}元</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">优惠金额</span>
            <span class="detail-value discount">-{{ order?.faceAmount - order?.payAmount }}元</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">实付金额</span>
            <span class="detail-value pay-amount">{{ order?.payAmount }}元</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">支付方式</span>
            <span class="detail-value">{{ paymentName }}</span>
          </div>
        </div>

        <div class="detail-section" v-if="order?.status === 'processing'">
          <div class="section-title">到账进度</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: order?.progress + '%' }"></div>
          </div>
          <div class="progress-text">预计还需{{ order?.remainingTime }}小时到账</div>
        </div>

        <div class="detail-section" v-if="order?.status === 'failed' && order?.failReason">
          <div class="section-title">失败原因</div>
          <div class="fail-reason">{{ order.failReason }}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-btn modal-btn-secondary" @click="handleClose">关闭</button>
        <button
          v-if="order?.status === 'processing' || order?.status === 'success'"
          class="modal-btn modal-btn-primary"
          @click="handleAftersale"
        >
          申请售后
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'apply-aftersale'])

const statusText = computed(() => {
  const map = {
    'pending': '待支付',
    'completed': '已付款',
    'processing': '充值中',
    'success': '充值成功',
    'failed': '充值失败',
    'aftersale': '售后处理中'
  }
  return map[props.order?.status] || '未知'
})

const statusClass = computed(() => {
  const map = {
    'pending': 'status-pending',
    'completed': 'status-completed',
    'processing': 'status-processing',
    'success': 'status-success',
    'failed': 'status-failed',
    'aftersale': 'status-aftersale'
  }
  return map[props.order?.status] || ''
})

const paymentName = computed(() => {
  const map = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    'card': '银行卡'
  }
  return map[props.order?.paymentMethod] || '未知'
})

const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleAftersale = () => {
  emit('apply-aftersale', props.order?.orderNumber)
  handleClose()
}

const handleOutsideClick = () => {
  handleClose()
}
</script>

<style scoped>
.modal {
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  z-index: 2000;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 24px;
  padding: 24px;
  text-align: left;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translate(-50%, -45%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%);
    opacity: 1;
  }
}

.modal-header {
  margin-bottom: 20px;
  text-align: center;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.order-status {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 10px;
}

.status-pending {
  color: #856404;
  background: #fff3cd;
}

.status-completed {
  color: #004085;
  background: #cce5ff;
}

.status-processing {
  color: #0c5460;
  background: #d1ecf1;
}

.status-success {
  color: #155724;
  background: #d4edda;
}

.status-failed {
  color: #721c24;
  background: #f8d7da;
}

.status-aftersale {
  color: #383d41;
  background: #e2e3e5;
}

.modal-body {
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 10px 0;
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

.progress-bar {
  width: 100%;
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
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

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-btn:active {
  transform: scale(0.97);
}

.modal-btn-secondary {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e8ecef;
}

.modal-btn-secondary:hover {
  background: #e9ecef;
}

.modal-btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25);
}

.modal-btn-primary:active {
  box-shadow: 0 2px 12px rgba(99, 102, 241, 0.3);
}

.modal-btn-primary:hover {
  opacity: 0.92;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
}

@media (max-width: 480px) {
  .modal-content {
    width: 92%;
    padding: 20px;
    border-radius: 20px;
  }

  .modal-title {
    font-size: 16px;
  }

  .detail-row {
    font-size: 13px;
    padding: 8px 0;
  }

  .modal-btn {
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>
