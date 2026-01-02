<template>
  <div class="modal" v-if="visible" @click="handleOutsideClick">
    <div class="modal-content" @click.stop>
      <div class="modal-icon">✅</div>
      <h3 class="modal-title">订单提交成功！</h3>
      <div class="modal-body">
        <p><strong>订单号：</strong><span class="order-number">{{ order?.orderNumber }}</span></p>
        <p>充值金额：{{ order?.faceAmount }}元</p>
        <p>实付金额：{{ order?.payAmount }}元</p>
        <p class="important-tip"><strong>预计76小时内到账，请耐心等待</strong></p>
        <p class="tip-text">温馨提示：您可通过"订单查询"查看充值进度</p>
      </div>
      <div class="modal-footer">
        <button 
          v-if="isMockPayment" 
          class="modal-btn modal-btn-secondary" 
          @click="handleMockComplete"
        >
          模拟支付完成
        </button>
        <button class="modal-btn modal-btn-primary" @click="handleClose">知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { paymentApi } from '@/api'

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

const emit = defineEmits(['update:visible', 'close', 'mockComplete'])

const isMockPayment = computed(() => {
  return props.order?.tradeNo?.startsWith('MOCK_')
})

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleOutsideClick = () => {
  handleClose()
}

const handleMockComplete = async () => {
  try {
    const response = await paymentApi.mockCompletePayment({
      orderNumber: props.order.orderNumber
    })

    if (response.success) {
      alert('模拟支付成功！')
      emit('mockComplete', props.order)
      handleClose()
    } else {
      alert(`模拟支付失败：${response.message}`)
    }
  } catch (error) {
    console.error('Mock complete payment error:', error)
    alert('模拟支付失败，请稍后重试')
  }
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
  padding: 32px;
  text-align: center;
  width: 90%;
  max-width: 380px;
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

.modal-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
}

.modal-body {
  text-align: left;
  margin-bottom: 24px;
}

.modal-body p {
  font-size: 15px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.6;
}

.modal-body strong {
  color: #333;
  font-weight: 600;
}

.order-number {
  color: #6366f1;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  letter-spacing: 0.5px;
}

.important-tip {
  color: #ff6b6b;
  font-size: 16px;
  margin-top: 16px;
  padding: 12px;
  background: #fff3cd;
  border-radius: 8px;
  border-left: 4px solid #faad14;
}

.tip-text {
  font-size: 13px;
  color: #999;
  margin-top: 16px;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  flex: 1;
  padding: 16px 32px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
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
    padding: 24px;
    border-radius: 20px;
  }

  .modal-icon {
    font-size: 56px;
    margin-bottom: 16px;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-body p {
    font-size: 14px;
  }

  .modal-btn {
    padding: 14px 24px;
    font-size: 15px;
  }
}
</style>
