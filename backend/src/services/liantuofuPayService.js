import crypto from 'crypto'

const liantuofuConfig = {
  isSandbox: false,
  merchantCode: 'EW_N0474913099',
  appId: 'EW_N9173468315',
  key: 'c1d7cf2a55ab1a790a1fca970749fa33',
  payNotifyUrl: process.env.LIANTUOFU_NOTIFY_URL || 'https://eee.yiw315.cn/api/payment/liantuofu/notify',
  notifyUrl: process.env.LIANTUOFU_REFUND_NOTIFY_URL || 'https://eee.yiw315.cn/front/index.html#/orders',
  baseUrl: 'http://api.liantuofu.com'
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

function verifySign(params) {
  const sign = params.sign
  delete params.sign
  
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
  
  console.log('Verify sign - received:', sign)
  console.log('Verify sign - calculated:', md5Sign)
  console.log('Verify sign - params:', JSON.stringify(validParams))
  console.log('Verify sign - sign string:', signStr)
  
  return {
    isValid: md5Sign === sign,
    receivedSign: sign,
    calculatedSign: md5Sign
  }
}

async function createPaymentOrder(orderData) {
  try {
    console.log('Creating Liantuofu Pay order:', orderData.orderNumber)

    const reqParams = {
      random: Math.floor(Math.random() * 100000000).toString(),
      outTradeNo: orderData.orderNumber,
      totalAmount: orderData.payAmount.toString(),
      expireSeconds: '300',
      notifyUrl: liantuofuConfig.notifyUrl,
      channel: 'WXPAY',
      goodsDetail: JSON.stringify([{
        goodsId: 'electric_recharge',
        goodsName: '电费充值',
        price: orderData.faceAmount,
        quantity: 1
      }])
    }

    reqParams.merchantCode = liantuofuConfig.merchantCode
    reqParams.appId = liantuofuConfig.appId
    reqParams.sign = generateSign(reqParams)

    console.log('Liantuofu Pay params:', JSON.stringify(reqParams, null, 2))

    const formData = new URLSearchParams()
    Object.keys(reqParams).forEach(key => {
      formData.append(key, reqParams[key])
    })

    const response = await fetch(`${liantuofuConfig.baseUrl}/open/jspay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      body: formData.toString()
    })

    const responseText = await response.text()
    console.log('Liantuofu Pay response status:', response.status)
    console.log('Liantuofu Pay response text:', responseText)

    if (!response.ok) {
      throw new Error(`Liantuofu Pay API failed with status ${response.status}: ${responseText}`)
    }

    if (!responseText || responseText.trim() === '') {
      throw new Error(`Liantuofu Pay API returned empty response`)
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse Liantuofu Pay response:', parseError)
      throw new Error(`Liantuofu Pay API returned invalid JSON: ${responseText}`)
    }

    console.log('Liantuofu Pay parsed result:', result)

    if (result.code === 'SUCCESS' || result.code === 0 || result.code === '0000') {
      return {
        success: true,
        orderNumber: orderData.orderNumber,
        payUrl: result.url || result.payUrl || result.codeUrl,
        payParams: result.payParams,
        isLiantuofuPay: true
      }
    } else {
      return {
        success: false,
        message: result.msg || '创建支付订单失败'
      }
    }
  } catch (error) {
    console.error('Liantuofu Pay create order error:', error)
    return {
      success: false,
      message: '联拓富支付服务异常: ' + error.message
    }
  }
}

async function queryPaymentStatus(orderNumber) {
  try {
    console.log('Querying Liantuofu Pay status:', orderNumber)

    const reqParams = {
      random: Math.floor(Math.random() * 100000000).toString(),
      outTradeNo: orderNumber
    }

    reqParams.merchantCode = liantuofuConfig.merchantCode
    reqParams.appId = liantuofuConfig.appId
    reqParams.sign = generateSign(reqParams)

    const formData = new URLSearchParams()
    Object.keys(reqParams).forEach(key => {
      formData.append(key, reqParams[key])
    })

    const response = await fetch(`${liantuofuConfig.baseUrl}/open/pay/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      body: formData.toString()
    })

    const responseText = await response.text()
    console.log('Liantuofu Pay query response:', responseText)

    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse Liantuofu Pay query response:', parseError)
      throw new Error(`Liantuofu Pay API returned invalid JSON: ${responseText}`)
    }

    if (result.code === 'SUCCESS' || result.code === 0 || result.code === '0000') {
      return {
        success: true,
        tradeStatus: result.orderStatus,
        totalAmount: result.totalAmount,
        transactionId: result.transactionId
      }
    } else {
      return {
        success: false,
        message: result.msg || '查询支付状态失败',
        orderStatus: result.orderStatus
      }
    }
  } catch (error) {
    console.error('Liantuofu Pay query error:', error)
    return {
      success: false,
      message: '查询服务异常: ' + error.message
    }
  }
}

async function verifyNotify(notifyData) {
  try {
    console.log('Verifying Liantuofu Pay notify:', JSON.stringify(notifyData, null, 2))

    const signResult = verifySign(notifyData)

    if (!signResult.isValid) {
      console.error('Liantuofu Pay notify verification failed')
      console.error('Received sign:', signResult.receivedSign)
      console.error('Calculated sign:', signResult.calculatedSign)
      return {
        success: false,
        message: '签名验证失败',
        calculatedSign: signResult.calculatedSign
      }
    }

    return {
      success: true,
      data: {
        outTradeNo: notifyData.outTradeNo,
        transactionId: notifyData.transactionId,
        totalAmount: notifyData.totalAmount,
        tradeStatus: notifyData.tradeStatus,
        channel: notifyData.channel
      }
    }
  } catch (error) {
    console.error('Verify notify error:', error)
    return {
      success: false,
      message: '回调验证异常'
    }
  }
}

export default {
  createPaymentOrder,
  queryPaymentStatus,
  verifyNotify,
  liantuofuConfig
}
