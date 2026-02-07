import { env } from "../config/env";

const BRAVE_WEB_URL = "https://api.search.brave.com/res/v1/web/search";

export interface BraveWebResult {
  title: string;
  url: string;
  description: string;
  content: string;
}

export async function braveWebSearch(
  q: string,
  count: number = 5
): Promise<BraveWebResult[]> {
  const key = (env.BRAVE_KEY ?? "").trim();
  if (!key || !q.trim()) {
    return [];
  }

  const params = new URLSearchParams({ q: q.trim(), extra_snippets: "true" });
  const url = `${BRAVE_WEB_URL}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": key,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as unknown;
    const list = extractResults(data);
    return list.slice(0, count).map((r) => {
      const desc = typeof r.description === "string" ? r.description : "";
      const extras = Array.isArray(r.extra_snippets)
        ? (r.extra_snippets as string[]).filter((s): s is string => typeof s === "string")
        : [];
      const content = [desc, ...extras].filter(Boolean).join("\n\n");
      return {
        title: typeof r.title === "string" ? r.title : "",
        url: typeof r.url === "string" ? r.url : "",
        description: desc,
        content: content.trim() || desc,
      };
    });
  } catch {
    return [];
  }
}

function extractResults(data: unknown): Array<{
  title?: string;
  url?: string;
  description?: string;
  extra_snippets?: unknown;
}> {
  if (!data || typeof data !== "object") return [];
  const o = data as Record<string, unknown>;
  const web = o.web as Record<string, unknown> | undefined;
  if (!web || typeof web !== "object") return [];
  const results = web.results;
  if (!Array.isArray(results)) return [];
  return results;
}
