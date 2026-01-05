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
            <div class="face-value">{{ amount.face  * zk }}元</div>
            <div class="real-price">{{ amount.face }}元</div>
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
import { ref, computed, onMounted } from 'vue'

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
const configData = ref({
  fastDiscount: 0.92,
  slowDiscount: 0.92
})

const zk = computed(() => {
  return currentType.value === 'fast' ? configData.value.fastDiscount : configData.value.slowDiscount
})

const provinceNameMap = {
  beijing: '北京市',
  tianjin: '天津市',
  hebei: '河北省',
  shanxi: '山西省',
  neimenggu: '内蒙古自治区',
  liaoning: '辽宁省',
  jilin: '吉林省',
  heilongjiang: '黑龙江省',
  shanghai: '上海市',
  jiangsu: '江苏省',
  zhejiang: '浙江省',
  anhui: '安徽省',
  fujian: '福建省',
  jiangxi: '江西省',
  shandong: '山东省',
  henan: '河南省',
  hubei: '湖北省',
  hunan: '湖南省',
  guangdong: '广东省',
  guangxi: '广西壮族自治区',
  hainan: '海南省',
  chongqing: '重庆市',
  sichuan: '四川省',
  guizhou: '贵州省',
  yunnan: '云南省',
  xizang: '西藏自治区',
  shaanxi: '陕西省',
  gansu: '甘肃省',
  qinghai: '青海省',
  ningxia: '宁夏回族自治区',
  xinjiang: '新疆维吾尔自治区'
};

const cityData = {
  beijing: ['北京市'],
  tianjin: ['天津市'],
  hebei: ['保定市', '唐山市', '廊坊市', '张家口市', '承德市', '沧州市', '省直辖县级行政区划', '石家庄市', '秦皇岛市', '衡水市', '邢台市', '邯郸市'],
  shanxi: ['临汾市', '吕梁市', '大同市', '太原市', '忻州市', '晋中市', '晋城市', '朔州市', '运城市', '长治市', '阳泉市'],
  neimenggu: ['乌兰察布市', '乌海市', '兴安盟', '包头市', '呼伦贝尔市', '呼和浩特市', '巴彦淖尔市', '赤峰市', '通辽市', '鄂尔多斯市', '锡林郭勒盟', '阿拉善盟'],
  liaoning: ['丹东市', '大连市', '抚顺市', '朝阳市', '本溪市', '沈阳市', '盘锦市', '营口市', '葫芦岛市', '辽阳市', '铁岭市', '锦州市', '阜新市', '鞍山市'],
  jilin: ['吉林市', '四平市', '延边朝鲜族自治州', '松原市', '白城市', '白山市', '辽源市', '通化市', '长春市'],
  heilongjiang: ['七台河市', '伊春市', '佳木斯市', '双鸭山市', '哈尔滨市', '大兴安岭地区', '大庆市', '牡丹江市', '绥化市', '鸡西市', '鹤岗市', '黑河市', '齐齐哈尔市'],
  shanghai: ['上海市'],
  jiangsu: ['南京市', '南通市', '宿迁市', '常州市', '徐州市', '扬州市', '无锡市', '泰州市', '淮安市', '盐城市', '苏州市', '连云港市', '镇江市'],
  zhejiang: ['丽水市', '台州市', '嘉兴市', '宁波市', '杭州市', '温州市', '湖州市', '绍兴市', '舟山市', '衢州市', '金华市'],
  anhui: ['亳州市', '六安市', '合肥市', '安庆市', '宣城市', '宿州市', '池州市', '淮北市', '淮南市', '滁州市', '芜湖市', '蚌埠市', '铜陵市', '阜阳市', '马鞍山市', '黄山市'],
  fujian: ['三明市', '南平市', '厦门市', '宁德市', '泉州市', '漳州市', '福州市', '莆田市', '龙岩市'],
  jiangxi: ['上饶市', '九江市', '南昌市', '吉安市', '宜春市', '抚州市', '新余市', '景德镇市', '萍乡市', '赣州市', '鹰潭市'],
  shandong: ['东营市', '临沂市', '威海市', '德州市', '日照市', '枣庄市', '泰安市', '济南市', '济宁市', '淄博市', '滨州市', '潍坊市', '烟台市', '聊城市', '莱芜市', '菏泽市', '青岛市'],
  henan: ['三门峡市', '信阳市', '南阳市', '周口市', '商丘市', '安阳市', '平顶山市', '开封市', '新乡市', '洛阳市', '漯河市', '濮阳市', '焦作市', '省直辖县级行政区划', '许昌市', '郑州市', '驻马店市', '鹤壁市'],
  hubei: ['十堰市', '咸宁市', '孝感市', '宜昌市', '恩施土家族苗族自治州', '武汉市', '省直辖县级行政区划', '荆州市', '荆门市', '襄阳市', '鄂州市', '随州市', '黄冈市', '黄石市'],
  hunan: ['娄底市', '岳阳市', '常德市', '张家界市', '怀化市', '株洲市', '永州市', '湘潭市', '湘西土家族苗族自治州', '益阳市', '衡阳市', '邵阳市', '郴州市', '长沙市'],
  guangdong: ['东莞市', '中山市', '云浮市', '佛山市', '广州市', '惠州市', '揭阳市', '梅州市', '汕头市', '汕尾市', '江门市', '河源市', '深圳市', '清远市', '湛江市', '潮州市', '珠海市', '肇庆市', '茂名市', '阳江市', '韶关市'],
  guangxi: ['北海市', '南宁市', '崇左市', '来宾市', '柳州市', '桂林市', '梧州市', '河池市', '玉林市', '百色市', '贵港市', '贺州市', '钦州市', '防城港市'],
  hainan: ['三亚市', '三沙市', '儋州市', '海口市', '省直辖县级行政区划'],
  chongqing: ['重庆市'],
  sichuan: ['乐山市', '内江市', '凉山彝族自治州', '南充市', '宜宾市', '巴中市', '广元市', '广安市', '德阳市', '成都市', '攀枝花市', '泸州市', '甘孜藏族自治州', '眉山市', '绵阳市', '自贡市', '资阳市', '达州市', '遂宁市', '阿坝藏族羌族自治州', '雅安市'],
  guizhou: ['六盘水市', '安顺市', '毕节市', '贵阳市', '遵义市', '铜仁市', '黔东南苗族侗族自治州', '黔南布依族苗族自治州', '黔西南布依族苗族自治州'],
  yunnan: ['临沧市', '丽江市', '保山市', '大理白族自治州', '德宏傣族景颇族自治州', '怒江傈僳族自治州', '文山壮族苗族自治州', '昆明市', '昭通市', '普洱市', '曲靖市', '楚雄彝族自治州', '玉溪市', '红河哈尼族彝族自治州', '西双版纳傣族自治州', '迪庆藏族自治州'],
  xizang: ['山南市', '拉萨市', '日喀则市', '昌都市', '林芝市', '那曲地区', '阿里地区'],
  shaanxi: ['咸阳市', '商洛市', '安康市', '宝鸡市', '延安市', '榆林市', '汉中市', '渭南市', '西安市', '铜川市'],
  gansu: ['临夏回族自治州', '兰州市', '嘉峪关市', '天水市', '定西市', '平凉市', '庆阳市', '张掖市', '武威市', '甘南藏族自治州', '白银市', '酒泉市', '金昌市', '陇南市'],
  qinghai: ['果洛藏族自治州', '海东市', '海北藏族自治州', '海南藏族自治州', '海西蒙古族藏族自治州', '玉树藏族自治州', '西宁市', '黄南藏族自治州'],
  ningxia: ['中卫市', '吴忠市', '固原市', '石嘴山市', '银川市'],
  xinjiang: ['乌鲁木齐市', '伊犁哈萨克自治州', '克孜勒苏柯尔克孜自治州', '克拉玛依市', '博尔塔拉蒙古自治州', '吐鲁番市', '和田地区', '哈密市', '喀什地区', '塔城地区', '巴音郭楞蒙古自治州', '昌吉回族自治州', '自治区直辖县级行政区划', '阿克苏地区', '阿勒泰地区']
}

const config = {

  fast: {
    name: '电费快充',
    amounts: [
      { face: 100, price: 100 },
      { face: 200, price: 200 },
      { face: 300, price: 300 },
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
const zkText = computed(() => `${(zk.value * 100).toFixed(0)} 折`)
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

const loadConfig = async () => {
  try {
    const response = await fetch('/api/config')
    const config = await response.json()
    if (config) {
      configData.value = {
        fastDiscount: config.fastDiscount || 0.92,
        slowDiscount: config.slowDiscount || 0.92
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

onMounted(() => {
  loadConfig()
})

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
    province: provinceNameMap[formData.value.province] || formData.value.province,
    faceAmount: selectedAmount.value.face,
    payAmount: selectedAmount.value.price * zk.value
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
