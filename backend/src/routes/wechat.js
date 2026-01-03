import express from 'express'
import crypto from 'crypto'
import wechatPayService from '../services/wechatPayService.js'

const router = express.Router()

const wechatAuthConfig = {
  appId: wechatPayService.wechatPayConfig.appId,
  appSecret: process.env.WECHAT_APP_SECRET || 'your_app_secret_here',
  redirectUri: process.env.WECHAT_REDIRECT_URI || 'http://localhost:3000/wechat/callback'
}

router.get('/auth', (req, res) => {
  const { redirect } = req.query
  
  const state = crypto.randomBytes(16).toString('hex')
  const scope = 'snsapi_base'
  
  const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${wechatAuthConfig.appId}&redirect_uri=${encodeURIComponent(wechatAuthConfig.redirectUri)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
  
  if (redirect) {
    res.redirect(authUrl)
  } else {
    res.json({ authUrl })
  }
})

router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query
    
    if (!code) {
      return res.status(400).json({ error: '缺少授权码' })
    }
    
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wechatAuthConfig.appId}&secret=${wechatAuthConfig.appSecret}&code=${code}&grant_type=authorization_code`
    
    const response = await fetch(tokenUrl)
    const tokenData = await response.json()
    
    if (tokenData.errcode) {
      return res.status(400).json({ error: tokenData.errmsg })
    }
    
    const openid = tokenData.openid
    const accessToken = tokenData.access_token
    
    const redirectUrl = `${wechatAuthConfig.redirectUri}?openid=${openid}&access_token=${accessToken}`
    
    res.redirect(redirectUrl)
  } catch (error) {
    console.error('WeChat auth callback error:', error)
    res.status(500).json({ error: '授权回调处理失败' })
  }
})

router.get('/userinfo', async (req, res) => {
  try {
    const { openid, access_token } = req.query
    
    if (!openid || !access_token) {
      return res.status(400).json({ error: '缺少必要参数' })
    }
    
    const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
    
    const response = await fetch(userInfoUrl)
    const userInfo = await response.json()
    
    if (userInfo.errcode) {
      return res.status(400).json({ error: userInfo.errmsg })
    }
    
    res.json({
      success: true,
      openid: userInfo.openid,
      nickname: userInfo.nickname,
      headimgurl: userInfo.headimgurl
    })
  } catch (error) {
    console.error('WeChat userinfo error:', error)
    res.status(500).json({ error: '获取用户信息失败' })
  }
})

export default router
