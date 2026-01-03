<template>
  <div class="container">
    <div class="header">
      <h1>生活缴费充值中心</h1>
      <p>在这里充值更优惠</p>
    </div>

    <RechargeForm @submit="handleFormSubmit" />

    <div class="bottom-nav">
      <div class="nav-item" @click="showToast('客服功能开发中')">
        <span>客服</span>
      </div>
      <div class="nav-item" @click="goToOrders">
        <span>订单查询</span>
      </div>
      <div class="nav-item" @click="showToast('使用指南')">
        <span>使用指南</span>
      </div>
    </div>

    <WelcomeModal v-model:visible="welcomeVisible" @close="welcomeVisible = false" />
    <PaymentModal v-model:visible="paymentVisible" :order-data="orderData" @confirm="handlePayment" />
    <QRCodeModal v-model:visible="qrCodeVisible" :qr-code="qrCodeData.qrCode" :order-number="qrCodeData.orderNumber" :pay-amount="qrCodeData.payAmount" @close="handleQRCodeClose" @payment-success="handlePaymentSuccess" />
    <SuccessModal v-model:visible="successVisible" :order="createdOrder" />

    <div class="toast" :class="{ show: toastVisible }">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { orderApi, paymentApi } from '@/api'
import RechargeForm from '@/components/RechargeForm.vue'
import WelcomeModal from '@/components/WelcomeModal.vue'
import PaymentModal from '@/components/PaymentModal.vue'
import QRCodeModal from '@/components/QRCodeModal.vue'
import SuccessModal from '@/components/SuccessModal.vue'

const router = useRouter()
const orderStore = useOrderStore()

const welcomeVisible = ref(true)
const paymentVisible = ref(false)
const qrCodeVisible = ref(false)
const successVisible = ref(false)
const toastVisible = ref(false)
const toastMessage = ref('')
const orderData = ref(null)
const createdOrder = ref(null)
const qrCodeData = ref({
  qrCode: '',
  orderNumber: '',
  payAmount: 0
})

const showToast = (message) => {
  toastMessage.value = message
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
  }, 3000)
}

const goToOrders = () => {
  router.push('/orders')
}

const handleFormSubmit = async (formData) => {
  orderData.value = formData
  paymentVisible.value = true
}

const handlePayment = async (paymentResult) => {
  try {
    const uuid = localStorage.getItem('payjhfluuid');
    const paymentData = {
      faceAmount: orderData.value.faceAmount,
      payAmount: orderData.value.payAmount,
      paymentMethod: 'liantuofu',
      orderData: orderData.value,
      uuid: uuid
    }

    const response = await paymentApi.processPayment(paymentData)
    console.log('Payment response:', response)
    if (response.success) {
      if (response.qrCode) {
        qrCodeData.value = {
          qrCode: response.qrCode,
          orderNumber: response.orderNumber,
          payAmount: orderData.value.payAmount
        }
        paymentVisible.value = false
        qrCodeVisible.value = true
      } else if (response.payUrl) {
        qrCodeData.value = {
          qrCode: response.payUrl,
          orderNumber: response.orderNumber,
          payAmount: orderData.value.payAmount
        }
        paymentVisible.value = false
        qrCodeVisible.value = true
      } else {
        createdOrder.value = {
          ...orderData.value,
          orderNumber: response.orderNumber,
          tradeNo: response.tradeNo
        }
        orderStore.addOrder(createdOrder.value)
        paymentVisible.value = false
        successVisible.value = true
      }
    } else {
      alert(`支付失败：${response.message}`)
    }
  } catch (error) {
    console.error('Payment error:', error)
    alert('支付处理失败，请稍后重试')
  }
}

const handleQRCodeClose = () => {
  createdOrder.value = {
    ...orderData.value,
    orderNumber: qrCodeData.value.orderNumber
  }
  orderStore.addOrder(createdOrder.value)
  qrCodeVisible.value = false
  successVisible.value = true
}

const handlePaymentSuccess = (paymentData) => {
  createdOrder.value = {
    ...orderData.value,
    orderNumber: paymentData.orderNumber,
    tradeNo: paymentData.tradeNo,
    finishTime: paymentData.payTime
  }
  orderStore.addOrder(createdOrder.value)
  qrCodeVisible.value = false
  successVisible.value = true
}

const handleWechatJSAPIPayment = (jsapiParams, orderNumber) => {
  console.log('jsapiParams:', jsapiParams)
  const jsApiCall = () => {
    if (typeof WeixinJSBridge !== 'undefined') {
      WeixinJSBridge.invoke(
        'getBrandWCPayRequest',
        jsapiParams,
        function(res) {
          if (res.err_msg === 'get_brand_wcpay_request:ok') {
            alert('支付成功！\n订单号：' + orderNumber)
          } else if (res.err_msg === 'get_brand_wcpay_request:cancel') {
            alert('支付已取消')
          } else {
            alert('支付失败：' + res.err_msg)
          }
        }
      )
    } else {
      alert('请在微信中打开此页面进行支付')
    }
  }

  if (typeof WeixinJSBridge === 'undefined') {
    if (document.addEventListener) {
      document.addEventListener('WeixinJSBridgeReady', jsApiCall, false)
    } else if (document.attachEvent) {
      document.attachEvent('WeixinJSBridgeReady', jsApiCall)
      document.attachEvent('onWeixinJSBridgeReady', jsApiCall)
    }
  } else {
    jsApiCall()
  }
}
</script>

<style scoped>
.container {
  max-width: 420px;
  margin: 0 auto;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
  min-height: 100vh;
  padding-bottom: 80px;
}

.header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 32px 24px;
  text-align: center;
  color: white;
  border-radius: 0 0 24px 24px;
}

.header h1 {
  font-size: 24px;
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.header p {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 300;
}

.bottom-nav {
  display: flex;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding: 12px 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 420px;
  z-index: 100;
}

.nav-item {
  flex: 1;
  text-align: center;
  padding: 12px 8px;
  cursor: pointer;
  color: #666;
  font-size: 16px;
  transition: all 0.3s ease;
  border-radius: 12px;
  margin: 0 4px;
}

.nav-item:active {
  background: rgba(99, 102, 241, 0.1);
  transform: scale(0.95);
}

.nav-item:hover {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 16px 28px;
  border-radius: 16px;
  font-size: 14px;
  z-index: 2000;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  max-width: 80%;
  text-align: center;
  line-height: 1.6;
}

.toast.show {
  opacity: 1;
}

@media (max-width: 480px) {
  .container {
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
  }

  .header {
    border-radius: 0;
    padding: 28px 20px;
  }

  .header h1 {
    font-size: 22px;
  }

  .bottom-nav {
    padding-bottom: env(safe-area-inset-bottom);
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
  }

  .nav-item {
    font-size: 16px;
    padding: 10px 4px;
  }
}

@media (min-width: 768px) {
  .container {
    margin-top: 40px;
    min-height: calc(100vh - 80px);
  }
}
</style>
