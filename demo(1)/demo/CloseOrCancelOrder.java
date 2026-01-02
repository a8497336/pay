package com.liantuo.club.module.api.test.demo;

import com.liantuo.club.module.api.test.demo.util.ApiDemoSignUtil;
import com.liantuo.club.module.api.test.demo.util.HttpClientDemoUtil;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

public class CloseOrCancelOrder {
	private static String appId = "EW_N2320993253"; // appId
	private static String merchantCode = "EW_N4267159134"; // 门店编码
	private static String key = "b36abe709f96f6fd4f1551a751943593"; // 密钥

	// 关闭订单
	@Test
	public void closeOrder() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", "1635848626269");// 交易订单号
		paras.put("reason", "关闭订单");// 关单原因
		paras.put("operatorId", "1456324");// 操作员id
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/close", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

	// 撤销订单
	@Test
	public void cancelOrder() {
		Map<String, String> paras = new HashMap<String, String>();
		paras.put("random", ApiDemoSignUtil.getRandom());// 随机数
		paras.put("outTradeNo", "1635848327800");// 交易订单号
		paras.put("reason", "关闭订单");// 撤销原因
		paras.put("operatorId", "1456324");// 操作员id
		// 需要找相关人员开户获取
		paras.put("merchantCode", merchantCode); // 门店编码
		paras.put("appId", appId); // appId
		paras.put("sign", ApiDemoSignUtil.apiSign(paras, key));
		final String rspStr = HttpClientDemoUtil.requestAsHttpPOST("http://api.liantuofu.com/open/cancel", paras, "utf-8"); // httpPost请求
		System.out.println(rspStr);
	}

}
