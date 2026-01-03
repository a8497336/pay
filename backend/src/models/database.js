import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDir = path.join(__dirname, '../../database')
const ordersFile = path.join(dataDir, 'orders.json')
const aftersalesFile = path.join(dataDir, 'aftersales.json')

let orders = []
let aftersales = []
let dbInstance = null
let isInitialized = false

export const initDatabase = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  loadOrders()
  loadAftersales()

  if (orders.length === 0) {
    insertSampleData()
  }

  isInitialized = true
  return Promise.resolve()
}

const loadOrders = () => {
  if (fs.existsSync(ordersFile)) {
    const data = fs.readFileSync(ordersFile, 'utf8')
    orders = JSON.parse(data)
  }
}

const saveOrders = () => {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf8')
}

const loadAftersales = () => {
  if (fs.existsSync(aftersalesFile)) {
    const data = fs.readFileSync(aftersalesFile, 'utf8')
    aftersales = JSON.parse(data)
  }
}

const saveAftersales = () => {
  fs.writeFileSync(aftersalesFile, JSON.stringify(aftersales, null, 2), 'utf8')
}

const insertSampleData = () => {
  const now = Date.now()
  orders = [
    {
      id: 1,
      orderNumber: 'D20240101120000ABCD',
      type: 'slow',
      typeName: '电费慢充',
      province: 'guangdong',
      city: '深圳市',
      accountNumber: '12345678901',
      accountName: '张三',
      faceAmount: 5000,
      payAmount: 4200,
      status: 'success',
      progress: 100,
      remainingTime: 0,
      createTime: now - 86400000,
      finishTime: now - 3600000,
      paymentMethod: 'wechat'
    },
    {
      id: 2,
      orderNumber: 'D20240102104500EFGH',
      type: 'fast',
      typeName: '电费快充',
      province: 'shanghai',
      city: '上海市',
      accountNumber: '98765432109',
      accountName: '李四',
      faceAmount: 1000,
      payAmount: 970,
      status: 'processing',
      progress: 65,
      remainingTime: 12,
      createTime: now - 43200000,
      paymentMethod: 'alipay'
    },
    {
      id: 3,
      orderNumber: 'D20231231180000IJKL',
      type: 'slow',
      typeName: '电费慢充',
      province: 'beijing',
      city: '北京市',
      accountNumber: '1122334455667',
      accountName: '王五',
      faceAmount: 2000,
      payAmount: 1700,
      status: 'failed',
      progress: 0,
      remainingTime: 0,
      createTime: now - 172800000,
      paymentMethod: 'card',
      failReason: '户号不存在'
    }
  ]

  saveOrders()
}

export const getDatabase = () => {
  if (!isInitialized) {
    loadOrders()
    loadAftersales()
    isInitialized = true
  }

  if (dbInstance) {
    return dbInstance
  }

  dbInstance = {
    orders: {
      all: () => Promise.resolve(orders),
      get: (sql, params) => {
        if (sql.includes('COUNT')) {
          return Promise.resolve({ count: orders.length })
        }
        const order = orders.find(o => o.orderNumber === params[0])
        return Promise.resolve(order || null)
      },
      run: (sql, params) => {
        if (sql.includes('INSERT')) {
          const newOrder = {
            id: orders.length + 1,
            orderNumber: params[0],
            type: params[1],
            typeName: params[2],
            province: params[3],
            city: params[4],
            accountNumber: params[5],
            accountName: params[6],
            faceAmount: params[7],
            payAmount: params[8],
            status: params[9],
            progress: params[10],
            remainingTime: params[11],
            createTime: params[12],
            paymentMethod: params[13],
            tradeNo: params[14],
            finishTime: null,
            failReason: null
          }
          orders.unshift(newOrder)
          saveOrders()
          return Promise.resolve({ id: newOrder.id, changes: 1 })
        } else if (sql.includes('UPDATE')) {
          const orderNumber = params[params.length - 1]
          const index = orders.findIndex(o => o.orderNumber === orderNumber)
          if (index !== -1) {
            const setClause = sql.match(/SET\s+(.+?)\s+WHERE/i)?.[1]
            if (setClause) {
              const fields = setClause.split(',').map(a => a.trim().split('=')[0].trim())
              fields.forEach((field, i) => {
                if (params[i] !== undefined) {
                  orders[index][field] = params[i]
                }
              })
            }
            saveOrders()
            return Promise.resolve({ changes: 1 })
          }
          return Promise.resolve({ changes: 0 })
        } else if (sql.includes('DELETE')) {
          const orderNumber = params[0]
          const index = orders.findIndex(o => o.orderNumber === orderNumber)
          if (index !== -1) {
            orders.splice(index, 1)
            saveOrders()
            return Promise.resolve({ changes: 1 })
          }
          return Promise.resolve({ changes: 0 })
        }
        return Promise.resolve({ changes: 0 })
      }
    },
    aftersales: {
      all: () => Promise.resolve(aftersales),
      get: (sql, params) => {
        const aftersale = aftersales.find(a => a.id === params[0])
        return Promise.resolve(aftersale || null)
      },
      run: (sql, params) => {
        if (sql.includes('INSERT')) {
          const newAftersale = {
            id: aftersales.length + 1,
            orderNumber: params[0],
            reason: params[1],
            description: params[2],
            status: params[3],
            createTime: params[4]
          }
          aftersales.unshift(newAftersale)
          saveAftersales()
          return Promise.resolve({ id: newAftersale.id, changes: 1 })
        } else if (sql.includes('UPDATE')) {
          const id = params[params.length - 1]
          const index = aftersales.findIndex(a => a.id === id)
          if (index !== -1) {
            aftersales[index] = { ...aftersales[index], ...params }
            saveAftersales()
            return Promise.resolve({ changes: 1 })
          }
          return Promise.resolve({ changes: 0 })
        }
        return Promise.resolve({ changes: 0 })
      }
    }
  }

  return dbInstance
}
