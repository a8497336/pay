import express from 'express'
import { getDatabase } from '../models/database.js'
import paymentPollingService from '../services/paymentPollingService.js'

const router = express.Router()

router.get('/search', async (req, res) => {
  try {
    const { keyword } = req.query
    if (!keyword) {
      return res.json([])
    }

    const db = getDatabase()
    const ordersList = await db.orders.all()

    const filteredOrders = ordersList.filter(order =>
      order.orderNumber.includes(keyword) || order.accountNumber.includes(keyword)
    )

    res.json(filteredOrders)
  } catch (error) {
    console.error('Error searching orders:', error)
    res.status(500).json({ error: 'Failed to search orders' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = getDatabase()

    const order = await db.orders.get('SELECT * FROM orders WHERE orderNumber = ?', [id])

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

router.get('/', async (req, res) => {
  try {
    const { status, keyword, uuid } = req.query
    const db = getDatabase()

    let ordersList = await db.orders.all()

    if (uuid) {
      ordersList = ordersList.filter(order => order.uuid === uuid)
    }

    if (status) {
      ordersList = ordersList.filter(order => order.status === status)
    }

    if (keyword) {
      ordersList = ordersList.filter(order =>
        order.orderNumber.includes(keyword) || order.accountNumber.includes(keyword)
      )
    }

    res.json(ordersList)
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

router.post('/', async (req, res) => {
  try {
    const orderData = req.body
    const db = getDatabase()

    const result = await db.orders.run(
      'INSERT INTO orders (...) VALUES (...)',
      [
        orderData.orderNumber,
        orderData.type,
        orderData.typeName,
        orderData.province,
        orderData.city,
        orderData.accountNumber,
        orderData.accountName,
        orderData.faceAmount,
        orderData.payAmount,
        orderData.status || 'pending',
        orderData.progress || 0,
        orderData.remainingTime || 0,
        orderData.createTime,
        orderData.finishTime || null,
        orderData.paymentMethod || null,
        orderData.failReason || null
      ]
    )

    const newOrder = await db.orders.get('SELECT * FROM orders WHERE id = ?', [result.id])
    res.status(201).json(newOrder)
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' })
    }

    const db = getDatabase()

    const result = await db.orders.run(
      'UPDATE orders SET status = ? WHERE orderNumber = ?',
      [status, id]
    )

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }

    const updatedOrder = await db.orders.get('SELECT * FROM orders WHERE orderNumber = ?', [id])
    res.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('Error updating order status:', error)
    res.status(500).json({ success: false, error: 'Failed to update order status' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const db = getDatabase()
    const allowedFields = ['status', 'progress', 'remainingTime', 'finishTime', 'failReason']

    const updateData = {}
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    const params = [...Object.values(updateData), id]
    const result = await db.orders.run(
      'UPDATE orders SET ... WHERE orderNumber = ?',
      params
    )

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const updatedOrder = await db.orders.get('SELECT * FROM orders WHERE orderNumber = ?', id)
    res.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    res.status(500).json({ error: 'Failed to update order' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = getDatabase()

    const result = await db.orders.run('DELETE FROM orders WHERE orderNumber = ?', [id])

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error('Error deleting order:', error)
    res.status(500).json({ error: 'Failed to delete order' })
  }
})

router.post('/:id/check-payment-status', async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ success: false, error: 'Order number is required' })
    }

    const result = await paymentPollingService.manuallyCheckOrderStatus(id)

    if (result.success) {
      res.json(result)
    } else {
      res.status(500).json(result)
    }
  } catch (error) {
    console.error('Error checking payment status:', error)
    res.status(500).json({ success: false, error: 'Failed to check payment status' })
  }
})

export default router
