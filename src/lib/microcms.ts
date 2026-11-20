import { createClient, type MicroCMSClient } from "microcms-js-sdk";

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
