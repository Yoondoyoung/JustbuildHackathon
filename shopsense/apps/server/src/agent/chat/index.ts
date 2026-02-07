import { openai } from "../../providers/llm";
import type { AnalyzeResult } from "../../types/api";
import type { NormalizedProduct } from "../../types/normalized";

type ChatPayload = {
  question: string;
  normalized?: NormalizedProduct;
  analyze?: AnalyzeResult;
};

const SYSTEM_PROMPT = `You are a helpful shopping assistant. Answer the user's question about the product using the provided context.
If the context is missing, answer generally and ask one brief follow-up question for clarification.
Keep replies concise (2-4 sentences).`;

export async function runChat(
  payload: ChatPayload
): Promise<{ message: { role: "assistant"; content: string } }> {
  const userContent = JSON.stringify(
    {
      question: payload.question,
      normalized: payload.normalized ?? null,
      analyze: payload.analyze ?? null,
    },
    null,
    2
  );

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    max_tokens: 400,
  });

  const content =
    completion.choices[0]?.message?.content?.trim() ||
    "Sorry, I could not generate a response.";
  console.log("[chat] response", content);
  return { message: { role: "assistant", content } };
}
