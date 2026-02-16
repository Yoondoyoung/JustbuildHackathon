import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { env } from "../../config/env";

const apiKey = env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("[Gemini] GEMINI_API_KEY is not set. Check your .env file.");
}

export const gemini = apiKey
  ? new GoogleGenerativeAI(apiKey)
  : null;

/**
 * Generate content using Gemini model with optional structured output and tools.
 */
export async function generateWithGemini<T extends z.ZodTypeAny>(
  prompt: string,
  options?: {
    model?: string;
    schema?: T;
    tools?: Array<{ googleSearch?: {} } | { urlContext?: {} }>;
  }
): Promise<T extends z.ZodTypeAny ? z.infer<T> : string | undefined> {
  if (!gemini) return undefined as any;

  // SDK handles model name automatically - just pass the model name
  const modelName = options?.model || "gemini-3-pro-preview";
  const genModel = gemini.getGenerativeModel({ model: modelName });

  // Gemini responseSchema supports a limited subset of JSON Schema.
  // Strip unsupported keywords recursively to avoid 400s.
  const cleanGeminiJsonSchema = (input: unknown): unknown => {
    if (Array.isArray(input)) {
      return input.map(cleanGeminiJsonSchema);
    }
    if (!input || typeof input !== "object") return input;
    const obj = input as Record<string, unknown>;

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      // Known unsupported fields from zod-to-json-schema output:
      if (
        k === "$schema" ||
        k === "additionalProperties" ||
        k === "exclusiveMinimum" ||
        k === "exclusiveMaximum"
      ) {
        continue;
      }
      out[k] = cleanGeminiJsonSchema(v);
    }
    return out;
  };

  try {
    const generationConfig: any = {};
    const requestConfig: any = {};

    // Add structured output if schema provided
    if (options?.schema) {
      const jsonSchema = zodToJsonSchema(options.schema);
      const cleanedSchema = cleanGeminiJsonSchema(
        JSON.parse(JSON.stringify(jsonSchema))
      );
      
      generationConfig.responseMimeType = "application/json";
      generationConfig.responseSchema = cleanedSchema;
    }

    // Add tools if provided (tools go at request level, not generationConfig)
    if (options?.tools && options.tools.length > 0) {
      const toolDeclarations = options.tools.map((tool) => {
        if ("googleSearch" in tool) {
          return {
            googleSearch: {},
          };
        }
        if ("urlContext" in tool) {
          return {
            urlContext: {},
          };
        }
        return tool;
      });
      requestConfig.tools = toolDeclarations;
    }

    const result = await genModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      ...requestConfig,
    });

    const response = await result.response;
    const text = response.text();

    // Parse and validate if schema provided
    if (options?.schema) {
      const parsed = JSON.parse(text);
      return options.schema.parse(parsed) as any;
    }

    return text as any;
  } catch (err) {
    console.error("[Gemini] Error:", err);
    return undefined as any;
  }
}

/**
 * Example usage with structured output:
 * 
 * const matchSchema = z.object({
 *   winner: z.string().describe("The name of the winner."),
 *   final_match_score: z.string().describe("The final score."),
 *   scorers: z.array(z.string()).describe("The name of the scorer.")
 * });
 * 
 * const match = await generateWithGemini(
 *   "Search for all details for the latest Euro.",
 *   {
 *     model: "gemini-1.5-pro",
 *     schema: matchSchema,
 *     tools: [
 *       { googleSearch: {} },
 *       { urlContext: {} }
 *     ]
 *   }
 * );
 */

