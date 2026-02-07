import OpenAI from "openai";
import { env } from "../config/env";

const apiKey = env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn(
    "[LLM] OPENAI_API_KEY is not set. Check your .env file."
  );
}

export const openai = new OpenAI({
  apiKey: apiKey ?? undefined,
});
