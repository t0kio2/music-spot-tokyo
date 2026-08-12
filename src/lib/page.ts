export function pageSlugToPath(slug: string): string {
	const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
	return normalizedSlug === "home" ? "/" : `/${normalizedSlug}/`;
}
