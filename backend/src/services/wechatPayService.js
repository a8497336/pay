import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const wechatPayConfig = {
  mchId: process.env.WECHAT_MCH_ID || '1722745417',
  appId: process.env.WECHAT_APP_ID || 'wx5d360e8e1f8459cb',
  apiV3Key: process.env.WECHAT_API_V3_KEY || 'abcdefghijklmnopqrstuvwxyz123555',
  notifyUrl: process.env.WECHAT_NOTIFY_URL || 'http://localhost:5000/api/payment/wechat/notify',
  apiUrl: 'https://api.mch.weixin.qq.com/v3/pay/transactions/native',
  privateKeyPath: path.join(__dirname, '../../certificates/apiclient_key.pem'),
  certPath: path.join(__dirname, '../../certificates/apiclient_cert.pem')
}

let privateKey = null
let certSerialNo = null

try {
  privateKey = fs.readFileSync(wechatPayConfig.privateKeyPath, 'utf8')
  console.log('WeChat Pay private key loaded successfully')
} catch (error) {
  console.error('Failed to load WeChat Pay private key:', error)
}

try {
  const cert = fs.readFileSync(wechatPayConfig.certPath, 'utf8')
  const x509 = new crypto.X509Certificate(cert)
  certSerialNo = x509.serialNumber
  console.log('WeChat Pay certificate serial number:', certSerialNo)
} catch (error) {
  console.error('Failed to load WeChat Pay certificate:', error)
}

function generateSignature(method, url, timestamp, nonce, body) {
  const signStr = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`
  
  console.log('WeChat Pay V3 sign string:', signStr)
  
  const sign = crypto.sign('sha256', Buffer.from(signStr, 'utf8'), privateKey)
  const signature = sign.toString('base64')
  
  return signature
}

async function createPaymentOrder(orderData) {
  try {
    console.log('Creating WeChat Pay V3 order:', orderData.orderNumber)

    const timestamp = Math.floor(Date.now() / 1000).toString()
    const nonce = Math.random().toString(36).substr(2, 15)

    const body = {
      mchid: wechatPayConfig.mchId,
      out_trade_no: orderData.orderNumber,
      appid: wechatPayConfig.appId,
      description: '电费充值',
      notify_url: wechatPayConfig.notifyUrl,
      amount: {
        total: Math.max(1, Math.round(orderData.payAmount * 100)),
        currency: 'CNY'
      },
      scene_info: {
        payer_client_ip: '127.0.0.1'
      }
    }

    const bodyJson = JSON.stringify(body)
    console.log('WeChat Pay V3 body:', bodyJson)

    const signature = generateSignature('POST', '/v3/pay/transactions/native', timestamp, nonce, bodyJson)
    console.log('WeChat Pay V3 signature:', signature)

    const response = await fetch(wechatPayConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `WECHATPAY2-SHA256-RSA2048 mchid="${wechatPayConfig.mchId}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${certSerialNo}",signature="${signature}"`
      },
      body: bodyJson
    })

    const responseText = await response.text()
    console.log('WeChat Pay V3 response:', response.status, responseText)

    if (!response.ok) {
      throw new Error(`WeChat Pay V3 API failed with status ${response.status}`)
    }

    const result = JSON.parse(responseText)

    if (result.code_url) {
      return {
        success: true,
        qrCode: result.code_url,
        orderNumber: orderData.orderNumber,
        prepayId: result.prepay_id,
        isWechatPay: true
      }
    } else {
      return {
        success: false,
        message: result.message || '创建支付订单失败'
      }
    }
  } catch (error) {
    console.error('WeChat Pay V3 create order error:', error)
    return {
      success: false,
      message: '微信支付服务异常: ' + error.message
    }
  }
}

async function queryPaymentStatus(orderNumber) {
  try {
    console.log('Querying WeChat Pay V3 status:', orderNumber)

    const timestamp = Math.floor(Date.now() / 1000).toString()
    const nonce = Math.random().toString(36).substr(2, 15)

    const url = `/v3/pay/transactions/out-trade-no/${orderNumber}?mchid=${wechatPayConfig.mchId}`
    const signature = generateSignature('GET', url, timestamp, nonce, '')

    const response = await fetch(`https://api.mch.weixin.qq.com${url}`, {
      method: 'GET',
      headers: {
        'Authorization': `WECHATPAY2-SHA256-RSA2048 mchid="${wechatPayConfig.mchId}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${certSerialNo}",signature="${signature}"`
      }
    })

    const responseText = await response.text()
    const result = JSON.parse(responseText)

    if (result.trade_state) {
      return {
        success: true,
        tradeStatus: result.trade_state === 'SUCCESS' ? 'SUCCESS' : result.trade_state,
        totalAmount: result.amount.total / 100,
        transactionId: result.transaction_id
      }
    } else {
      return {
        success: false,
        message: result.message || '查询支付状态失败'
      }
    }
  } catch (error) {
    console.error('WeChat Pay V3 query error:', error)
    return {
      success: false,
      message: '查询服务异常: ' + error.message
    }
  }
}

async function verifyNotify(notifyData) {
  try {
    const { signature, timestamp, nonce, body } = notifyData
    
    const signStr = `${timestamp}\n${nonce}\n${body}\n`
    const computedSign = crypto.createHash('sha256')
      .update(signStr, 'utf8')
      .digest('hex')
    
    if (computedSign !== signature) {
      return {
        success: false,
        message: '签名验证失败'
      }
    }

    const data = JSON.parse(body)

    return {
      success: true,
      data: {
        outTradeNo: data.out_trade_no,
        transactionId: data.transaction_id,
        totalAmount: data.amount.total / 100,
        timeEnd: data.success_time
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
  generateSignature,
  wechatPayConfig
}
