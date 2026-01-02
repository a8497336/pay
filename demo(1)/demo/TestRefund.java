package com.liantuo.club.module.api.test.demo;

import com.liantuo.club.module.api.test.demo.util.ApiDemoSignUtil;
import com.liantuo.club.module.api.test.demo.util.HttpClientDemoUtil;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

public class TestRefund {
	private static String appId = "EW_N2320993253"; // appId
	private static String merchantCode = "EW_N4267159134"; // 门店编码
	private static String key = "b36abe709f96f6fd4f1551a751943593"; // 密钥
	/** 商品信息 */
	private static String goodsDetail = "[{\"goodsId\":\"6901028936132\",\"goodsName\":\"娇子\",\"price\":3,\"quantity\":2},{\"goodsId\":\"20213252000255\",\"goodsName\":\"土豆\",\"price\":5,\"quantity\":1},{\"goodsId\":\"202185698565442\",\"goodsName\":\"西红柿\",\"price\":10,\"goodsWeight\":2}]";

	// pos退款
	@Test
	public void testApiPay() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", "1635843846286");// 接入方订单号(与第三方订单号二选一)
		// paras.put("outTransactionId", System.currentTimeMillis() + "");//
		// 第三方商户订单号(与第接入方订单号二选一)
		paras.put("refundNo", "RT" + System.currentTimeMillis());// 退款请求单号
		paras.put("orderSource", "3");// 退款来源 0商户后台 1收款插件 2APP 3接口 4商城5小程序
		paras.put("refundAmount", "3");// 退款金额(不填按全额退款)
		paras.put("goodDetail", goodsDetail);// 商品信息
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/posRefund", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// 自定义支付退款
	@Test
	public void customPayRefund() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", "1635843846286");// 接入方订单号(与第三方订单号二选一)
		// paras.put("outTransactionId", System.currentTimeMillis() + "");//
		// 第三方商户订单号(与第接入方订单号二选一)
		paras.put("refundNo", "RT" + System.currentTimeMillis());// 退款请求单号
		paras.put("orderSource", "3");// 退款来源 0商户后台 1收款插件 2APP 3接口 4商城5小程序
		paras.put("refundAmount", "3");// 退款金额(不填按全额退款)
		paras.put("goodDetail", goodsDetail);// 商品信息
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/customPayRefund", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// 现金退款
	@Test
	public void cashRefund() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", "1635843846286");// 接入方订单号(与第三方订单号二选一)
		// paras.put("outTransactionId", System.currentTimeMillis() + "");//
		// 第三方商户订单号(与第接入方订单号二选一)
		paras.put("refundNo", "RT" + System.currentTimeMillis());// 退款请求单号
		paras.put("orderSource", "3");// 退款来源 0商户后台 1收款插件 2APP 3接口 4商城5小程序
		paras.put("refundAmount", "3");// 退款金额(不填按全额退款)
		paras.put("goodDetail", goodsDetail);// 商品信息
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/cashRefund", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// 支付下单退款
	@Test
	public void elemeRefund() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", "1635843846286");// 接入方订单号(与第三方订单号二选一)
		paras.put("refundNo", "RT" + System.currentTimeMillis());// 退款请求单号
		paras.put("userName", "张三");// 登录收银机的用户名
		paras.put("ip", "192.168.1.1");// 退款机器ip
		paras.put("refundAmount", "3");// 退款金额(不填按全额退款)
		paras.put("goodDetail", goodsDetail);// 商品信息
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/elemeRefund", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// 订单退款
	@Test
	public void orderRefund() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", "1635843846286");// 接入方订单号(与第三方订单号二选一)
		// paras.put("outTransactionId", System.currentTimeMillis() + "");//
		// 第三方商户订单号(与第接入方订单号二选一)
		paras.put("refundNo", "RT" + System.currentTimeMillis());// 退款请求单号
		paras.put("orderSource", "3");// 退款来源 0商户后台 1收款插件 2APP 3接口 4商城 5小程序
		paras.put("refundAmount", "3");// 退款金额(不填按全额退款)
		paras.put("goodDetail", goodsDetail);// 商品信息
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/refund", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}
}
