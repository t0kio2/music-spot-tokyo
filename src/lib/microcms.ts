import { createClient } from "microcms-js-sdk";

const serviceDomain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = import.meta.env.MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
	throw new Error("MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY must be set in .env");
}

export const client = createClient({ serviceDomain, apiKey });

export interface Page {
	id: string;
	title: string;
	slug: string;
	content?: string;
	page_type: ("static" | "dynamic")[];
	api_last_path?: string;
}

export interface Faq {
	id: string;
	question: string;
	answer: string;
}

export interface ScheduleItem {
	fieldId: string;
	title: string;
	event_date: string;
	content: string;
}

export interface ScheduleAndArchive {
	schedules: ScheduleItem[];
	past_songs_url: string;
	youtube_url: string;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
	const res = await client.getList<Page>({
		endpoint: "pages",
		queries: { filters: `slug[equals]${slug}`, limit: 1 },
	});
	return res.contents[0] ?? null;
}

export async function getFaqList(): Promise<Faq[]> {
	const res = await client.getList<Faq>({
		endpoint: "faq",
		queries: { limit: 100 },
	});
	return res.contents;
}

export async function getScheduleAndArchive(): Promise<ScheduleAndArchive> {
	return client.get<ScheduleAndArchive>({ endpoint: "schedule_and_archive" });
}

/** Resolves a dynamic page's linked endpoint name from its `api_last_path` (e.g. "/faq" -> "faq"). */
export function resolveEndpoint(page: Page): string {
	if (!page.api_last_path) {
		throw new Error(`Page "${page.slug}" has no api_last_path`);
	}
	return page.api_last_path.replace(/^\/+/, "");
}
