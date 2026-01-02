package com.liantuo.club.module.api.test.demo;

import com.liantuo.club.module.api.test.demo.util.ApiDemoSignUtil;
import com.liantuo.club.module.api.test.demo.util.HttpClientDemoUtil;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

public class TestPay {

	private static String appId = "EW_N2320993253"; // appId
	private static String merchantCode = "EW_N4267159134"; // 门店编码
	private static String key = "b36abe709f96f6fd4f1551a751943593"; // 密钥
	/** 商品信息 */
	private static String goodsDetail = "[{\"goodsId\":\"6901028936132\",\"goodsName\":\"娇子\",\"price\":3,\"quantity\":2},{\"goodsId\":\"20213252000255\",\"goodsName\":\"土豆\",\"price\":5,\"quantity\":1},{\"goodsId\":\"202185698565442\",\"goodsName\":\"西红柿\",\"price\":10,\"goodsWeight\":2}]";

	// 刷卡支付
	@Test
	public void testApiPay() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", System.currentTimeMillis() + "");// 订单号
		paras.put("totalAmount", "31"); // 支付总金额
		// paras.put("discountAmount", "7"); //优惠金额
		paras.put("authCode", "812447060570974460"); // 支付码（微信付款码、支付宝付款码、会员码）
		paras.put("goodsDetail", goodsDetail); // 商品
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/pay", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// POS支付
	@Test
	public void posPay() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", System.currentTimeMillis() + "");// 订单号
		paras.put("thirdTradeNo", "THR" + System.currentTimeMillis());// 第三方交易订单号
		paras.put("totalAmount", "31"); // 支付总金额
		// paras.put("discountAmount", "7"); //优惠金额
		paras.put("authCode", "812447060570974460"); // 支付码（微信付款码、支付宝付款码、会员码）
		paras.put("goodsDetail", goodsDetail); // 商品
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/posPay", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// 自定义支付
	@Test
	public void customPay() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", System.currentTimeMillis() + "");// 订单号
		paras.put("customPayId", ApiDemoSignUtil.getRandom());// 自定义支付Id
		paras.put("totalAmount", "31"); // 支付总金额
		// paras.put("discountAmount", "7"); //优惠金额
		paras.put("goodsDetail", goodsDetail); // 商品
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/customPay", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// 押金支付
	@Test
	public void preauthPay() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", System.currentTimeMillis() + "");// 订单号
		paras.put("totalAmount", "31"); // 支付总金额
		// paras.put("discountAmount", "7"); //优惠金额
		paras.put("goodsDetail", goodsDetail); // 商品
		paras.put("authCode", "812447060570974460"); // 支付码（微信付款码、支付宝付款码、会员码）
		paras.put("orderSource", "3"); // 订单来源0支付码牌 1收款插件 2APP 3接口 4银行卡 5小程序
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/preauth/pay", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// 充值并支付
	@Test
	public void precreateRechargeAndPay() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", System.currentTimeMillis() + "");// 订单号
		paras.put("rechargeAmount", "100");// 充值金额
		paras.put("totalAmount", "31"); // 支付总金额
		paras.put("payScene", "40"); // 支付场景：40公众号充值并会员支付 14支付宝充值并支付，84微信小程序充值并支付，94支付宝小程序充值并支付
		// paras.put("discountAmount", "7"); //优惠金额
		paras.put("goodsDetail", goodsDetail); // 商品
		paras.put("authCode", "812447060570974460"); // 支付码（微信付款码、支付宝付款码、会员码）
		// paras.put("subAppId", "81244s84489a4s9df"); // 小程序支付必传
		paras.put("orderSource", "3"); // 订单来源0支付码牌 1收款插件 2APP 3接口
		paras.put("openId", "s4as6d4a6sd8a9s4da1321"); // 微信支付宝用户标识(公众号充值并会员支付I必传)
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/precreateRechargeAndPay", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// 现金支付
	@Test
	public void cashPay() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", System.currentTimeMillis() + "");// 订单号
		paras.put("totalAmount", "31"); // 支付总金额
		// paras.put("discountAmount", "7"); //优惠金额
		paras.put("goodsDetail", goodsDetail); // 商品
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/cashPay", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// 支付下单
	@Test
	public void elemePay() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", System.currentTimeMillis() + "");// 订单号
		paras.put("totalAmount", "31"); // 支付总金额
		paras.put("userName", "张三"); // 登录收银机的用户名
		paras.put("payQRCodeKey", "84984198498"); // 支付二维码串
		paras.put("ip", "192.168.1.1"); // 下单机器ip
		// paras.put("discountAmount", "7"); //优惠金额
		paras.put("goodsDetail", goodsDetail); // 商品
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/elemePay", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// 聚合支付
	@Test
	public void jsPay() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", System.currentTimeMillis() + "");// 订单号
		paras.put("totalAmount", "31"); // 支付总金额
		paras.put("expireSeconds", "300"); // 二维码有效期，以秒为单位 （传0永久有效）
		// paras.put("discountAmount", "7"); //优惠金额
		paras.put("goodsDetail", goodsDetail); // 商品
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/jspay", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// 扫码支付
	@Test
	public void precreatePay() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", System.currentTimeMillis() + "");// 订单号
		paras.put("totalAmount", "31"); // 支付总金额
		paras.put("channel", "WXPAY"); // 支付渠道 WXPAY:微信 ALIPAY:支付宝 MPAY:会员 ;云闪付 UNIONPAY ;BESTPAY 翼支付 CASH现金
		paras.put("tradeType", "NATIVE"); // 交易类型 NATIVE:动态二维码 JSAPI:网页支付 MINIAPP:小程序
		paras.put("notifyUrl", "http://api.liantuofu.com/club51/club51/Notify"); // 通知回调地址
		// paras.put("discountAmount", "7"); //优惠金额
		paras.put("goodsDetail", goodsDetail); // 商品
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/precreate", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// 刷脸支付
	@Test
	public void facePay() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", System.currentTimeMillis() + "");// 订单号
		paras.put("totalAmount", "31"); // 支付总金额
		paras.put("authCode", "812447060570974460"); // 人脸付款授权码
		paras.put("channelType", "WX"); // 支付渠道：WX：微信支付 ALI支付宝 不传默认微信
		paras.put("openId", "asdf465a4s6d5f4sd1f"); // 微信/支付宝用户标识
		paras.put("orderSource", "3"); // 订单来源0支付码牌 1收款插件 2APP 3接口
		// paras.put("discountAmount", "7"); //优惠金额
		paras.put("goodsDetail", goodsDetail); // 商品
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/facePay", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

}
