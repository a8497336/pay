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
  
  console.log('Sign string:', signStr)
  
  const md5Sign = crypto.createHash('md5').update(signStr, 'utf8').digest('hex').toLowerCase()
  return md5Sign
}

function getRandom() {
  const uuid = crypto.randomUUID().replace(/-/g, '')
  const number = '0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    const str = uuid.substring(i * 4, i * 4 + 4)
    const x = parseInt(str, 16)
    result += number[x % 10]
  }
  return result
}

const testParams = {
  random: getRandom(),
  outTradeNo: 'TEST' + Date.now(),
  totalAmount: '31',
  expireSeconds: '300',
  notifyUrl: 'http://localhost:5000/api/payment/liantuofu/notify',
  goodsDetail: JSON.stringify([{
    goodsId: '6901028936132',
    goodsName: '电费充值',
    price: 31,
    quantity: 1
  }])
}

testParams.merchantCode = liantuofuConfig.merchantCode
testParams.appId = liantuofuConfig.appId
testParams.sign = generateSign(testParams)

console.log('测试参数:', JSON.stringify(testParams, null, 2))
console.log('签名:', testParams.sign)

const formData = new URLSearchParams()
Object.keys(testParams).forEach(key => {
  formData.append(key, testParams[key])
})

fetch('http://api.liantuofu.com/open/jspay', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
  },
  body: formData.toString()
})
.then(res => res.text())
.then(text => {
  console.log('响应内容:', text)
  try {
    const result = JSON.parse(text)
    console.log('解析结果:', JSON.stringify(result, null, 2))
  } catch (e) {
    console.log('JSON解析失败:', e.message)
  }
})
.catch(err => {
  console.error('请求失败:', err.message)
})
