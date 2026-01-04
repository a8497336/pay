<template>
  <div class="recharge-form">
    <div class="recharge-type">
            <button
        class="type-btn"
        :class="{ active: currentType === 'fast' }"
        @click="switchType('fast')"
      >
        <div>电费快充</div>
        <!-- <div class="discount">实时到账</div> -->
      </button>
      <button
        class="type-btn"
        :class="{ active: currentType === 'slow' }"
        @click="switchType('slow')"
      >
        <div>电费慢充</div>
        <!-- <div class="discount">限时8折</div> -->
      </button>

    </div>

    <div class="form-area">
      <div class="form-group">
        <label class="form-label">供电区域 <span class="required">*</span></label>
        <div class="region-select">
          <select v-model="formData.province" @change="handleProvinceChange">
            <option value="">请选择省份</option>
            <option value="beijing">北京市</option>
            <option value="tianjin">天津市</option>
            <option value="hebei">河北省</option>
            <option value="shanxi">山西省</option>
            <option value="neimenggu">内蒙古自治区</option>
            <option value="liaoning">辽宁省</option>
            <option value="jilin">吉林省</option>
            <option value="heilongjiang">黑龙江省</option>
            <option value="shanghai">上海市</option>
            <option value="jiangsu">江苏省</option>
            <option value="zhejiang">浙江省</option>
            <option value="anhui">安徽省</option>
            <option value="fujian">福建省</option>
            <option value="jiangxi">江西省</option>
            <option value="shandong">山东省</option>
            <option value="henan">河南省</option>
            <option value="hubei">湖北省</option>
            <option value="hunan">湖南省</option>
            <option value="guangdong">广东省</option>
            <option value="guangxi">广西壮族自治区</option>
            <option value="hainan">海南省</option>
            <option value="chongqing">重庆市</option>
            <option value="sichuan">四川省</option>
            <option value="guizhou">贵州省</option>
            <option value="yunnan">云南省</option>
            <option value="xizang">西藏自治区</option>
            <option value="shaanxi">陕西省</option>
            <option value="gansu">甘肃省</option>
            <option value="qinghai">青海省</option>
            <option value="ningxia">宁夏回族自治区</option>
            <option value="xinjiang">新疆维吾尔自治区</option>
          </select>
          <select v-model="formData.city">
            <option value="">请选择城市</option>
            <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">用电户号 <span class="required">*</span></label>
        <input
          type="text"
          class="form-input"
          v-model="formData.accountNumber"
          placeholder="请输入13位用电户号"
          maxlength="13"
          @input="handleAccountInput"
        />
        <div class="account-tip" :class="accountTipClass">{{ accountTip }}</div>
      </div>


      <div class="form-group">
        <label class="form-label">充值金额 <span class="required">*</span></label>
        <div class="amount-grid">
          <div
            v-for="amount in amounts"
            :key="amount.face"
            class="amount-card"
            :class="{ selected: selectedAmount?.face === amount.face }"
            @click="selectAmount(amount)"
          >
            <div class="face-value">{{ amount.face }}元</div>
            <div class="real-price">{{ zkText }}</div>
          </div>
        </div>
      </div>
      <button
        class="submit-btn"
        :disabled="!isFormValid"
        @click="handleSubmit"
      >
        {{ submitButtonText }}
      </button>
      <!-- <div class="fee-detail" v-if="selectedAmount">
        <div class="fee-row">
          <span>充值面额</span>
          <span>{{ selectedAmount.face }}元</span>
        </div>
        <div class="fee-row">
          <span>优惠金额</span>
          <span class="discount">-{{ selectedAmount.face - selectedAmount.price }}元</span>
        </div>
        <div class="fee-row total">
          <span>实付金额</span>
          <span class="pay-amount">¥{{ selectedAmount.price }}</span>
        </div>
      </div> -->

      <div class="risk-tips">
        <h3>⚠️ 充值须知</h3>
        <ul>
          <li>• 快充0-48小时 慢充0-96小时 月初月末可能延迟</li>
          <li>• 充值后不要在任何渠道进行缴费（包括官方渠道）</li>
          <!-- <li>• 仅支持居民生活用电，不支持商业用电</li> -->
          <li>• 所有产品售后期7天，超时反馈不予售后</li>
          <li>• 部分渠道订单会有延迟到账的情况，所有产品售后期7天，以订单完成时间起计算，请及时构核实到账情况，超时反馈不予售后!</li>
          <li>• 查询方式：下载网上国网APP 进入界面点击居民或者企业下方蓝色卡片绑定户号下方有缴费查询可以看到账情况</li>
        </ul>
      </div>

      <div class="fraud-warning">
        <h4>🚨 防诈骗警告</h4>
        <p>平台不会以任何理由联系您转账！警惕冒充客服的诈骗电话！如有疑问请联系官方客服。如有陌生人联系您以多充、错充等理由引导点击链接或转账，一律拉黑处理！</p>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['submit'])
const currentType = ref('fast')
const formData = ref({
  province: '',
  city: '',
  accountNumber: '',
})
const selectedAmount = ref(null)
const accountTip = ref('')
const accountTipClass = ref('')
const zk = 0.92;
const cityData = {
  beijing: ['北京市'],
  shanghai: ['上海市'],
  tianjin: ['天津市'],
  chongqing: ['重庆市'],
  guangdong: ['广州市', '深圳市', '东莞市', '佛山市', '中山市', '珠海市', '惠州市', '江门市', '汕头市', '湛江市', '肇庆市', '河源市', '清远市', '潮州市', '揭阳市', '云浮市', '韶关市', '梅州市', '汕尾市', '阳江市', '茂名市'],
  jiangsu: ['南京市', '苏州市', '无锡市', '常州市', '南通市', '徐州市', '扬州市', '盐城市', '镇江市', '泰州市', '连云港市', '宿迁市', '淮安市'],
  zhejiang: ['杭州市', '宁波市', '温州市', '嘉兴市', '绍兴市', '金华市', '台州市', '湖州市', '衢州市', '丽水市', '舟山市'],
  shandong: ['济南市', '青岛市', '烟台市', '潍坊市', '临沂市', '淄博市', '济宁市', '泰安市', '威海市', '德州市', '枣庄市', '日照市', '莱芜市', '聊城市', '滨州市', '菏泽市', '东营市'],
  sichuan: ['成都市', '绵阳市', '德阳市', '宜宾市', '南充市', '泸州市', '达州市', '乐山市', '广安市', '自贡市', '攀枝花市', '遂宁市', '内江市', '眉山市', '广元市', '雅安市', '巴中市', '资阳市', '阿坝藏族羌族自治州', '甘孜藏族自治州', '凉山彝族自治州'],
  hubei: ['武汉市', '宜昌市', '襄阳市', '荆州市', '黄冈市', '十堰市', '孝感市', '黄石市', '咸宁市', '鄂州市', '荆门市', '随州市', '恩施土家族苗族自治州', '仙桃市', '潜江市', '天门市', '神农架林区'],
  hunan: ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '湘西土家族苗族自治州'],
  henan: ['郑州市', '洛阳市', '南阳市', '新乡市', '安阳市', '焦作市', '商丘市', '信阳市', '周口市', '驻马店市', '濮阳市', '许昌市', '漯河市', '三门峡市', '鹤壁市', '济源市', '开封市', '平顶山市'],
  fujian: ['福州市', '厦门市', '泉州市', '漳州市', '莆田市', '龙岩市', '三明市', '南平市', '宁德市'],
  anhui: ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '宿州市', '阜阳市', '宣城市', '六安市', '池州市', '亳州市'],
  hebei: ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'],
  shanxi: ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'],
  shaanxi: ['西安市', '宝鸡市', '咸阳市', '铜川市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'],
  liaoning: ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'],
  jilin: ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延边朝鲜族自治州'],
  heilongjiang: ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市', '大兴安岭地区'],
  jiangxi: ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'],
  guangxi: ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市'],
  yunnan: ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '楚雄彝族自治州', '大理白族自治州', '红河哈尼族彝族自治州', '文山壮族苗族自治州', '西双版纳傣族自治州', '德宏傣族景颇族自治州', '怒江傈僳族自治州', '迪庆藏族自治州'],
  guizhou: ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '黔西南布依族苗族自治州', '黔东南苗族侗族自治州', '黔南布依族苗族自治州'],
  gansu: ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市', '临夏回族自治州', '甘南藏族自治州'],
  qinghai: ['西宁市', '海东市', '海北藏族自治州', '黄南藏族自治州', '海南藏族自治州', '果洛藏族自治州', '玉树藏族自治州', '海西蒙古族藏族自治州'],
  neimenggu: ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '兴安盟', '锡林郭勒盟', '阿拉善盟'],
  xinjiang: ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉回族自治州', '博尔塔拉蒙古自治州', '巴音郭楞蒙古自治州', '阿克苏地区', '克孜勒苏柯尔克孜自治州', '喀什地区', '和田地区', '伊犁哈萨克自治州', '塔城地区', '阿勒泰地区'],
  ningxia: ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
  hainan: ['海口市', '三亚市', '三沙市', '儋州市', '五指山市', '琼海市', '文昌市', '万宁市', '东方市'],
  xizang: ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市', '阿里地区']
}

const config = {

  fast: {
    name: '电费快充',
    amounts: [
      { face: 0.01, price: 0.01 },
      { face: 0.02, price: 0.02 },
      { face: 0.03, price: 0.03 },
       { face: 400, price: 400 },
      { face: 500, price: 500 },
      { face: 1000, price: 1000 }
    ]
  },
  slow: {
    name: '电费慢充',
    amounts: [
      { face: 1000, price: 1000 },
      { face: 2000, price: 2000 },
      { face: 3000, price: 3000 },
        { face: 4000, price: 4000 },
      { face: 5000, price: 5000 },
      { face: 10000, price: 10000 }
    ]
  },
}

const amounts = computed(() => config[currentType.value].amounts)
const zkText = computed(() => `${zk * 100 } 折`)
const cities = computed(() => {
  return cityData[formData.value.province] || []
})

const isFormValid = computed(() => {
  return formData.value.province &&
         formData.value.city &&
         formData.value.accountNumber.length >= 10 &&
         selectedAmount.value &&
         accountTipClass.value !== 'error'
})

const submitButtonText = computed(() => {
  if (selectedAmount.value) {
    return `确认充值 ¥${selectedAmount.value.price}`
  }
  return '请先完成信息填写'
})

const switchType = (type) => {
  currentType.value = type
  selectedAmount.value = null
}

const handleProvinceChange = () => {
  formData.value.city = ''
}

const handleAccountInput = (e) => {
  const value = e.target.value.replace(/\D/g, '')
  formData.value.accountNumber = value

  if (value.length === 0) {
    accountTip.value = ''
    accountTipClass.value = ''
  } else if (value.length < 13) {
    accountTip.value = '户号应为13位数字'
    accountTipClass.value = 'error'
  } else {
    accountTip.value = '✓ 户号验证通过'
    accountTipClass.value = 'success'
  }
}

const selectAmount = (amount) => {
  selectedAmount.value = amount
}

const handleSubmit = () => {
  if (!isFormValid.value) return

  emit('submit', {
    type: currentType.value,
    typeName: config[currentType.value].name,
    ...formData.value,
    faceAmount: selectedAmount.value.face,
    payAmount: selectedAmount.value.price * zk
  })
}
</script>

<style scoped>
.recharge-form {
  background: #fff;
}

.recharge-type {
  display: flex;
  padding: 12px;
  background: #f5f7fa;
  gap: 10px;
}

.type-btn {
  flex: 1;
  padding: 14px 12px;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.type-btn:active {
  transform: scale(0.97);
}

.type-btn.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.discount {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.85;
}

.form-area {
  padding: 24px 20px;
  background: white;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.required {
  color: #ff6b6b;
  margin-left: 2px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e8ecef;
  border-radius: 14px;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafafa;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder {
  color: #adb5bd;
}

.region-select {
  display: flex;
  gap: 10px;
}

.region-select select {
  flex: 1;
  padding: 14px 16px;
  border: 2px solid #e8ecef;
  border-radius: 14px;
  font-size: 15px;
  background: #fafafa;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.region-select select:focus {
  outline: none;
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.account-tip {
  font-size: 12px;
  margin-top: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f8f9fa;
}

.account-tip.error {
  color: #ff6b6b;
  background: #fee2e2;
}

.account-tip.success {
  color: #52c41a;
  background: #d4edda;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.amount-card {
  padding: 10px 12px;
  border: 2px solid #e8ecef;
  border-radius: 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafafa;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.amount-card:active {
  transform: scale(0.97);
}

.amount-card.selected {
  border-color: #6366f1;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.face-value {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.real-price {
  font-size: 12px;
  opacity: 0.9;
}

.fee-detail {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f4fd 100%);
  padding: 16px;
  border-radius: 12px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.fee-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 10px;
  padding: 0 4px;
}

.fee-row.total {
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 16px;
  font-weight: 600;
}

.discount {
  color: #52c41a;
  font-weight: 500;
}

.pay-amount {
  color: #ff6b6b;
  font-weight: 600;
}

.risk-tips {
  background: #fff3cd;
  padding: 16px;
  border-radius: 12px;
  margin: 20px 0;
  border-left: 4px solid #faad14;
}

.risk-tips h3 {
  font-size: 14px;
  margin-bottom: 12px;
  color: #856404;
  font-weight: 600;
}

.risk-tips ul {
  list-style: none;
  padding: 0;
}

.risk-tips li {
  font-size: 13px;
  color: #856404;
  margin-bottom: 8px;
  line-height: 1.6;
}

.fraud-warning {
  background: #f8d7da;
  padding: 16px;
  border-radius: 12px;
  margin: 20px 0;
  border-left: 4px solid #ff6b6b;
}

.fraud-warning h4 {
  font-size: 14px;
  margin-bottom: 10px;
  color: #721c24;
  font-weight: 600;
}

.fraud-warning p {
  font-size: 13px;
  color: #721c24;
  line-height: 1.6;
}

.submit-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 24px 0;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.92;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

@media (max-width: 480px) {
  .recharge-type {
    padding: 10px;
    gap: 8px;
  }

  .type-btn {
    padding: 12px 10px;
    font-size: 14px;
  }

  .form-area {
    padding: 20px 16px;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .form-input {
    padding: 12px 14px;
    font-size: 15px;
  }

  .region-select select {
    padding: 12px 14px;
    font-size: 14px;
  }

  .amount-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .amount-card {
    padding: 14px 10px;
  }

  .face-value {
    font-size: 16px;
  }

  .submit-btn {
    padding: 16px;
    font-size: 16px;
  }
}

@media (min-width: 768px) {
  .recharge-form {
    max-width: 500px;
    margin: 0 auto;
  }
}
</style>
