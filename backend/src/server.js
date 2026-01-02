import express from 'express'
import cors from 'cors'
import { initDatabase } from './models/database.js'
import { startProgressUpdater } from './utils/progressUpdater.js'
import orderRoutes from './routes/orders.js'
import aftersaleRoutes from './routes/aftersales.js'
import paymentRoutes from './routes/payment.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/orders', orderRoutes)
app.use('/api/aftersales', aftersaleRoutes)
app.use('/api/payment', paymentRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Payment API is running' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal Server Error' })
})

const startServer = async () => {
  try {
    await initDatabase()
    startProgressUpdater()

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log(`API: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
