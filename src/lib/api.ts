import { getMicrocmsClient } from "./microcms";

export interface Media {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface PageSettings {
  path: string;
  hero_images: Media[];
  sidemenu_page_title?: string;
  title?: string;
  sub_title?: string;
  description?: string;
  seo_description?: string;
}

export interface Overview {
  participant_count: number;
  female_count: number;
  male_count: number;
  participant_as_of: string;
  logo?: Media;
  recruiting?: Recruiting;
}

export interface Recruiting {
  message?: string;
  is_recruiting: boolean;
  image?: Media;
}

export interface ActivityDetail {
  text: string;
}

export interface Activity {
  year: string;
  period_label?: string;
  title: string;
  details: ActivityDetail[];
  live_count: number;
  performer_count: number;
  photos: Media[];
  sort_order: number;
  updatedAt: string;
}

export type ArchiveEventType = "regular" | "project" | "band";

const TIME_ZONE = "Asia/Tokyo";

function getCalendarDate(value: Date): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
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
export function parseDate(date: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.slice(0, 10).split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  const instant = new Date(date);
  if (Number.isNaN(instant.getTime())) return new Date(Number.NaN);

  return getCalendarDate(instant);
}

export function getDateValue(date: string): number {
  return parseDate(date).getTime();
}

export function isValidDate(date: string): boolean {
  return Number.isFinite(getDateValue(date));
}

export function getDateYear(date: string): string {
  return String(parseDate(date).getUTCFullYear());
}

export function getToday(now = new Date()): Date {
  return getCalendarDate(now);
}

export function formatEventDate(date?: string): string {
  if (!date) return "日程未定";
  return formatDate(date, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const formatted = parseDate(date).toLocaleDateString("ja-JP", {
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

export interface Archive {
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
  cover_image: Media;
  youtube_url?: string;
  setlist: SetlistItem[];
  sort_order: number;
  updatedAt: string;
}

export interface SetlistItem {
  artist: string;
  song_title: string;
  youtube_url?: string;
}

export type RecruitmentPartStatus = "open" | "waitlist" | "closed";

export interface RecruitmentPart {
  part_name: string;
  status: RecruitmentPartStatus;
  note?: string;
}

export interface ApplicationSchedule {
  practice_date?: string;
  practice_place?: string;
  practice_fee?: string;
  setlist_select_msg?: string;
}

export interface ApplicationPerformer {
  name: string;
  start_at?: string;
}

export interface Application {
  title: string;
  event_type: ArchiveEventType;
  event_date?: string;
  event_time?: string;
  place?: string;
  fee?: string;
  status_message: string;
  is_closed: boolean;
  application_url?: string;
  recruit_spreadsheet_url?: string;
  flyer?: Media;
  sort_order: number;
  parts: RecruitmentPart[];
  performers: ApplicationPerformer[];
  regular_session_info: ApplicationSchedule[];
}

export interface Api {
  getOverview(): Promise<Overview>;
  getHistory(): Promise<Activity[]>;
  getArchives(): Promise<Archive[]>;
  getApplication(): Promise<Application[]>;
}

interface HistoryEvent {
  title?: string;
  record_countable?: boolean;
}

interface HistoryRecord {
  year?: string;
  title?: string;
  participants_number?: string | number;
  events?: HistoryEvent[];
  pictures?: Media[];
  updatedAt?: string;
}

interface OverviewRecord {
  member_number?: string | number;
  female_number?: string | number;
  male_number?: string | number;
  logo?: Media;
  recruiting?: Recruiting | Recruiting[];
  updatedAt?: string;
}

interface PageSettingsRecord {
  path?: string;
  hero_images?: Media[];
  sidemenu_page_title?: string;
  title?: string;
  sub_title?: string;
  description?: string;
  seo_description?: string;
}

interface ApplicationRecord {
  title?: string;
  flyer?: Media;
  event_date?: string;
  event_time?: string;
  event_type?: string;
  place?: string;
  fee?: string;
  regular_session_info?: ApplicationSchedule | ApplicationSchedule[];
  performers?: ApplicationPerformer[];
  recruitment_status?: Array<{ name?: string | string[]; status?: string | string[] }>;
  recruit_spreadsheet?: string;
}

interface ArchiveRecord {
  id?: string;
  title?: string;
  event_date?: string;
  event_type?: string | string[];
  place?: string;
  participants_number?: string | number;
  audience_number?: string | number;
  youtube_url?: string;
  pictures?: Media[];
  setlist?: Array<{ artist?: string; song_title?: string; youtube_url?: string }>;
  updatedAt?: string;
}

function toBrowserMedia(media: Media): Media {
  if (!media.url.includes("images.microcms-assets.io")) {
    return media;
  }

  const url = new URL(media.url);
  url.searchParams.set("fm", "jpg");

  return { ...media, url: url.toString() };
}

export function normalizePagePath(path: string): string {
  const trimmedPath = path.trim();
  if (!trimmedPath || trimmedPath === "/") return "/";

  const withoutSlashes = trimmedPath.replace(/^\/+|\/+$/g, "");
  return `/${withoutSlashes}/`;
}

let pageSettingsListPromise: Promise<PageSettings[]> | undefined;

function fetchPageSettingsList(): Promise<PageSettings[]> {
  return getMicrocmsClient()
    .getList<PageSettingsRecord>({
      endpoint: "page_settings",
      queries: { limit: 100 },
    })
    .then((response) =>
      response.contents.map((item) => ({
        path: normalizePagePath(item.path ?? "/"),
        hero_images: (item.hero_images ?? []).map(toBrowserMedia),
        sidemenu_page_title: item.sidemenu_page_title,
        title: item.title,
        sub_title: item.sub_title,
        description: item.description,
        seo_description: item.seo_description,
      })),
    );
}

export async function getPageSettingsList(): Promise<PageSettings[]> {
  if (import.meta.env.DEV) {
    return fetchPageSettingsList();
  }

  pageSettingsListPromise ??= fetchPageSettingsList();

  return pageSettingsListPromise;
}

export async function getPageSettings(path: string): Promise<PageSettings | undefined> {
  const normalizedPath = normalizePagePath(path);
  const settings = await getPageSettingsList();
  return settings.find((item) => item.path === normalizedPath);
}

async function getHistoryFromMicrocms(): Promise<Activity[]> {
  const response = await getMicrocmsClient().getList<HistoryRecord>({
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
  schedule?: ApplicationSchedule | ApplicationSchedule[],
): ApplicationSchedule[] {
  if (!schedule) return [];
  return Array.isArray(schedule) ? schedule : [schedule];
}

function toNumber(value?: string | number): number {
  const number = Number(value ?? 0);
  return Number.isNaN(number) ? 0 : number;
}

function toRecruiting(
  recruiting?: Recruiting | Recruiting[],
): Recruiting | undefined {
  const value = Array.isArray(recruiting) ? recruiting[0] : recruiting;
  if (!value) return undefined;

  return {
    message: value.message,
    is_recruiting: value.is_recruiting === true,
    image: value.image ? toBrowserMedia(value.image) : undefined,
  };
}

async function getOverviewFromMicrocms(): Promise<Overview> {
  const overview = await getMicrocmsClient().getObject<OverviewRecord>({
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

async function getApplicationFromMicrocms(): Promise<Application[]> {
  const response = await getMicrocmsClient().getList<ApplicationRecord>({
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
      event_time: item.event_time?.trim() || undefined,
      place: item.place,
      fee: item.fee,
      status_message: isClosed ? "現在募集していません。" : "パートごとの募集状況",
      is_closed: isClosed,
      application_url: "/application/",
      recruit_spreadsheet_url: recruitSpreadsheetUrl,
      flyer: item.flyer ? toBrowserMedia(item.flyer) : undefined,
      sort_order: index,
      parts,
      performers: (item.performers ?? []).filter((performer) => performer.name),
      regular_session_info: toScheduleList(item.regular_session_info),
    };
  });
}

async function getArchivesFromMicrocms(): Promise<Archive[]> {
  const response = await getMicrocmsClient().getList<ArchiveRecord>({
    endpoint: "archive",
    queries: { limit: 100 },
  });

  return response.contents
    .filter((event): event is ArchiveRecord & { id: string; event_date: string } =>
      Boolean(event.id && event.event_date && isValidDate(event.event_date)),
    )
    .sort((a, b) => getDateValue(b.event_date) - getDateValue(a.event_date))
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

export interface ActivitySummary {
  live_count: number;
  performer_count: number;
  as_of_date: string;
}

export function summarizeActivities(activities: Activity[]): ActivitySummary {
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
  applications: Application[],
  now = new Date(),
): Application | null {
  const nowDate = getToday(now).getTime();
  return (
    [...applications]
      .filter(
        (application) =>
          application.event_date && getDateValue(application.event_date) >= nowDate,
      )
      .sort((a, b) => {
        const dateDiff =
          getDateValue(a.event_date as string) - getDateValue(b.event_date as string);
        return dateDiff || a.sort_order - b.sort_order;
      })[0] ?? null
  );
}

export function createApi(): Api {
  return {
    getOverview: getOverviewFromMicrocms,
    getHistory: getHistoryFromMicrocms,
    getArchives: getArchivesFromMicrocms,
    getApplication: getApplicationFromMicrocms,
  };
}

export const Api = createApi();
