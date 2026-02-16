import { openai } from "../../providers/llm";
import type { ChatPayload } from "../../types/api";

const SYSTEM_PROMPT = `You are a response editor. Given the user's question and a draft answer from multiple agents, produce a concise, well-structured final response optimized for readability in a chat UI.

Rules:
- Keep it factual and relevant to the user's question.
- If the draft is empty or irrelevant, provide a general answer with clear caveats instead of asking a follow-up question.
- Use short sentences and clear section headings.
- Prefer bullet points when listing multiple items.
- Use this format when possible:
  "Answer: <one-sentence conclusion>"
  "Key reasons:"
  "- bullet"
  "- bullet"
  "Notes:"
  "- bullet (optional)"
- Do not add new sources or URLs. Use only what is already in the draft.
- Do not claim to have browsed the web or checked sources.
- You may fill small gaps with reasonable, clearly labeled inferences, but do not invent specific facts, prices, or policies.
- If you add inferred context, prefix the sentence with "Inference:" to make it explicit.`;

export async function runResponseEditor(
  payload: ChatPayload,
  draft: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify(
            {
              question: payload.question,
              draft: draft.trim() || null,
              format: "Use Markdown with line breaks. Keep each section on its own line and bullets on separate lines.",
            },
            null,
            2
          ),
        },
      ],
      max_tokens: 400,
    });
    const content = completion.choices[0]?.message?.content?.trim();
    return content || draft;
  } catch {
    return draft;
  }
}
