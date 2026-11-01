export interface RenewalMedia {
	url: string;
	alt?: string;
	width?: number;
	height?: number;
}

export interface RenewalOverview {
	participant_count: number;
	female_count: number;
	male_count: number;
	participant_as_of: string;
}

export interface RenewalActivityDetail {
	text: string;
}

export interface RenewalActivity {
	year: string;
	period_label: string;
	title: string;
	details: RenewalActivityDetail[];
	live_count: number;
	performer_count: number;
	photos: RenewalMedia[];
	sort_order: number;
	updatedAt: string;
}

export type ArchiveEventType = "regular" | "project" | "band";

export function getEventTypeLabel(type: ArchiveEventType): string {
	return { regular: "定期セッションライブ", project: "企画セッション", band: "対バンライブ" }[type];
}

export function formatEventDate(date?: string): string {
	if (!date) return "日程未定";
	return new Date(date).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
}

export interface RenewalArchive {
	title: string;
	subtitle?: string;
	event_type: ArchiveEventType;
	event_date: string;
	event_time?: string;
	place: string;
	performer_count: number;
	audience_count: number;
	total_count: number;
	cover_image: RenewalMedia;
	youtube_url?: string;
	sort_order: number;
	updatedAt: string;
}

export type RecruitmentPartStatus = "open" | "waitlist" | "closed";

export interface RenewalRecruitmentPart {
	part_name: string;
	status: RecruitmentPartStatus;
	note?: string;
}

export interface RenewalApplication {
	title: string;
	event_type: ArchiveEventType;
	event_date?: string;
	place?: string;
	fee?: string;
	status_message: string;
	is_closed: boolean;
	application_url?: string;
	cover_image?: RenewalMedia;
	sort_order: number;
	parts: RenewalRecruitmentPart[];
	updatedAt: string;
}

export interface RenewalApi {
	getOverview(): Promise<RenewalOverview>;
	getActivities(): Promise<RenewalActivity[]>;
	getArchives(): Promise<RenewalArchive[]>;
	getApplication(): Promise<RenewalApplication[]>;
}

export interface RenewalActivitySummary {
	live_count: number;
	performer_count: number;
	as_of_date: string;
}

export function summarizeActivities(activities: RenewalActivity[]): RenewalActivitySummary {
	return activities.reduce(
		(summary, activity) => ({
			live_count: summary.live_count + activity.live_count,
			performer_count: summary.performer_count + activity.performer_count,
			as_of_date: summary.as_of_date > activity.updatedAt ? summary.as_of_date : activity.updatedAt,
		}),
		{ live_count: 0, performer_count: 0, as_of_date: "" },
	);
}

export function selectNextApplication(applications: RenewalApplication[], now = new Date()): RenewalApplication | null {
	const nowDate = now.getTime();
	return [...applications]
		.filter((application) => application.event_date && new Date(application.event_date).getTime() >= nowDate)
		.sort((a, b) => {
			const dateDiff = new Date(a.event_date as string).getTime() - new Date(b.event_date as string).getTime();
			return dateDiff || a.sort_order - b.sort_order;
		})[0] ?? null;
}

export function selectRecruitmentForBanner(applications: RenewalApplication[], now = new Date()): RenewalApplication | null {
	const nowDate = now.getTime();
	return [...applications]
		.filter((application) => !application.is_closed && (!application.event_date || new Date(application.event_date).getTime() >= nowDate))
		.sort((a, b) => {
			if (!a.event_date) return 1;
			if (!b.event_date) return -1;
			const dateDiff = new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
			return dateDiff || a.sort_order - b.sort_order;
		})[0] ?? null;
}

export function createRenewalMockApi(): RenewalApi {
	return {
		getOverview: async () => mockOverview,
		getActivities: async () => mockActivities,
		getArchives: async () => mockArchives,
		getApplication: async () => mockApplications,
	};
}

export const renewalMockApi = createRenewalMockApi();

const image = (url: string, alt: string): RenewalMedia => ({ url, alt });

const mockOverview: RenewalOverview = {
	participant_count: 58,
	female_count: 20,
	male_count: 38,
	participant_as_of: "2026-10-01",
};

const mockActivities: RenewalActivity[] = [
	{ year: "2023", period_label: "活動開始期", title: "MuST Live Vol.1 ～ 4 を開催", details: [{ text: "春場所・対バン選集・秋場所・King Gnu Session" }], live_count: 4, performer_count: 110, photos: [image("https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=220&q=80", "2023年のライブ")], sort_order: 1, updatedAt: "2026-10-01T00:00:00.000Z" },
	{ year: "2024", period_label: "さらなる成長", title: "MuST Live Vol.5 ～ 8 を開催", details: [{ text: "春場所・ヨルシカ＆マカえん Session・秋場所" }, { text: "Acoustic Session Vol.1・対バン選集" }], live_count: 4, performer_count: 250, photos: [image("https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=220&q=80", "2024年のライブ")], sort_order: 2, updatedAt: "2026-10-01T00:00:00.000Z" },
	{ year: "2025", period_label: "活動の拡大", title: "MuST Live Vol.9 ～ 12 を開催", details: [{ text: "春場所・Studio Session Vol.1" }, { text: "ずっとまよ＆King Gnu Session・秋場所・Acoustic Session Vol.2・対バン選集" }], live_count: 4, performer_count: 410, photos: [image("https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=220&q=80", "2025年のライブ")], sort_order: 3, updatedAt: "2026-10-01T00:00:00.000Z" },
	{ year: "2026", period_label: "さらなる未来へ", title: "MuST Live Vol.13 ～ 15 を開催", details: [{ text: "春場所・ヨルシカ・UNISON SQUARE GARDEN・星街すいせい Session・秋場所" }], live_count: 3, performer_count: 540, photos: [image("https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=220&q=80", "2026年のライブ")], sort_order: 4, updatedAt: "2026-10-01T00:00:00.000Z" },
];

const mockArchives: RenewalArchive[] = [
	{ title: "MuST Live Vol.15 -秋場所-", event_type: "regular", event_date: "2026-09-12", event_time: "10:00〜16:00", place: "大塚ウェルカムバック", performer_count: 46, audience_count: 11, total_count: 57, cover_image: image("https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=500&q=85", "ライブステージ"), sort_order: 1, updatedAt: "2026-10-01T00:00:00.000Z" },
	{ title: "MuST Live Vol.14", subtitle: "-ヨルシカ・星街すいせい・UNISON SQUARE GARDEN Session-", event_type: "project", event_date: "2026-06-20", event_time: "10:00〜16:00", place: "大久保ホットショット", performer_count: 43, audience_count: 4, total_count: 47, cover_image: image("https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=500&q=85", "ライブステージ"), sort_order: 2, updatedAt: "2026-10-01T00:00:00.000Z" },
	{ title: "MuST Live Vol.13 -春場所-", event_type: "regular", event_date: "2026-03-07", event_time: "10:00〜16:00", place: "大塚ウェルカムバック", performer_count: 49, audience_count: 11, total_count: 60, cover_image: image("https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=500&q=85", "ライブステージ"), sort_order: 3, updatedAt: "2026-10-01T00:00:00.000Z" },
];

const mockApplications: RenewalApplication[] = [
	{ title: "MuST Live Vol.17 -春場所-", event_type: "regular", event_date: "2027-03-13", place: "大塚 welcome back", fee: "2,600円前後（1D別）", status_message: "パートごとの募集状況", is_closed: false, application_url: "/renewal/application/", parts: [{ part_name: "ボーカル", status: "open" }, { part_name: "ギター", status: "open" }, { part_name: "ベース", status: "waitlist" }, { part_name: "ドラム", status: "open" }, { part_name: "キーボード", status: "open" }], sort_order: 1, updatedAt: "2026-10-01T00:00:00.000Z" },
	{ title: "MuST Live Vol.18", event_type: "project", status_message: "内容が未定のため、まだ募集していません。", is_closed: true, application_url: "/renewal/application/", parts: [], sort_order: 2, updatedAt: "2026-10-01T00:00:00.000Z" },
];
