# 联拓富支付接口对接文档

## 概述

本项目已对接联拓富支付接口，支持微信支付和支付宝支付。

## 配置说明

### 1. 环境变量配置

在 `backend` 目录下创建 `.env` 文件，配置以下参数：

```env
LIANTUOFU_MERCHANT_ID=your_merchant_id_here
LIANTUOFU_API_KEY=your_api_key_here
LIANTUOFU_NOTIFY_URL=http://your-domain.com/payment/notify
LIANTUOFU_RETURN_URL=http://your-domain.com/payment/return
```

### 2. 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| LIANTUOFU_MERCHANT_ID | 联拓富商户ID | 1234567890 |
| LIANTUOFU_API_KEY | 联拓富API密钥 | abcdefghijklmnopqrstuvwxyz123456 |
| LIANTUOFU_NOTIFY_URL | 支付回调通知地址 | http://your-domain.com/api/payment/notify |
| LIANTUOFU_RETURN_URL | 支付返回地址 | http://your-domain.com/payment/return |

## API 接口

### 1. 创建支付订单

**接口地址**: `POST /api/payment`

**请求参数**:

```json
{
  "faceAmount": 1000,
  "payAmount": 1000,
  "paymentMethod": "wechat",
  "orderData": {
    "type": "fast",
    "typeName": "电费快充",
    "province": "guangdong",
    "city": "广州市",
    "accountNumber": "1234567890123"
  }
}
```

**响应示例**:

```json
{
  "success": true,
  "orderNumber": "D1234567890ABCD",
  "payUrl": "https://pay.liantuofu.com/xxx",
  "qrCode": "data:image/png;base64,xxx",
  "tradeNo": "LT202401011234567890",
  "message": "支付订单创建成功"
}
```

### 2. 查询支付状态

**接口地址**: `POST /api/payment/query`

**请求参数**:

```json
{
  "orderNumber": "D1234567890ABCD"
}
```

**响应示例**:

```json
{
  "success": true,
  "tradeStatus": "SUCCESS",
  "totalAmount": 1000,
  "tradeNo": "LT202401011234567890",
  "payTime": "2024-01-01 12:00:00"
}
```

### 3. 支付回调通知

**接口地址**: `POST /api/payment/notify`

**说明**: 此接口由联拓富服务器主动调用，用于通知支付结果

## 支付流程

1. 用户在前端选择充值金额和支付方式
2. 前端调用 `/api/payment` 接口创建支付订单
3. 后端调用联拓富API创建支付订单
4. 返回支付链接或二维码给前端
5. 用户完成支付
6. 联拓富服务器调用 `/api/payment/notify` 回调通知支付结果
7. 后端更新订单状态

## 支付状态说明

| 状态 | 说明 |
|------|------|
| pending | 待支付 |
| processing | 支付处理中 |
| completed | 支付成功 |
| failed | 支付失败 |

## 注意事项

1. **回调地址**: 确保回调地址可以从外网访问
2. **签名验证**: 所有接口调用都需要进行签名验证
3. **订单号**: 订单号必须唯一，建议使用时间戳+随机数
4. **金额**: 金额单位为分，需要乘以100
5. **超时时间**: 支付订单默认超时时间为30分钟

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0000 | 成功 |
| 9999 | 系统错误 |
| 1001 | 参数错误 |
| 1002 | 签名验证失败 |
| 1003 | 订单不存在 |
| 1004 | 支付失败 |

## 测试

### 测试环境

联拓富提供测试环境，可以使用测试商户ID和API密钥进行测试。

### 测试流程

1. 配置测试环境参数
2. 创建测试订单
3. 模拟支付回调
4. 验证订单状态更新

## 安全建议

1. 不要在前端暴露API密钥
2. 使用HTTPS协议
3. 定期更换API密钥
4. 对敏感数据进行加密
5. 记录所有支付操作日志

## 技术支持

如有问题，请联系联拓富技术支持或查看官方文档：
- 官方文档: https://www.showdoc.com.cn/liantuofu
- 技术支持: support@liantuofu.com
