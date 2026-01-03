import { getDatabase } from '../models/database.js'
import liantuofuPayService from './liantuofuPayService.js'

let pollingInterval = null
const POLLING_INTERVAL = 30000

function startPaymentStatusPolling() {
  if (pollingInterval) {
    console.log('Payment status polling is already running')
    return
  }

  console.log('Starting payment status polling service...')

  pollingInterval = setInterval(async () => {
    try {
      await checkAndUpdatePaymentStatus()
    } catch (error) {
      console.error('Error in payment status polling:', error)
    }
  }, POLLING_INTERVAL)

  console.log(`Payment status polling started with interval of ${POLLING_INTERVAL}ms`)
}

function stopPaymentStatusPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
    console.log('Payment status polling stopped')
  }
}

async function checkAndUpdatePaymentStatus() {
  try {
    const db = getDatabase()
    const ordersList = await db.orders.all()

    const pendingOrders = ordersList.filter(order => order.status === 'pending')

    if (pendingOrders.length === 0) {
      return
    }

    console.log(`Found ${pendingOrders.length} pending orders to check`)

    for (const order of pendingOrders) {
      try {
        console.log(`Checking payment status for order: ${order.orderNumber}`)

        const queryResult = await liantuofuPayService.queryPaymentStatus(order.orderNumber)

        if (queryResult.success) {
          console.log(`Order ${order.orderNumber} payment status: ${queryResult.tradeStatus}`)

          if (queryResult.tradeStatus === 'SUCCESS' || queryResult.tradeStatus === 'TRADE_SUCCESS') {
            console.log(`Updating order ${order.orderNumber} status to completed`)

            await db.orders.run(
              'UPDATE orders SET status = ? WHERE orderNumber = ?',
              ['completed', order.orderNumber]
            )

            console.log(`Order ${order.orderNumber} status updated successfully`)
          } else if (queryResult.tradeStatus === 'TRADE_CLOSED' || queryResult.tradeStatus === 'CLOSED') {
            console.log(`Order ${order.orderNumber} was closed, updating status to failed`)

            await db.orders.run(
              'UPDATE orders SET status = ?, failReason = ? WHERE orderNumber = ?',
              ['failed', '支付已关闭', order.orderNumber]
            )

            console.log(`Order ${order.orderNumber} status updated to failed`)
          }
        } else {
          console.log(`Failed to query payment status for order ${order.orderNumber}: ${queryResult.message}`)
        }
      } catch (error) {
        console.error(`Error checking payment status for order ${order.orderNumber}:`, error)
      }
    }
  } catch (error) {
    console.error('Error in checkAndUpdatePaymentStatus:', error)
  }
}

async function manuallyCheckOrderStatus(orderNumber) {
  try {
    console.log(`Manually checking payment status for order: ${orderNumber}`)

    const queryResult = await liantuofuPayService.queryPaymentStatus(orderNumber)

    if (queryResult.success) {
      console.log(`Order ${orderNumber} payment status: ${queryResult.tradeStatus}`)

      const db = getDatabase()

      if (queryResult.tradeStatus === 'SUCCESS' || queryResult.tradeStatus === 'TRADE_SUCCESS') {
        await db.orders.run(
          'UPDATE orders SET status = ? WHERE orderNumber = ?',
          ['completed', orderNumber]
        )

        console.log(`Order ${orderNumber} status updated to completed`)
        return { success: true, status: 'completed', message: '订单状态已更新为已完成' }
      } else if (queryResult.tradeStatus === 'TRADE_CLOSED' || queryResult.tradeStatus === 'CLOSED') {
        await db.orders.run(
          'UPDATE orders SET status = ?, failReason = ? WHERE orderNumber = ?',
          ['failed', '支付已关闭', orderNumber]
        )

        console.log(`Order ${orderNumber} status updated to failed`)
        return { success: true, status: 'failed', message: '订单状态已更新为失败' }
      } else {
        return { success: true, status: queryResult.tradeStatus, message: `订单当前状态: ${queryResult.tradeStatus}` }
      }
    } else {
      return { success: false, message: queryResult.message }
    }
  } catch (error) {
    console.error(`Error manually checking order status for ${orderNumber}:`, error)
    return { success: false, message: '查询订单状态异常: ' + error.message }
  }
}

export default {
  startPaymentStatusPolling,
  stopPaymentStatusPolling,
  checkAndUpdatePaymentStatus,
  manuallyCheckOrderStatus
}
