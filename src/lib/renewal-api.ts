import { getRenewalMicrocmsClient } from "./renewal-microcms";

export interface RenewalMedia {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface RenewalPageSettings {
  path: string;
  hero_images: RenewalMedia[];
  sidemenu_page_title?: string;
  title?: string;
  sub_title?: string;
  description?: string;
  seo_description?: string;
}

export interface RenewalOverview {
  participant_count: number;
  female_count: number;
  male_count: number;
  participant_as_of: string;
  logo?: RenewalMedia;
  recruiting?: RenewalRecruiting;
}

export interface RenewalRecruiting {
  message?: string;
  is_recruiting: boolean;
  image?: RenewalMedia;
}

export interface RenewalActivityDetail {
  text: string;
}

export interface RenewalActivity {
  year: string;
  period_label?: string;
  title: string;
  details: RenewalActivityDetail[];
  live_count: number;
  performer_count: number;
  photos: RenewalMedia[];
  sort_order: number;
  updatedAt: string;
}

export type ArchiveEventType = "regular" | "project" | "band";

const RENEWAL_TIME_ZONE = "Asia/Tokyo";

function getRenewalCalendarDate(value: Date): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RENEWAL_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
  return new Date(Date.UTC(values.year, values.month - 1, values.day));
}

export function getEventTypeLabel(type: ArchiveEventType): string {
  return { regular: "定期セッションライブ", project: "企画セッションライブ", band: "対バンライブ" }[type];
}

/** CMSの日付フィールドを、日本時間のカレンダー日付として扱う。 */
export function parseRenewalDate(date: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.slice(0, 10).split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  const instant = new Date(date);
  if (Number.isNaN(instant.getTime())) return new Date(Number.NaN);

  return getRenewalCalendarDate(instant);
}

export function getRenewalDateValue(date: string): number {
  return parseRenewalDate(date).getTime();
}

export function isValidRenewalDate(date: string): boolean {
  return Number.isFinite(getRenewalDateValue(date));
}

export function getRenewalDateYear(date: string): string {
  return String(parseRenewalDate(date).getUTCFullYear());
}

export function getRenewalToday(now = new Date()): Date {
  return getRenewalCalendarDate(now);
}

export function formatEventDate(date?: string): string {
  if (!date) return "日程未定";
  return formatRenewalDate(date, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function formatRenewalDate(
  date: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const formatted = parseRenewalDate(date).toLocaleDateString("ja-JP", {
    ...options,
    timeZone: "UTC",
  });
  return formatted.replace(/(?<!\d)\d(?!\d)/g, (digit) =>
    String.fromCharCode(digit.charCodeAt(0) + 0xfee0),
  );
}

export function getYoutubeThumbnail(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    const videoId =
      parsed.hostname === "youtu.be"
        ? parsed.pathname.slice(1)
        : (parsed.searchParams.get("v") ?? parsed.pathname.match(/\/shorts\/([^/]+)/)?.[1]);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : undefined;
  } catch {
    return undefined;
  }
}

export interface RenewalArchive {
  id: string;
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
  setlist: RenewalSetlistItem[];
  sort_order: number;
  updatedAt: string;
}

export interface RenewalSetlistItem {
  artist: string;
  song_title: string;
  youtube_url?: string;
}

export type RecruitmentPartStatus = "open" | "waitlist" | "closed";

export interface RenewalRecruitmentPart {
  part_name: string;
  status: RecruitmentPartStatus;
  note?: string;
}

export interface RenewalApplicationSchedule {
  practice_date?: string;
  practice_place?: string;
  practice_fee?: string;
  live_date?: string;
  setlist_select_msg?: string;
}

export interface RenewalApplicationPerformer {
  name: string;
  start_at?: string;
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
  recruit_spreadsheet_url?: string;
  flyer?: RenewalMedia;
  sort_order: number;
  parts: RenewalRecruitmentPart[];
  performers: RenewalApplicationPerformer[];
  regular_session_info: RenewalApplicationSchedule[];
}

export interface RenewalApi {
  getOverview(): Promise<RenewalOverview>;
  getHistory(): Promise<RenewalActivity[]>;
  getArchives(): Promise<RenewalArchive[]>;
  getApplication(): Promise<RenewalApplication[]>;
}

interface RenewalHistoryEvent {
  title?: string;
  record_countable?: boolean;
}

interface RenewalHistoryRecord {
  year?: string;
  title?: string;
  participants_number?: string | number;
  events?: RenewalHistoryEvent[];
  pictures?: RenewalMedia[];
  updatedAt?: string;
}

interface RenewalOverviewRecord {
  member_number?: string | number;
  female_number?: string | number;
  male_number?: string | number;
  logo?: RenewalMedia;
  recruiting?: RenewalRecruiting | RenewalRecruiting[];
  updatedAt?: string;
}

interface RenewalPageSettingsRecord {
  path?: string;
  hero_images?: RenewalMedia[];
  sidemenu_page_title?: string;
  title?: string;
  sub_title?: string;
  description?: string;
  seo_description?: string;
}

interface RenewalApplicationRecord {
  title?: string;
  flyer?: RenewalMedia;
  event_date?: string;
  event_type?: string;
  place?: string;
  fee?: string;
  regular_session_info?: RenewalApplicationSchedule | RenewalApplicationSchedule[];
  performers?: RenewalApplicationPerformer[];
  recruitment_status?: Array<{ name?: string | string[]; status?: string | string[] }>;
  recruit_spreadsheet?: string;
}

interface RenewalArchiveRecord {
  id?: string;
  title?: string;
  event_date?: string;
  event_type?: string | string[];
  place?: string;
  participants_number?: string | number;
  audience_number?: string | number;
  youtube_url?: string;
  pictures?: RenewalMedia[];
  setlist?: Array<{ artist?: string; song_title?: string; youtube_url?: string }>;
  updatedAt?: string;
}

function toBrowserMedia(media: RenewalMedia): RenewalMedia {
  if (!media.url.includes("images.microcms-assets.io")) {
    return media;
  }

  const url = new URL(media.url);
  url.searchParams.set("fm", "jpg");

  return { ...media, url: url.toString() };
}

export function normalizeRenewalPagePath(path: string): string {
  const withoutRenewalPrefix = path.replace(/^\/renewal(?=\/|$)/, "") || "/";
  const withLeadingSlash = withoutRenewalPrefix.startsWith("/")
    ? withoutRenewalPrefix
    : `/${withoutRenewalPrefix}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

let pageSettingsListPromise: Promise<RenewalPageSettings[]> | undefined;

function fetchPageSettingsList(): Promise<RenewalPageSettings[]> {
  return getRenewalMicrocmsClient()
    .getList<RenewalPageSettingsRecord>({
      endpoint: "page_settings",
      queries: { limit: 100 },
    })
    .then((response) =>
      response.contents.map((item) => ({
        path: normalizeRenewalPagePath(item.path ?? "/"),
        hero_images: (item.hero_images ?? []).map(toBrowserMedia),
        sidemenu_page_title: item.sidemenu_page_title,
        title: item.title,
        sub_title: item.sub_title,
        description: item.description,
        seo_description: item.seo_description,
      })),
    );
}

export async function getPageSettingsList(): Promise<RenewalPageSettings[]> {
  if (import.meta.env.DEV) {
    return fetchPageSettingsList();
  }

  pageSettingsListPromise ??= fetchPageSettingsList();

  return pageSettingsListPromise;
}

export async function getPageSettings(path: string): Promise<RenewalPageSettings | undefined> {
  const normalizedPath = normalizeRenewalPagePath(path);
  const settings = await getPageSettingsList();
  return settings.find((item) => item.path === normalizedPath);
}

async function getHistoryFromMicrocms(): Promise<RenewalActivity[]> {
  const response = await getRenewalMicrocmsClient().getList<RenewalHistoryRecord>({
    endpoint: "history",
    queries: { limit: 100 },
  });

  return response.contents.map((item, index) => {
    const events = item.events ?? [];
    const validEvents = events.filter((event) => event.title);
    const countableEvents = validEvents.filter((event) => event.record_countable === true);
    const performerCount = Number(item.participants_number ?? 0);

    return {
      year: item.year ?? "",
      title: item.title ?? "",
      details: validEvents.map((event) => ({ text: event.title as string })),
      live_count: countableEvents.length,
      performer_count: Number.isNaN(performerCount) ? 0 : performerCount,
      photos: (item.pictures ?? []).map(toBrowserMedia),
      sort_order: index,
      updatedAt: item.updatedAt ?? "",
    };
  });
}

function toApplicationEventType(type?: string): ArchiveEventType {
  return (
    {
      定期セッションライブ: "regular",
      企画セッションライブ: "project",
      対バンライブ: "band",
      // 旧API値も既存データのために受け付ける。
      定期セッション: "regular",
      企画ライブ: "project",
    }[type ?? ""] ?? "regular"
  );
}

function toSelectValue(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toRecruitmentStatus(status?: string | string[]): RecruitmentPartStatus {
  const value = toSelectValue(status);
  return value === "募集中" ? "open" : value === "キャンセル待ち" ? "waitlist" : "closed";
}

function toScheduleList(
  schedule?: RenewalApplicationSchedule | RenewalApplicationSchedule[],
): RenewalApplicationSchedule[] {
  if (!schedule) return [];
  return Array.isArray(schedule) ? schedule : [schedule];
}

function toNumber(value?: string | number): number {
  const number = Number(value ?? 0);
  return Number.isNaN(number) ? 0 : number;
}

function toRecruiting(
  recruiting?: RenewalRecruiting | RenewalRecruiting[],
): RenewalRecruiting | undefined {
  const value = Array.isArray(recruiting) ? recruiting[0] : recruiting;
  if (!value) return undefined;

  return {
    message: value.message,
    is_recruiting: value.is_recruiting === true,
    image: value.image ? toBrowserMedia(value.image) : undefined,
  };
}

async function getOverviewFromMicrocms(): Promise<RenewalOverview> {
  const overview = await getRenewalMicrocmsClient().getObject<RenewalOverviewRecord>({
    endpoint: "overview",
  });

  return {
    participant_count: toNumber(overview?.member_number),
    female_count: toNumber(overview?.female_number),
    male_count: toNumber(overview?.male_number),
    participant_as_of: overview?.updatedAt ?? "",
    logo: overview?.logo,
    recruiting: toRecruiting(overview?.recruiting),
  };
}

async function getApplicationFromMicrocms(): Promise<RenewalApplication[]> {
  const response = await getRenewalMicrocmsClient().getList<RenewalApplicationRecord>({
    endpoint: "application",
    queries: { limit: 100 },
  });

  return response.contents.map((item, index) => {
    const parts = (item.recruitment_status ?? [])
      .map((part) => ({ name: toSelectValue(part.name), status: part.status }))
      .filter((part): part is { name: string; status?: string | string[] } => Boolean(part.name))
      .map((part) => ({
        part_name: part.name,
        status: toRecruitmentStatus(part.status),
      }));
    const recruitSpreadsheetUrl = item.recruit_spreadsheet?.trim() || undefined;
    const isClosed =
      !recruitSpreadsheetUrl &&
      (parts.length === 0 || parts.every((part) => part.status === "closed"));

    return {
      title: item.title ?? "",
      event_type: toApplicationEventType(item.event_type),
      event_date: item.event_date,
      place: item.place,
      fee: item.fee,
      status_message: isClosed ? "現在募集していません。" : "パートごとの募集状況",
      is_closed: isClosed,
      application_url: "/renewal/application/",
      recruit_spreadsheet_url: recruitSpreadsheetUrl,
      flyer: item.flyer ? toBrowserMedia(item.flyer) : undefined,
      sort_order: index,
      parts,
      performers: (item.performers ?? []).filter((performer) => performer.name),
      regular_session_info: toScheduleList(item.regular_session_info),
    };
  });
}

async function getArchivesFromMicrocms(): Promise<RenewalArchive[]> {
  const response = await getRenewalMicrocmsClient().getList<RenewalArchiveRecord>({
    endpoint: "archive",
    queries: { limit: 100 },
  });

  return response.contents
    .filter((event): event is RenewalArchiveRecord & { id: string; event_date: string } =>
      Boolean(event.id && event.event_date && isValidRenewalDate(event.event_date)),
    )
    .sort((a, b) => getRenewalDateValue(b.event_date) - getRenewalDateValue(a.event_date))
    .map((event, index) => {
      const performerCount = toNumber(event.participants_number);
      const audienceCount = toNumber(event.audience_number);
      const coverImage = event.pictures?.[0] ?? {
        url: "",
        alt: `${event.title ?? "ライブ"}のライブ写真`,
      };
      return {
        id: event.id,
        title: event.title ?? "タイトル未設定",
        event_type: toApplicationEventType(toSelectValue(event.event_type)),
        event_date: event.event_date,
        place: event.place ?? "会場未定",
        performer_count: performerCount,
        audience_count: audienceCount,
        total_count: performerCount + audienceCount,
        cover_image: coverImage,
        youtube_url: event.youtube_url,
        setlist: (event.setlist ?? [])
          .filter((song) => song.artist || song.song_title)
          .map((song) => ({
            artist: song.artist ?? "",
            song_title: song.song_title ?? "",
            youtube_url: song.youtube_url,
          })),
        sort_order: index,
        updatedAt: event.updatedAt,
      };
    });
}

export interface RenewalActivitySummary {
  live_count: number;
  performer_count: number;
  as_of_date: string;
}

export function summarizeActivities(activities: RenewalActivity[]): RenewalActivitySummary {
  const latestActivity = [...activities].sort((a, b) => {
    const yearDiff = Number(b.year) - Number(a.year);
    return yearDiff || b.sort_order - a.sort_order;
  })[0];

  return activities.reduce(
    (summary, activity) => ({
      live_count: summary.live_count + activity.live_count,
      performer_count: latestActivity?.performer_count ?? 0,
      as_of_date: summary.as_of_date > activity.updatedAt ? summary.as_of_date : activity.updatedAt,
    }),
    { live_count: 0, performer_count: 0, as_of_date: "" },
  );
}

export function selectNextApplication(
  applications: RenewalApplication[],
  now = new Date(),
): RenewalApplication | null {
  const nowDate = getRenewalToday(now).getTime();
  return (
    [...applications]
      .filter(
        (application) =>
          application.event_date && getRenewalDateValue(application.event_date) >= nowDate,
      )
      .sort((a, b) => {
        const dateDiff =
          getRenewalDateValue(a.event_date as string) - getRenewalDateValue(b.event_date as string);
        return dateDiff || a.sort_order - b.sort_order;
      })[0] ?? null
  );
}

export function createRenewalApi(): RenewalApi {
  return {
    getOverview: getOverviewFromMicrocms,
    getHistory: getHistoryFromMicrocms,
    getArchives: getArchivesFromMicrocms,
    getApplication: getApplicationFromMicrocms,
  };
}

export const renewalApi = createRenewalApi();
