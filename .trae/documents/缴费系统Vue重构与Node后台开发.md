# 缴费系统重构计划

## 📋 项目概述
将现有的HTML单页应用重构为现代化的Vue 3项目，并完善订单模块，同时开发Node.js后台接口。

## 🎯 实施步骤

### 一、前端Vue项目重构
1. **初始化Vue 3项目**
   - 使用Vite创建Vue 3项目
   - 配置项目结构和依赖（Vue Router、Pinia、Axios、Element Plus）

2. **组件拆分**
   - `RechargeForm.vue` - 充值表单组件
   - `OrderList.vue` - 订单列表组件
   - `OrderDetail.vue` - 订单详情组件
   - `PaymentModal.vue` - 支付弹窗组件
   - `WelcomeModal.vue` - 欢迎弹窗组件

3. **状态管理**
   - 使用Pinia管理全局状态
   - 订单状态管理
   - 用户状态管理

4. **路由配置**
   - 主页（充值页面）
   - 订单查询页面
   - 订单详情页面

5. **API集成**
   - 封装Axios请求
   - 连接Node后台接口

### 二、订单模块完善
1. **订单列表功能**
   - 订单展示（卡片式布局）
   - 订单筛选（全部/处理中/已完成/失败）
   - 订单搜索（订单号/户号）
   - 分页加载

2. **订单详情功能**
   - 完整订单信息展示
   - 充值进度可视化
   - 失败原因显示
   - 售后申请入口

3. **订单状态管理**
   - 实时订单进度更新
   - 状态流转（待支付→充值中→成功/失败）
   - 售后状态追踪

4. **售后功能**
   - 售后申请表单
   - 售后进度查询
   - 售后历史记录

### 三、Node.js后台开发
1. **项目初始化**
   - Express框架搭建
   - 配置CORS、Body Parser等中间件
   - 环境变量配置

2. **数据库设计**
   - 用户表（users）
   - 订单表（orders）
   - 售后表（aftersales）
   - 使用SQLite作为数据库（轻量级，易于部署）

3. **API接口开发**
   - `POST /api/orders` - 创建订单
   - `GET /api/orders` - 获取订单列表（支持筛选、搜索、分页）
   - `GET /api/orders/:id` - 获取订单详情
   - `PUT /api/orders/:id/status` - 更新订单状态
   - `POST /api/aftersales` - 申请售后
   - `GET /api/aftersales` - 获取售后列表
   - `POST /api/payment` - 模拟支付接口

4. **订单业务逻辑**
   - 订单创建和验证
   - 订单状态自动更新（模拟充值进度）
   - 订单超时处理
   - 售后流程管理

### 四、项目目录结构
```
缴费系统/
├── frontend/                 # Vue前端
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── views/          # 页面
│   │   ├── stores/         # Pinia状态
│   │   ├── api/            # API封装
│   │   ├── router/         # 路由
│   │   └── App.vue
│   └── package.json
├── backend/                 # Node后台
│   ├── src/
│   │   ├── routes/         # 路由
│   │   ├── models/         # 数据模型
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   └── server.js
│   ├── database/           # 数据库文件
│   └── package.json
└── README.md
```

## 🚀 技术栈
- **前端**: Vue 3 + Vite + Pinia + Vue Router + Axios + Element Plus
- **后端**: Node.js + Express + SQLite
- **样式**: SCSS + CSS Modules

## ✨ 主要改进点
1. 代码模块化，易于维护和扩展
2. 完善的订单管理功能
3. 真实的后台数据存储
4. RESTful API设计
5. 更好的用户体验和交互
6. 响应式设计优化