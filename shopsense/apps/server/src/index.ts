import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { openai } from "./providers/llm";
import { env } from "./config/env";
import { analyzeRoute } from "./routes/analyze";
import { chatRoute } from "./routes/chat";

const app = new Hono();
app.use("*", cors());

app.get("/health", (c) => c.json({ ok: true }));
app.route("/analyze", analyzeRoute);
app.route("/chat", chatRoute);

app.get("/verify", async (c) => {
  try {
    const models = await openai.models.list();
    return c.json({
      ok: true,
      message: "OpenAI API key is working correctly.",
      models: models.data.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json(
      { ok: false, error: message },
      { status: 401 }
    );
  }
});

const port = env.PORT;
serve({ fetch: app.fetch, port });
console.log(`Server running at http://localhost:${port}`);
