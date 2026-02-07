import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn(
    "[LLM] OPENAI_API_KEY is not set. Check your .env file."
  );
}

export const openai = new OpenAI({
  apiKey: apiKey ?? undefined,
});
