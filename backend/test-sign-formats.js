import crypto from 'crypto'

const liantuofuConfig = {
  merchantCode: 'EW_N0474913099',
  appId: 'EW_N9173468315',
  key: 'c1d7cf2a55ab1a790a1fca970749fa33'
}

function generateSign(params) {
  const validParams = {}
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      if (key !== 'sign' && key !== 'imgData') {
        validParams[key] = params[key]
      }
    }
  })
  
  const sortedKeys = Object.keys(validParams).sort()
  let signStr = ''
  sortedKeys.forEach(key => {
    signStr += `${key}=${validParams[key]}&`
  })
  
  signStr += `key=${liantuofuConfig.key}`
  
  const md5Sign = crypto.createHash('md5').update(signStr, 'utf8').digest('hex').toLowerCase()
  return md5Sign
}

console.log('=== 测试不同格式的签名生成 ===\n')

const testData = {
  merchantCode: 'EW_N0474913099',
  appId: 'EW_N9173468315',
  outTradeNo: 'D1767413134092GCLA',
  totalAmount: '0.01',
  expireSeconds: '300',
  goodsDetail: '[{"goodsId":"electric_recharge","goodsName":"电费充值","price":0.01,"quantity":1}]',
  random: '50606737'
}

console.log('测试数据:', JSON.stringify(testData, null, 2))
console.log('\n方式1: 直接使用对象生成签名')
const sign1 = generateSign(testData)
console.log('签名1:', sign1)

console.log('\n方式2: 模拟 URLSearchParams 格式')
const formData = new URLSearchParams()
Object.keys(testData).forEach(key => {
  formData.append(key, testData[key])
})
console.log('FormData 字符串:', formData.toString())

const sign2 = generateSign(testData)
console.log('签名2:', sign2)

console.log('\n方式3: 测试不同的 goodsDetail 格式')
const testData3 = {
  ...testData,
  goodsDetail: JSON.stringify([{
    goodsId: 'electric_recharge',
    goodsName: '电费充值',
    price: 0.01,
    quantity: 1
  }])
}
const sign3 = generateSign(testData3)
console.log('签名3:', sign3)

console.log('\n=== 测试回调数据签名 ===\n')

const notifyData = {
  merchantCode: 'EW_N0474913099',
  appId: 'EW_N9173468315',
  outTradeNo: 'D1767413134092GCLA',
  transactionId: 'LT' + Date.now(),
  totalAmount: '0.01',
  tradeStatus: 'SUCCESS',
  channel: 'WXPAY',
  payTime: new Date().toISOString()
}

console.log('回调数据:', JSON.stringify(notifyData, null, 2))
const notifySign = generateSign(notifyData)
console.log('回调签名:', notifySign)
