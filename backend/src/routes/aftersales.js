import express from 'express'
import { getDatabase } from '../models/database.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { orderNumber, status } = req.query
    const db = getDatabase()

    let aftersalesList = await db.aftersales.all()

    if (orderNumber) {
      aftersalesList = aftersalesList.filter(a => a.orderNumber === orderNumber)
    }
    if (status) {
      aftersalesList = aftersalesList.filter(a => a.status === status)
    }

    res.json(aftersalesList)
  } catch (error) {
    console.error('Error fetching aftersales:', error)
    res.status(500).json({ error: 'Failed to fetch aftersales' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = getDatabase()

    const aftersale = await db.aftersales.get('SELECT * FROM aftersales WHERE id = ?', id)

    if (!aftersale) {
      return res.status(404).json({ error: 'Aftersale not found' })
    }

    res.json(aftersale)
  } catch (error) {
    console.error('Error fetching aftersale:', error)
    res.status(500).json({ error: 'Failed to fetch aftersale' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { orderNumber, reason, description } = req.body

    if (!orderNumber || !reason) {
      return res.status(400).json({ error: 'orderNumber and reason are required' })
    }

    const db = getDatabase()

    const now = Date.now()
    const result = await db.aftersales.run(
      'INSERT INTO aftersales (...) VALUES (...)',
      orderNumber, reason, description || '', 'pending', now
    )

    const newAftersale = await db.aftersales.get('SELECT * FROM aftersales WHERE id = ?', result.id)
    res.status(201).json(newAftersale)
  } catch (error) {
    console.error('Error creating aftersale:', error)
    res.status(500).json({ error: 'Failed to create aftersale' })
  }
})

router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }

    const db = getDatabase()

    const result = await db.aftersales.run(
      'UPDATE aftersales SET status = ?, updateTime = ? WHERE id = ?',
      status, Date.now(), id
    )

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Aftersale not found' })
    }

    const updatedAftersale = await db.aftersales.get('SELECT * FROM aftersales WHERE id = ?', id)
    res.json(updatedAftersale)
  } catch (error) {
    console.error('Error updating aftersale status:', error)
    res.status(500).json({ error: 'Failed to update aftersale status' })
  }
})

export default router
