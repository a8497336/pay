import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const openid = ref(localStorage.getItem('wechat_openid') || '')
  const accessToken = ref(localStorage.getItem('wechat_access_token') || '')

  const setOpenid = (newOpenid) => {
    openid.value = newOpenid
    if (newOpenid) {
      localStorage.setItem('wechat_openid', newOpenid)
    } else {
      localStorage.removeItem('wechat_openid')
    }
  }

  const setAccessToken = (newToken) => {
    accessToken.value = newToken
    if (newToken) {
      localStorage.setItem('wechat_access_token', newToken)
    } else {
      localStorage.removeItem('wechat_access_token')
    }
  }

  const clearAuth = () => {
    setOpenid('')
    setAccessToken('')
  }

  const isWechatBrowser = () => {
    const ua = navigator.userAgent.toLowerCase()
    return ua.indexOf('micromessenger') !== -1
  }

  const redirectToWechatAuth = () => {
    const redirectUri = encodeURIComponent(window.location.origin + '/wechat/callback')
    const state = Math.random().toString(36).substr(2, 16)
    const appId = 'wx5d360e8e1f8459cb'
    const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`
    window.location.href = authUrl
  }

  const checkAndRequestAuth = () => {
    if (!openid.value && isWechatBrowser()) {
      redirectToWechatAuth()
      return false
    }
    return true
  }

  return {
    openid,
    accessToken,
    setOpenid,
    setAccessToken,
    clearAuth,
    isWechatBrowser,
    redirectToWechatAuth,
    checkAndRequestAuth
  }
})
