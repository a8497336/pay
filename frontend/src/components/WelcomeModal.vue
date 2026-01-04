<template>
  <div class="modal" v-if="visible" @click="handleOutsideClick">
    <div class="modal-content" @click.stop>
      <div class="modal-icon">⚡</div>
      <div class="modal-header">
        <h3 class="modal-title">欢迎使用电费充值中心</h3>
      </div>
      <div class="modal-body">
        <p class="important-tip"><strong>重要提示：</strong>为了保障您的资金安全，请仔细阅读以下条款：</p>
        <ul>
          <li>✓ 本平台电费充值到账时间为<strong>0-96小时</strong>，请提前充值</li>
          <li>✓ 慢充折扣力度大，但请避开月初月末高峰期</li>
          <li>✓ <strong>禁止</strong>：欠费停电户、多户号批量充值</li>
          <li>✓ 充值成功后请保存好订单号以便查询</li>
          <li>✓ <strong style="color: #ff6b6b;">警惕诈骗：</strong>平台客服不会主动索要您的验证码或密码</li>
        </ul>
      </div>
      <div class="modal-footer">
        <button class="modal-btn modal-btn-primary" @click="handleClose">我已阅读并同意</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'close'])

const handleClose = () => {
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
  font-size: 56px;
  margin-bottom: 20px;
}

.modal-header {
  margin-bottom: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.modal-body {
  text-align: left;
  margin-bottom: 24px;
}

.important-tip {
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.modal-body ul {
  list-style: none;
  padding: 0;
}

.modal-body li {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.8;
  padding-left: 8px;
}

.modal-body li::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25);
}

.modal-btn-primary:active {
  transform: scale(0.97);
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
    font-size: 48px;
    margin-bottom: 16px;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-body {
    margin-bottom: 20px;
  }

  .modal-body li {
    font-size: 13px;
    margin-bottom: 10px;
    line-height: 1.7;
  }

  .modal-btn {
    padding: 14px 20px;
    font-size: 15px;
  }
}
</style>
