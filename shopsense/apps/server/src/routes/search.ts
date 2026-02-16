import { Hono } from "hono";
import type { Context } from "hono";
import { aggregateSearch } from "../services/orchestrator";
import type { SearchRequest } from "../types/search";

export const searchRoute = new Hono();

function requestIdFrom(c: Context): string {
  // Best-effort: allow caller to pass a request id for tracing.
  const header = c.req.header("x-request-id")?.trim();
  return header && header.length > 0 ? header : `search-${Date.now()}`;
}

searchRoute.get("/", async (c) => {
  try {
    const q = (c.req.query("q") ?? "").trim();
    if (!q) return c.json({ error: "Missing query (q)" }, 400);

    const locale = (c.req.query("locale") ?? undefined) as string | undefined;
    const sort = (c.req.query("sort") ?? undefined) as SearchRequest["sort"];
    const maxResultsPerSourceRaw = c.req.query("maxResultsPerSource");
    const maxResultsPerSource = maxResultsPerSourceRaw
      ? Number(maxResultsPerSourceRaw)
      : undefined;

    const resp = await aggregateSearch(
      {
        query: q,
        locale,
        sort,
        maxResultsPerSource:
          Number.isFinite(maxResultsPerSource) && (maxResultsPerSource as number) > 0
            ? (maxResultsPerSource as number)
            : undefined,
      },
      { requestId: requestIdFrom(c) }
    );
    return c.json(resp);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: message }, 500);
  }
});

searchRoute.post("/", async (c) => {
  try {
    const body = await c.req.json<SearchRequest>();
    const query = (body.query ?? "").trim();
    if (!query) return c.json({ error: "Missing query" }, 400);

    const resp = await aggregateSearch(
      {
        ...body,
        query,
      },
      { requestId: requestIdFrom(c) }
    );
    return c.json(resp);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: message }, 500);
  }
});

