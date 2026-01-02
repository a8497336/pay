# 缴费系统 - Vue 3 + Node.js

一个完整的电费充值系统，包含前端Vue 3项目和Node.js后端API。

## 项目结构

```
缴费系统/
├── frontend/                 # Vue 3 前端项目
│   ├── src/
│   │   ├── components/      # Vue组件
│   │   ├── views/          # 页面视图
│   │   ├── stores/         # Pinia状态管理
│   │   ├── api/            # API接口封装
│   │   ├── router/         # 路由配置
│   │   └── utils/          # 工具函数
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Node.js 后端项目
│   ├── src/
│   │   ├── routes/         # API路由
│   │   ├── models/         # 数据库模型
│   │   └── utils/          # 工具函数
│   ├── database/           # SQLite数据库文件
│   └── package.json
└── README.md
```

## 技术栈

### 前端
- Vue 3 (Composition API)
- Vite
- Vue Router
- Pinia (状态管理)
- Axios (HTTP客户端)
- Element Plus (UI组件库)

### 后端
- Node.js
- Express.js
- SQLite (数据库)
- better-sqlite3 (SQLite驱动)
- CORS (跨域支持)

## 功能特性

### 前端功能
- ✅ 电费充值表单（慢充/快充）
- ✅ 省市级联选择
- ✅ 户号验证
- ✅ 金额选择和费用明细
- ✅ 支付方式选择
- ✅ 订单列表展示
- ✅ 订单筛选（全部/处理中/已完成）
- ✅ 订单搜索
- ✅ 订单详情查看
- ✅ 售后申请
- ✅ 实时订单进度更新

### 后端API
- ✅ 订单CRUD操作
- ✅ 订单状态管理
- ✅ 订单搜索和筛选
- ✅ 支付模拟接口
- ✅ 售后管理
- ✅ 自动订单进度更新

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

#### 后端
```bash
cd backend
npm install
```

#### 前端
```bash
cd frontend
npm install
```

### 启动项目

#### 启动后端服务
```bash
cd backend
npm start
```
后端服务将在 http://localhost:5000 启动

#### 启动前端开发服务器
```bash
cd frontend
npm run dev
```
前端服务将在 http://localhost:3000 启动

### 访问应用
打开浏览器访问: http://localhost:3000

## API接口文档

### 订单管理

#### 获取订单列表
```
GET /api/orders
Query参数:
  - status: 订单状态 (可选)
  - keyword: 搜索关键词 (可选)
```

#### 获取订单详情
```
GET /api/orders/:id
```

#### 创建订单
```
POST /api/orders
Body: {
  orderNumber: string,
  type: string,
  typeName: string,
  province: string,
  city: string,
  accountNumber: string,
  accountName: string,
  faceAmount: number,
  payAmount: number,
  status: string,
  progress: number,
  remainingTime: number,
  createTime: number,
  paymentMethod: string
}
```

#### 更新订单状态
```
PUT /api/orders/:id/status
Body: {
  status: string
}
```

#### 搜索订单
```
GET /api/orders/search?keyword=xxx
```

### 售后管理

#### 获取售后列表
```
GET /api/aftersales
Query参数:
  - orderNumber: 订单号 (可选)
  - status: 售后状态 (可选)
```

#### 创建售后
```
POST /api/aftersales
Body: {
  orderNumber: string,
  reason: string,
  description: string
}
```

#### 更新售后状态
```
PUT /api/aftersales/:id/status
Body: {
  status: string
}
```

### 支付接口

#### 模拟支付
```
POST /api/payment
Body: {
  faceAmount: number,
  payAmount: number,
  paymentMethod: string
}
```

## 数据库

系统使用SQLite数据库，数据库文件位于 `backend/database/payment.db`

### 表结构

#### orders (订单表)
- id: 主键
- orderNumber: 订单号
- type: 充值类型
- typeName: 类型名称
- province: 省份
- city: 城市
- accountNumber: 户号
- accountName: 户主姓名
- faceAmount: 充值面额
- payAmount: 实付金额
- status: 订单状态
- progress: 进度
- remainingTime: 剩余时间
- createTime: 创建时间
- finishTime: 完成时间
- paymentMethod: 支付方式
- failReason: 失败原因

#### aftersales (售后表)
- id: 主键
- orderNumber: 订单号
- reason: 售后原因
- description: 描述
- status: 售后状态
- createTime: 创建时间
- updateTime: 更新时间

## 订单状态说明

- `pending`: 待支付
- `processing`: 充值中
- `success`: 充值成功
- `failed`: 充值失败
- `aftersale`: 售后处理中

## 开发说明

### 前端开发
- 组件位于 `frontend/src/components/`
- 页面位于 `frontend/src/views/`
- 状态管理使用Pinia，位于 `frontend/src/stores/`
- API请求封装位于 `frontend/src/api/`

### 后端开发
- 路由位于 `backend/src/routes/`
- 数据库操作位于 `backend/src/models/`
- 工具函数位于 `backend/src/utils/`

### 订单进度自动更新
后端每5秒自动更新处理中的订单进度，模拟真实的充值过程。

## 注意事项

1. 首次启动后端会自动创建数据库并插入示例数据
2. 前端通过代理访问后端API，配置在 `vite.config.js`
3. 支付接口为模拟接口，有5%的失败率
4. 订单进度会自动更新，无需手动操作

## 许可证

MIT License
