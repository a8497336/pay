package com.liantuo.club.module.api.test.demo.util;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.MultiThreadedHttpConnectionManager;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.params.HttpConnectionManagerParams;

import java.io.IOException;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

public class HttpClientDemoUtil {
	/** 默认连接超时时间毫秒 */
	public static int SO_TIME_OUT = 20000;
	/** 默认响应超时时间毫秒 */
	public static int CONNECTION_TIME_OUT = 5000;
	private static final HttpClient http = new HttpClient(new MultiThreadedHttpConnectionManager());
	static {
		HttpConnectionManagerParams managerParams = http.getHttpConnectionManager().getParams();
		managerParams.setDefaultMaxConnectionsPerHost(100);// 每个域名最大允许100个链接并发(无限制的连接会造成服务器来不及处理和释放链接，造成客户端读取超时;连接太少会造成请求排队，响应变慢。)
		managerParams.setMaxTotalConnections(managerParams.getDefaultMaxConnectionsPerHost() * 10);// 总共允许的最大连接数，10*每个域名最大允许连接数
		new Timer("recycle-httpclient").schedule(new TimerTask() {// 每5秒回收不用的连接，释放资源
			@Override
			public void run() {
				http.getHttpConnectionManager().closeIdleConnections(5000);// 释放过去5秒内不活跃的连接（允许5秒内链接被重用）
			}
		}, 0, 5000);
	}

	/**
	 * 使用指定的字符集向给定的URL连接POST数据，延时是固定的
	 * @param urlvalue
	 * @param paras
	 * @param charset
	 * @return
	 */
	public static String requestAsHttpPOST(String urlvalue, Map<String, String> paras, String charset) {
		return requestAsHttpPOST(urlvalue, paras, charset, SO_TIME_OUT, CONNECTION_TIME_OUT);
	}

	/**
	 * 使用指定的字符集向指定的URL连接POST数据，延时可指定
	 * @param urlvalue
	 * @param paras
	 * @param charset
	 * @param timeCout
	 * @return
	 * @throws IOException
	 */
	public static String requestAsHttpPOST(String urlvalue, Map<String, String> paras, String charset, int timeCout, int connectTime) {
		HttpConnectionManagerParams managerParams = http.getHttpConnectionManager().getParams();
		managerParams.setConnectionTimeout(connectTime);
		managerParams.setSoTimeout(timeCout);
		PostMethod method = new PostMethod(urlvalue);
		method.getParams().setHttpElementCharset(charset);
		method.getParams().setContentCharset(charset);
		method.getParams().setCredentialCharset(charset);
		method.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=" + charset);
		if (paras != null && !paras.isEmpty()) {
			for (String key : paras.keySet()) {
				method.addParameter(key, paras.get(key));
			}
		}
		String result = "";
		try {
			http.executeMethod(method);
			result = method.getResponseBodyAsString();
		} catch (IOException e) {
			result = "";
			e.printStackTrace();
		}
		return result;
	}
}
