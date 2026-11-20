import type { APIRoute, GetStaticPaths } from "astro";
import { Api } from "../../lib/api";

const endpoints = ["overview", "history", "archives", "application"] as const;
type Endpoint = (typeof endpoints)[number];

export const getStaticPaths: GetStaticPaths = () =>
	endpoints.map((endpoint) => ({ params: { endpoint } }));

export const GET: APIRoute = async ({ params }) => {
	const endpoint = params.endpoint as Endpoint;

	if (!endpoints.includes(endpoint)) {
		return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers: { "content-type": "application/json; charset=utf-8" } });
	}

	const data = {
		overview: await Api.getOverview(),
		history: await Api.getHistory(),
		archives: await Api.getArchives(),
		application: await Api.getApplication(),
	}[endpoint];

	const body = Array.isArray(data)
		? { contents: data, totalCount: data.length, offset: 0, limit: data.length }
		: data;

	return new Response(JSON.stringify(body), {
		headers: { "content-type": "application/json; charset=utf-8" },
	});
};
