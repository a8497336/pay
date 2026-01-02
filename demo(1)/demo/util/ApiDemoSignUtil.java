package com.liantuo.club.module.api.test.demo.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;


public class ApiDemoSignUtil {

	public static Logger LOGGER = LogManager.getLogger(ApiDemoSignUtil.class);

	/** 签名校验 */
	public static String apiSign(SortedMap<String, Object> sort, String partnerKey) {
		String sign = "";
		StringBuilder signBuilder = new StringBuilder();
		StringBuilder blankBuilder = new StringBuilder();
		if (StringUtils.isNotEmpty(partnerKey) && sort != null && sort.size() > 0) {
			for (String key : sort.keySet()) {
				if (!"sign".equals(key) && !"imgData".equals(key) && sort.get(key) != null) {
					signBuilder.append(key).append("=").append(sort.get(key)).append("&");
				}
				if (StringUtils.isBlank(sort.get(key).toString())) {
					blankBuilder.append(sort.get(key));
				}
			}
		}
		if (signBuilder.length() > 0) {
			signBuilder.append("key=" + partnerKey);
			sign = MD5DemoUtil.getMD5String(signBuilder.toString());
		}
		LOGGER.info("@API签名参数:" + signBuilder.toString() + "," + " 签名:" + sign);
		if (blankBuilder.length() > 0) {
			LOGGER.info("@blankBuilder参数:" + signBuilder.toString() + "," + " 签名:" + sign + "--" + blankBuilder.toString());
		}
		return sign;
	}


	/** 签名校验 */
	public static String apiSign(Map<String, String> map, String partnerKey) {
		List<String> list = new ArrayList<String>();
		// 将价值对组成 key=value,value的格式 比存入list
		for (String key : map.keySet()) {
			if (!"sign".equals(key) && !"imgData".equals(key) && map.get(key) != null) {
				list.add(key + "=" + map.get(key));
			}
		}
		// 将list转成String数组并按照字段顺序排序
		String[] strs = list.toArray(new String[list.size()]);
		Arrays.sort(strs);

		// 将字符串数组用“&”拼接成字符串并加上partnerKey
		StringBuffer sb = new StringBuffer();
		for (int i = 0; i < strs.length; i++) {
			sb.append(strs[i] + "&");
		}
		sb.append("key=" + partnerKey);
		// 返回加密结果
		String sign = MD5DemoUtil.getMD5String(sb.toString());
		LOGGER.info("@API签名参数:" + sb.toString() + "," + " 签名:" + sign);
		return sign;
	}

	private static final String[] NUMBER = new String[] { "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" };
	/** 获取八位随机数 */
	public static String getRandom() {
		StringBuffer shortBuffer = new StringBuffer();
		String uuid = UUID.randomUUID().toString().replace("-", "");
		for (int i = 0; i < 8; i++) {
			String str = uuid.substring(i * 4, i * 4 + 4);
			int x = Integer.parseInt(str, 16);
			shortBuffer.append(NUMBER[x % 0x0a]);
		}
		return shortBuffer.toString();

	}
}
