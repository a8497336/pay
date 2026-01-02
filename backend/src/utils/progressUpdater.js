import { getDatabase } from '../models/database.js'

const updateOrderProgress = async () => {
  try {
    const db = getDatabase()

    const ordersList = await db.orders.all()
    const processingOrders = ordersList.filter(order =>
      order.status === 'processing' && order.progress < 100
    )

    for (const order of processingOrders) {
      const increment = Math.random() * 5
      const newProgress = Math.min(100, order.progress + increment)
      let newRemainingTime = Math.max(0, order.remainingTime - 0.5)

      let newStatus = 'processing'
      let finishTime = null

      if (newProgress >= 100) {
        newStatus = 'success'
        newRemainingTime = 0
        finishTime = Date.now()
      }

      const index = ordersList.findIndex(o => o.orderNumber === order.orderNumber)
      if (index !== -1) {
        ordersList[index] = {
          ...ordersList[index],
          progress: newProgress,
          remainingTime: newRemainingTime,
          status: newStatus,
          finishTime: finishTime
        }
      }

      console.log(`Updated order ${order.orderNumber}: progress=${newProgress.toFixed(2)}%, status=${newStatus}`)
    }

    if (processingOrders.length > 0) {
      console.log(`Updated ${processingOrders.length} processing orders`)
    }
  } catch (error) {
    console.error('Error updating order progress:', error)
  }
}

export const startProgressUpdater = () => {
  console.log('Starting order progress updater...')

  setInterval(() => {
    updateOrderProgress()
  }, 5000)

  console.log('Order progress updater started (runs every 5 seconds)')
}
