import { env } from '../config/env';
import type { ReviewItem } from '../schemas/search.schemas';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export interface ProductInfoForReviews {
  title: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
}

/**
 * 상품 정보만 있을 때 OpenAI로 상위 5개 리뷰를 생성. OPENAI_API_KEY 필요.
 */
export async function generateReviews(product: ProductInfoForReviews): Promise<ReviewItem[]> {
  if (!env.OPENAI_API_KEY) return [];
  const { title, description = '', rating, reviewCount } = product;
  const context = [
    `상품명: ${title}`,
    description ? `설명: ${description.slice(0, 500)}` : '',
    rating != null ? `평균 별점: ${rating}` : '',
    reviewCount != null ? `리뷰 수: ${reviewCount}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `다음 상품에 대한 구매자 리뷰 5개를 짧게 생성해 주세요. 각 리뷰는 1~3문장, 한국어로, 자연스러운 말투로.\n\n${context}\n\nJSON 배열로만 답하세요. 각 항목: { "body": "리뷰 본문", "rating": 숫자(1~5), "author": "이름" }. 예: [{"body":"...","rating":5,"author":"김**"}]`,
        },
      ],
      max_tokens: 800,
    }),
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = json.choices?.[0]?.message?.content?.trim() ?? '';
  try {
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    const out: ReviewItem[] = [];
    for (const x of parsed.slice(0, 5)) {
      if (!x || typeof x !== 'object') continue;
      const o = x as Record<string, unknown>;
      const body = typeof o.body === 'string' ? o.body.trim() : '';
      if (!body) continue;
      out.push({
        body,
        rating: typeof o.rating === 'number' ? o.rating : undefined,
        author: typeof o.author === 'string' ? o.author.trim() : undefined,
      });
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * 리뷰 텍스트들을 OpenAI로 요약. OPENAI_API_KEY가 없으면 undefined 반환.
 */
export async function summarizeReviews(reviewBodies: string[]): Promise<string | undefined> {
  if (!env.OPENAI_API_KEY || reviewBodies.length === 0) return undefined;
  const text = reviewBodies.join('\n\n').slice(0, 6000);
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `아래는 상품 리뷰들입니다. 2~4문장으로 핵심만 한국어로 요약해 주세요.\n\n${text}`,
        },
      ],
      max_tokens: 300,
    }),
  });
  if (!res.ok) return undefined;
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content?.trim();
  return content || undefined;
}
