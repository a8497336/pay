<template>
  <div class="modal" v-if="visible" @click="handleOutsideClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">扫码支付</h3>
        <p class="order-info">订单号：{{ orderNumber }}</p>
        <p class="pay-amount">¥{{ payAmount }}</p>
      </div>
      <div class="qr-code-container">
        <div class="qr-code-wrapper">
          <canvas ref="qrCanvas" v-show="!qrCodeImage"></canvas>
          <img ref="qrImage" v-show="qrCodeImage" :src="qrCodeImage" alt="支付二维码" class="qr-code-img" />
        </div>
        <p class="qr-tip">长按识别二维码支付或扫码支付</p>
        <p class="qr-status" v-if="lastStatus">当前状态：{{ getStatusText(lastStatus) }}</p>
      </div>
      <div class="modal-footer">
        <button class="modal-btn modal-btn-primary" @click="handleClose">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import QRCode from 'qrcode'
import { paymentApi } from '@/api'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  qrCode: {
    type: String,
    default: ''
  },
  orderNumber: {
    type: String,
    default: ''
  },
  payAmount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:visible', 'close', 'paymentSuccess'])

const qrCanvas = ref(null)
const qrImage = ref(null)
const qrCodeImage = ref('')
const lastStatus = ref('')
let pollingTimer = null

const generateQRCode = async () => {
  if (props.qrCode && qrCanvas.value) {
    try {
      await QRCode.toCanvas(qrCanvas.value, props.qrCode, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      
      qrCodeImage.value = qrCanvas.value.toDataURL('image/png')
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }
}

const getStatusText = (status) => {
  const statusMap = {
    'SUCCESS': '支付成功',
    'NOTPAY': '等待支付',
    'USERPAYING': '用户支付中',
    'PAYERROR': '支付失败',
    'CLOSED': '订单已关闭',
    'REFUND': '已退款',
    'PENDING': '处理中'
  }
  return statusMap[status] || status
}

const startPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
  }
  
  console.log('Starting polling for order:', props.orderNumber)
  
  pollingTimer = setInterval(async () => {
    try {
      const result = await paymentApi.queryPaymentStatus(props.orderNumber)
      console.log('Payment status:', result)
      
      if (result.success) {
        lastStatus.value = result.tradeStatus
        
        if (result.tradeStatus === 'SUCCESS') {
          console.log('Payment successful!')
          stopPolling()
          emit('paymentSuccess', {
            orderNumber: props.orderNumber,
            tradeNo: result.tradeNo,
            payTime: result.payTime
          })
        }
      }
    } catch (error) {
      console.error('Error polling payment status:', error)
    }
  }, 3000)
}

const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      generateQRCode()
      startPolling()
    })
  } else {
    stopPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})

const handleClose = () => {
  stopPolling()
  emit('update:visible', false)
  emit('close')
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
  margin-bottom: 8px;
}

.order-info {
  font-size: 14px;
  color: #666;
  margin: 8px 0;
  line-height: 1.6;
}

.pay-amount {
  font-size: 28px;
  font-weight: 700;
  color: #ff6b6b;
  margin: 12px 0;
}

.qr-code-container {
  margin-bottom: 24px;
}

.qr-code-wrapper {
  display: inline-block;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.qr-code-wrapper canvas {
  display: block;
}

.qr-code-img {
  display: block;
  width: 200px;
  height: 200px;
}

.qr-tip {
  margin-top: 16px;
  font-size: 14px;
  color: red;
}

.qr-status {
  margin-top: 8px;
  font-size: 13px;
  color: #6366f1;
  font-weight: 500;
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
    padding: 24px;
    border-radius: 20px;
  }

  .modal-title {
    font-size: 16px;
  }

  .pay-amount {
    font-size: 24px;
  }

  .qr-code-wrapper {
    padding: 12px;
  }

  .modal-btn {
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>
