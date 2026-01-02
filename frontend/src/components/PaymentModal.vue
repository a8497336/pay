<template>
  <div class="modal" v-if="visible" @click="handleOutsideClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">选择支付方式</h3>
        <p class="order-info">订单信息：充值{{ orderData?.faceAmount }}元，实付<span class="pay-amount">¥{{ orderData?.payAmount }}</span>元</p>
      </div>
      <div class="payment-methods">
        <div
          class="payment-method"
          :class="{ selected: selectedPayment === 'wechat' }"
          @click="selectPayment('wechat')"
        >
          <div class="payment-icon">💚</div>
          <div class="payment-name">微信支付</div>
        </div>
        <!-- <div
          class="payment-method"
          :class="{ selected: selectedPayment === 'alipay' }"
          @click="selectPayment('alipay')"
        >
          <div class="payment-icon">💙</div>
          <div class="payment-name">支付宝</div>
        </div> -->
        <!-- <div
          class="payment-method"
          :class="{ selected: selectedPayment === 'card' }"
          @click="selectPayment('card')"
        >
          <div class="payment-icon">💳</div>
          <div class="payment-name">银行卡</div>
        </div> -->
      </div>
      <div class="agreement">
        <label>
          <!-- <input  type="checkbox" v-model="agreeTerms" /> -->
          我已阅读并同意《用户服务协议》和《隐私政策》
        </label>
      </div>
      <div class="modal-footer">
        <button class="modal-btn modal-btn-secondary" @click="handleCancel">取消</button>
        <button
          class="modal-btn modal-btn-primary"
          :disabled="!canConfirm"
          @click="handleConfirm"
        >
          {{ processing ? '支付处理中...' : '确认支付' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  orderData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const selectedPayment = ref('wechat')
const agreeTerms = ref(true)
const processing = ref(false)

const canConfirm = computed(() => {
  return selectedPayment.value && agreeTerms.value && !processing.value
})

const selectPayment = (type) => {
  selectedPayment.value = type
}

const handleCancel = () => {
  selectedPayment.value = null
  agreeTerms.value = false
  emit('update:visible', false)
}

const handleConfirm = () => {
  if (!canConfirm.value) return

  processing.value = true
  emit('confirm', {
    paymentMethod: selectedPayment.value
  })
}

const handleOutsideClick = () => {
  if (!processing.value) {
    handleCancel()
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
  padding: 28px;
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

.modal-header {
  margin-bottom: 24px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.order-info {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
  line-height: 1.6;
}

.pay-amount {
  color: #ff6b6b;
  font-weight: 600;
  font-size: 16px;
}

.payment-methods {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.payment-method {
  flex: 1;
  padding: 20px 16px;
  border: 2px solid #e8ecef;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafafa;
}

.payment-method:active {
  transform: scale(0.97);
}

.payment-method.selected {
  border-color: #6366f1;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25);
}

.payment-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.payment-name {
  font-size: 15px;
  font-weight: 500;
}

.agreement {
  margin-bottom: 20px;
}

.agreement label {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  user-select: none;
}

.agreement input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  cursor: pointer;
  accent-color: #6366f1;
  border: 1px solid red;
}

.modal-footer {
  display: flex;
  gap: 12px;
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

.modal-btn-primary:hover:not(:disabled) {
  opacity: 0.92;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 480px) {
  .modal-content {
    width: 92%;
    padding: 24px;
    border-radius: 20px;
  }

  .payment-methods {
    flex-direction: column;
    gap: 10px;
  }

  .payment-method {
    padding: 16px 12px;
  }

  .payment-icon {
    font-size: 28px;
  }

  .payment-name {
    font-size: 14px;
  }

  .modal-btn {
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>
