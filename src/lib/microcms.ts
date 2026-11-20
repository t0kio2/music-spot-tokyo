import { createClient, type MicroCMSClient } from "microcms-js-sdk";

/**
 * 新サイト専用のmicroCMSクライアント。
 * 旧画面のsrc/lib/microcms.tsとは環境変数・クライアントを分離する。
 */
export function getMicrocmsClient(): MicroCMSClient {
	const serviceDomain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
	const apiKey = import.meta.env.MICROCMS_API_KEY;

	if (!serviceDomain || !apiKey) {
		throw new Error(
			"MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY must be set in .env",
		);
	}

	return createClient({ serviceDomain, apiKey });
}

interface Faq {
	id: string;
	question: string;
	answer: string;
}

export async function getFaqList(): Promise<Faq[]> {
	const response = await getMicrocmsClient().getList<Faq>({
		endpoint: "faq",
		queries: { limit: 100 },
	});
	return response.contents;
}
