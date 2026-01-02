package com.liantuo.club.module.api.test.demo;

import com.liantuo.club.module.api.test.demo.util.ApiDemoSignUtil;
import com.liantuo.club.module.api.test.demo.util.HttpClientDemoUtil;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

public class PayOrRefundQuery {
	private static String appId = "EW_N2320993253"; // appId
	private static String merchantCode = "EW_N4267159134"; // 门店编码
	private static String key = "b36abe709f96f6fd4f1551a751943593"; // 密钥

	// 支付检测
	@Test
	public void payQuery() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", "1635848327800");// 接入方订单号(与第三方订单号二选一)
		// paras.put("outTransactionId", System.currentTimeMillis() + "");//
		// 第三方商户订单号(与第接入方订单号二选一)
		paras.put("showType", "0");// 展示订单类型0、不返回订单详细信息 1、返回订单详细信息 不传则不展示
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/pay/query", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// 退款检测
	@Test
	public void refundQuery() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("refundNo", "HT1635846104416");// 退款请求单号
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/refund/query", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

}
