import crypto from 'crypto'
import { liantuofuConfig } from '../config/liantuofu.js'

function generateSign(params) {
  const sortedKeys = Object.keys(params).sort()
  const signString = sortedKeys
    .filter(key => key !== 'sign' && key !== 'imgData' && params[key] != null)
    .map(key => `${key}=${params[key]}`)
    .join('&') + `&key=${liantuofuConfig.apiKey}`
  
  return crypto.createHash('md5').update(signString, 'utf-8').digest('hex').toLowerCase()
}

function verifySign(params, sign) {
  const computedSign = generateSign(params)
  return computedSign === sign
}

const mockPaymentStore = new Map()

let sessionToken = null

async function login() {
  try {
    console.log('Logging in to Liantuofu...')

    const timestamp = Date.now().toString()
    
    const params = {
      merchant_id: liantuofuConfig.merchantId,
      app_id: liantuofuConfig.appId,
      timestamp: timestamp,
      nonce_str: Math.random().toString(36).substr(2, 15),
      username: liantuofuConfig.merchantId,
      password: liantuofuConfig.apiKey
    }

    params.sign = generateSign(params)

    console.log('Login params:', JSON.stringify(params, null, 2))

    const response = await fetch(`${liantuofuConfig.apiBaseUrl}/open/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })

    const responseText = await response.text()
    console.log('Login response:', response.status, responseText)

    if (!response.ok) {
      console.error('Login failed:', response.status, responseText)
      throw new Error(`Login failed with status ${response.status}: ${responseText}`)
    }

    const result = JSON.parse(responseText)

    if (result.code === '0000' || result.code === 'SUCCESS') {
      sessionToken = result.data?.token || result.data?.session_id || result.data?.sessionToken || result.token || 'default_token'
      console.log('Login successful, token:', sessionToken)
      return {
        success: true,
        token: sessionToken
      }
    } else {
      console.error('Login failed:', result.msg || result.message)
      return {
        success: false,
        message: result.msg || result.message || '登录失败'
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      message: '登录服务异常: ' + error.message
    }
  }
}

async function createPaymentOrder(orderData) {
  try {
    console.log('Attempting to call Liantuofu payment API')
    
    const goodsDetail = JSON.stringify([{
      goodsId: 'ELEC_RECHARGE',
      goodsName: '电费充值',
      price: orderData.payAmount * 100,
      quantity: 1
    }])
    
    const params = {
      random: Math.random().toString(36).substr(2, 15),
      outTradeNo: orderData.orderNumber,
      totalAmount: orderData.payAmount * 100,
      channel: orderData.paymentMethod === 'wechat' ? 'WXPAY' : 'ALIPAY',
      tradeType: 'NATIVE',
      notifyUrl: liantuofuConfig.notifyUrl,
      goodsDetail: goodsDetail,
      merchantCode: 'EW_N0474913099',
      appId: liantuofuConfig.appId,
      version: '1.0'
    }

    params.sign = generateSign(params)

    console.log('Payment request params:', JSON.stringify(params, null, 2))
    console.log('Config used:', {
      appId: liantuofuConfig.appId,
      merchantCode: 'EW_N0474913099',
      apiKey: liantuofuConfig.apiKey.substring(0, 8) + '***'
    })

    const apiUrl = 'http://api.liantuofu.com/open/precreate'
    console.log(`Calling API: ${apiUrl}`)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(params).toString()
      })

      const responseText = await response.text()
      console.log(`API response:`, response.status, responseText)

      if (response.ok) {
        const result = JSON.parse(responseText)

        if (result.code === '0000' || result.code === 'SUCCESS') {
          const responseData = {
            success: true,
            payUrl: result.data?.payUrl || null,
            qrCode: result.data?.qrCode || null,
            orderNumber: orderData.orderNumber,
            tradeNo: result.data?.tradeNo
          }

          if (result.data?.jsapiParams) {
            responseData.jsapiParams = {
              appId: result.data.jsapiParams.appId,
              timeStamp: result.data.jsapiParams.timeStamp,
              nonceStr: result.data.jsapiParams.nonceStr,
              package: result.data.jsapiParams.package,
              signType: result.data.jsapiParams.signType || 'MD5',
              paySign: result.data.jsapiParams.paySign
            }
          }

          console.log('Payment order created successfully')
          return responseData
        } else {
          console.warn(`API returned error:`, result.msg || result.message)
          throw new Error(result.msg || result.message || '创建支付订单失败')
        }
      } else {
        throw new Error(`API request failed with status ${response.status}`)
      }
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  } catch (error) {
    console.error('Create payment order error:', error)
    return {
      success: false,
      message: '支付服务异常: ' + error.message
    }
  }
}

async function queryPaymentStatus(orderNumber) {
  try {
    const isDevMode = !liantuofuConfig.merchantId || !liantuofuConfig.apiKey

    if (isDevMode) {
      console.log('Development mode: Querying mock payment status:', orderNumber)
      
      const mockPayment = mockPaymentStore.get(orderNumber)
      
      if (!mockPayment) {
        return {
          success: false,
          message: '订单不存在'
        }
      }
      
      const elapsed = Date.now() - mockPayment.createTime
      const isPaid = elapsed > 3000 && elapsed < 10000
      const isExpired = elapsed > 30000
      
      let tradeStatus = 'PENDING'
      if (isPaid) {
        tradeStatus = 'SUCCESS'
        mockPayment.trade_status = 'SUCCESS'
        mockPayment.pay_time = new Date().toISOString()
      } else if (isExpired) {
        tradeStatus = 'FAILED'
        mockPayment.trade_status = 'FAILED'
      }
      
      console.log('Mock payment status:', orderNumber, tradeStatus, `elapsed: ${elapsed}ms`)
      
      return {
        success: true,
        code: '0000',
        msg: 'success',
        data: {
          trade_status: tradeStatus,
          total_amount: mockPayment.total_amount,
          trade_no: mockPayment.trade_no,
          pay_time: mockPayment.pay_time || null
        }
      }
    }

    const params = {
      merchant_id: liantuofuConfig.merchantId,
      app_id: liantuofuConfig.appId,
      out_trade_no: orderNumber,
      timestamp: Date.now().toString(),
      token: sessionToken
    }

    params.sign = generateSign(params)

    const response = await fetch(`${liantuofuConfig.apiBaseUrl}/pay/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('API response not OK:', response.status, text)
      throw new Error(`API request failed with status ${response.status}`)
    }

    const result = await response.json()

    if (result.code === '0000') {
      return {
        success: true,
        tradeStatus: result.data.trade_status,
        totalAmount: result.data.total_amount / 100,
        tradeNo: result.data.trade_no,
        payTime: result.data.pay_time
      }
    } else {
      return {
        success: false,
        message: result.msg || '查询支付状态失败'
      }
    }
  } catch (error) {
    console.error('Query payment status error:', error)
    return {
      success: false,
      message: '查询服务异常: ' + error.message
    }
  }
}

async function verifyNotify(notifyData) {
  try {
    const { sign, ...params } = notifyData
    
    if (!verifySign(params, sign)) {
      return {
        success: false,
        message: '签名验证失败'
      }
    }

    return {
      success: true,
      data: {
        outTradeNo: params.out_trade_no,
        tradeNo: params.trade_no,
        tradeStatus: params.trade_status,
        totalAmount: params.total_amount / 100,
        payTime: params.pay_time
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

async function mockCompletePayment(orderNumber) {
  try {
    const mockPayment = mockPaymentStore.get(orderNumber)
    
    if (!mockPayment) {
      return {
        success: false,
        message: '订单不存在'
      }
    }
    
    mockPayment.trade_status = 'SUCCESS'
    mockPayment.pay_time = new Date().toISOString()
    
    console.log('Mock payment completed:', orderNumber)
    
    return {
      success: true,
      message: '模拟支付成功',
      data: mockPayment
    }
  } catch (error) {
    console.error('Mock complete payment error:', error)
    return {
      success: false,
      message: '模拟支付失败'
    }
  }
}

export default {
  login,
  createPaymentOrder,
  queryPaymentStatus,
  verifyNotify,
  mockCompletePayment,
  generateSign,
  verifySign
}
