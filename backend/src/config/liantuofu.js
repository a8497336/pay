export const liantuofuConfig = {
  apiBaseUrl: 'https://api.liantuofu.com',
  merchantId: process.env.LIANTUOFU_MERCHANT_ID || 'EW_N9173468315',
  apiKey: process.env.LIANTUOFU_API_KEY || 'c1d7cf2a55ab1a790a1fca970749fa33',
  appId: process.env.LIANTUOFU_APP_ID || 'EW_N9173468315',
  notifyUrl: process.env.LIANTUOFU_NOTIFY_URL || 'http://localhost:5000/api/payment/notify',
  returnUrl: process.env.LIANTUOFU_RETURN_URL || 'http://localhost:3000',
  timeout: 30000
}
