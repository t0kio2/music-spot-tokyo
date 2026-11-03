import { createClient, type MicroCMSClient } from "microcms-js-sdk";

/**
 * 新サイト専用のmicroCMSクライアント。
 * 旧画面のsrc/lib/microcms.tsとは環境変数・クライアントを分離する。
 */
export function getRenewalMicrocmsClient(): MicroCMSClient {
	const serviceDomain = import.meta.env.RENEWAL_MICROCMS_SERVICE_DOMAIN;
	const apiKey = import.meta.env.RENEWAL_MICROCMS_API_KEY;

	if (!serviceDomain || !apiKey) {
		throw new Error(
			"RENEWAL_MICROCMS_SERVICE_DOMAIN and RENEWAL_MICROCMS_API_KEY must be set in .env",
		);
	}

	return createClient({ serviceDomain, apiKey });
}
