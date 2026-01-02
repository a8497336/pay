import express from 'express'

const router = express.Router()

router.post('/', (req, res) => {
  try {
    const { faceAmount, payAmount, paymentMethod } = req.body

    setTimeout(() => {
      const success = Math.random() > 0.05

      if (success) {
        const orderNumber = 'D' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase()

        res.json({
          success: true,
          orderNumber,
          message: 'Payment successful',
          paymentMethod,
          amount: payAmount,
          timestamp: Date.now()
        })
      } else {
        res.status(400).json({
          success: false,
          message: 'Payment failed',
          error: 'Insufficient balance or payment method error'
        })
      }
    }, 2000)
  } catch (error) {
    console.error('Error processing payment:', error)
    res.status(500).json({ error: 'Failed to process payment' })
  }
})

export default router
