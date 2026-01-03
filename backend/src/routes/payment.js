import express from 'express'
import { getDatabase } from '../models/database.js'
import liantuofuPayService from '../services/liantuofuPayService.js'
import crypto from 'crypto'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { faceAmount, payAmount, paymentMethod, openid, orderData: orderInfo } = req.body

    const orderNumber = 'D' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase()
    const tradeNo = 'LT' + Date.now() + Math.random().toString(36).substr(2, 8).toUpperCase()

    if (orderInfo) {
      const db = getDatabase()
      const orderData = {
        ...orderInfo,
        orderNumber,
        status: 'pending',
        progress: 0,
        remainingTime: orderInfo.type === 'fast' ? 3600 : 273600,
        createTime: new Date().toISOString(),
        paymentMethod,
        tradeNo
      }

      await db.orders.run(
        'INSERT INTO orders (orderNumber, type, typeName, province, city, accountNumber, accountName, faceAmount, payAmount, status, progress, remainingTime, createTime, paymentMethod, tradeNo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          orderData.orderNumber,
          orderData.type,
          orderData.typeName,
          orderData.province,
          orderData.city,
          orderData.accountNumber,
          orderData.accountName || '',
          orderData.faceAmount,
          orderData.payAmount,
          orderData.status,
          orderData.progress,
          orderData.remainingTime,
          orderData.createTime,
          orderData.paymentMethod,
          orderData.tradeNo
        ]
      )
    }

    const paymentRequestData = {
      orderNumber,
      payAmount,
      faceAmount,
      paymentMethod,
      clientIp: req.ip || req.connection.remoteAddress || '127.0.0.1',
      orderData: orderInfo
    }

    const paymentResult = await liantuofuPayService.createPaymentOrder(paymentRequestData)

    if (!paymentResult.success) {
      return res.json({
        success: false,
        message: paymentResult.message || '创建支付订单失败'
      })
    }

    const responseData = {
      success: true,
      orderNumber,
      tradeNo: paymentResult.transactionId || tradeNo,
      message: '支付订单创建成功'
    }

    if (paymentResult.qrCode) {
      responseData.qrCode = paymentResult.qrCode
    }

    if (paymentResult.payUrl) {
      responseData.payUrl = paymentResult.payUrl
    }

    res.json(responseData)
  } catch (error) {
    console.error('Error processing payment:', error)
    res.status(500).json({ error: 'Failed to process payment' })
  }
})

router.post('/query', async (req, res) => {
  try {
    const { orderNumber } = req.body

    if (!orderNumber) {
      return res.status(400).json({ error: 'Order number is required' })
    }

    const db = getDatabase()
    
    const order = await db.orders.get(
      'SELECT * FROM orders WHERE orderNumber = ?',
      [orderNumber]
    )

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      })
    }

    if (order.paymentMethod === 'liantuofu' && order.status !== 'completed') {
      try {
        const liantuofuResult = await liantuofuPayService.queryPaymentStatus(orderNumber)
        console.log('Liantuofu Pay query result:', liantuofuResult)

        if (liantuofuResult.success && liantuofuResult.tradeStatus === 'SUCCESS') {
          await db.orders.run(
            'UPDATE orders SET status = ?, finishTime = ? WHERE orderNumber = ?',
            ['completed', new Date().toISOString(), orderNumber]
          )
          
          order.status = 'completed'
          order.finishTime = new Date().toISOString()
        }
      } catch (error) {
        console.error('Error querying Liantuofu Pay status:', error)
      }
    }

    res.json({
      success: true,
      tradeStatus: order.status === 'completed' ? 'SUCCESS' : order.status === 'failed' ? 'FAILED' : 'PENDING',
      totalAmount: order.payAmount,
      tradeNo: order.tradeNo,
      payTime: order.finishTime
    })
  } catch (error) {
    console.error('Error querying payment status:', error)
    res.status(500).json({ error: 'Failed to query payment status' })
  }
})

router.post('/notify', async (req, res) => {
  try {
    const { orderNumber, tradeStatus } = req.body

    if (!orderNumber || !tradeStatus) {
      return res.status(400).json({ error: 'Order number and trade status are required' })
    }

    const db = getDatabase()

    if (tradeStatus === 'SUCCESS' || tradeStatus === 'success') {
      await db.orders.run(
        'UPDATE orders SET status = ?, finishTime = ? WHERE orderNumber = ?',
        ['completed', new Date().toISOString(), orderNumber]
      )
    } else if (tradeStatus === 'FAILED' || tradeStatus === 'failed') {
      await db.orders.run(
        'UPDATE orders SET status = ?, failReason = ? WHERE orderNumber = ?',
        ['failed', '支付失败', orderNumber]
      )
    }

    res.json({ code: '0000', msg: 'success' })
  } catch (error) {
    console.error('Error processing payment notify:', error)
    res.status(500).json({ code: '9999', msg: 'Internal server error' })
  }
})

router.post('/liantuofu/notify', async (req, res) => {
  try {
    console.log('=== Liantuofu Pay notify ===')
    console.log('Request headers:', JSON.stringify(req.headers, null, 2))
    console.log('Request body:', JSON.stringify(req.body, null, 2))
    console.log('Raw body:', req.body)

    const verifyResult = await liantuofuPayService.verifyNotify(req.body)

    const SKIP_SIGN_VERIFY = process.env.SKIP_SIGN_VERIFY === 'true'

    if (!SKIP_SIGN_VERIFY && !verifyResult.success) {
      console.error('Liantuofu Pay notify verification failed')
      console.error('Received sign:', req.body.sign)
      console.error('Calculated sign:', verifyResult.calculatedSign)
      console.error('Params for sign:', JSON.stringify(req.body, null, 2))
       
      return res.json({ code: -1, msg: 'sign error' })
    }

    const { outTradeNo, transactionId, totalAmount, tradeStatus, channel } = verifyResult.data || req.body

    const db = getDatabase()

    if (tradeStatus === 'SUCCESS' || tradeStatus === 'TRADE_SUCCESS') {
      await db.orders.run(
        'UPDATE orders SET status = ?, finishTime = ?, tradeNo = ? WHERE orderNumber = ?',
        ['completed', new Date().toISOString(), transactionId, outTradeNo]
      )
      console.log(`订单${outTradeNo}支付成功，金额${totalAmount}元`)
    } else if (tradeStatus === 'FAILED' || tradeStatus === 'TRADE_FAILED') {
      await db.orders.run(
        'UPDATE orders SET status = ?, failReason = ? WHERE orderNumber = ?',
        ['failed', '支付失败', outTradeNo]
      )
    }

    res.json({ code: 0, msg: 'success' })
  } catch (error) {
    console.error('Error processing Liantuofu Pay notify:', error)
    res.json({ code: -1, msg: 'fail' })
  }
})

router.post('/liantuofu/notify-test', async (req, res) => {
  try {
    console.log('=== Liantuofu Pay notify (test mode) ===')
    console.log('Request body:', JSON.stringify(req.body, null, 2))

    const { outTradeNo, transactionId, totalAmount, tradeStatus, channel } = req.body

    const db = getDatabase()

    if (tradeStatus === 'SUCCESS' || tradeStatus === 'TRADE_SUCCESS') {
      await db.orders.run(
        'UPDATE orders SET status = ?, finishTime = ?, tradeNo = ? WHERE orderNumber = ?',
        ['completed', new Date().toISOString(), transactionId, outTradeNo]
      )
      console.log(`订单${outTradeNo}支付成功，金额${totalAmount}元`)
    } else if (tradeStatus === 'FAILED' || tradeStatus === 'TRADE_FAILED') {
      await db.orders.run(
        'UPDATE orders SET status = ?, failReason = ? WHERE orderNumber = ?',
        ['failed', '支付失败', outTradeNo]
      )
    }

    res.json({ code: 0, msg: 'success' })
  } catch (error) {
    console.error('Error processing Liantuofu Pay notify (test):', error)
    res.json({ code: -1, msg: 'fail' })
  }
})

router.post('/wechat/notify', async (req, res) => {
  try {
    let body = ''
    req.on('data', chunk => {
      body += chunk
    })

    req.on('end', async () => {
      try {
        console.log('WeChat Pay V3 notify body:', body)
        
        const { timestamp, nonce, signature, 'wechatpay-signature': wechatSignature } = req.headers
        console.log('WeChat Pay V3 headers:', { timestamp, nonce, signature, wechatSignature })

        const signStr = `${timestamp}\n${nonce}\n${body}\n`
        const computedSign = crypto.createHash('sha256')
          .update(signStr, 'utf8')
          .digest('hex')

        const receivedSign = signature || wechatSignature
        console.log('WeChat Pay V3 sign verification:', { computedSign, received: receivedSign })

        if (computedSign !== receivedSign) {
          console.error('WeChat Pay V3 notify verification failed')
          return res.status(401).json({ code: 'FAIL', message: '签名验证失败' })
        }

        const notifyData = JSON.parse(body)
        console.log('WeChat Pay V3 notify data:', JSON.stringify(notifyData, null, 2))

        const db = getDatabase()

        if (notifyData.event_type === 'TRANSACTION.SUCCESS') {
          const resource = JSON.parse(notifyData.resource.ciphertext)
          const decryptedData = JSON.parse(resource)

          await db.orders.run(
            'UPDATE orders SET status = ?, finishTime = ?, transactionId = ? WHERE orderNumber = ?',
            ['completed', new Date().toISOString(), decryptedData.transaction_id, decryptedData.out_trade_no]
          )
        }

        res.json({ code: 'SUCCESS' })
      } catch (error) {
        console.error('Error processing WeChat Pay V3 notify:', error)
        res.status(500).json({ code: 'FAIL', message: 'Internal error' })
      }
    })
  } catch (error) {
    console.error('Error processing WeChat Pay V3 notify:', error)
    res.status(500).json({ code: 'FAIL', message: 'Internal error' })
  }
})

export default router
