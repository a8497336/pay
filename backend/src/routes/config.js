import express from 'express'
import { getDatabase } from '../models/database.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const db = getDatabase()
    const config = await db.config.get('SELECT * FROM config WHERE id = 1')

    if (!config) {
      return res.json({
        fastDiscount: 1,
        slowDiscount: 1
      })
    }

    res.json({
      fastDiscount: config.fastDiscount || 1,
      slowDiscount: config.slowDiscount || 1
    })
  } catch (error) {
    console.error('Error fetching config:', error)
    res.status(500).json({ error: 'Failed to fetch config' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { fastDiscount, slowDiscount } = req.body

    if (fastDiscount === undefined || slowDiscount === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }

    const db = getDatabase()

    const existing = await db.config.get('SELECT * FROM config WHERE id = 1')

    if (existing) {
      await db.config.run(
        'UPDATE config SET fastDiscount = ?, slowDiscount = ? WHERE id = 1',
        [fastDiscount, slowDiscount]
      )
    } else {
      await db.config.run(
        'INSERT INTO config (id, fastDiscount, slowDiscount) VALUES (1, ?, ?)',
        [fastDiscount, slowDiscount]
      )
    }

    res.json({ success: true, message: 'Config saved successfully' })
  } catch (error) {
    console.error('Error saving config:', error)
    res.status(500).json({ success: false, message: 'Failed to save config' })
  }
})

export default router
