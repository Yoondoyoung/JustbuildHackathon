import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { searchRequestSchema, productDetailRequestSchema } from '../schemas/search.schemas';
import { aggregateSearch } from '../services/orchestrator';
import { fetchProductDetail } from '../services/product-detail';
import { braveWebSearch } from '../connectors/brave.client';
import pino from 'pino';

const router = Router();
const logger = pino({ name: 'search.route' });

/** 상품 전체 제목에서 Brave 검색용 모델 쿼리만 추출 (앞 6단어, 구체적 모델명 위주) */
function toModelQuery(fullTitle: string | undefined): string {
  if (!fullTitle || typeof fullTitle !== 'string') return '';
  const words = fullTitle.trim().split(/\s+/).filter(Boolean);
  const take = Math.min(words.length, 6);
  return words.slice(0, take).join(' ').trim();
}

router.post('/search', async (req: Request, res: Response): Promise<void> => {
  const requestId = uuidv4();

  const parsed = searchRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten(),
    });
    return;
  }

  const searchReq = parsed.data;
  try {
    const response = await aggregateSearch(searchReq, { requestId });
    res.status(200).json(response);
  } catch (err) {
    logger.error({ requestId, err });
    res.status(500).json({
      error: 'Internal server error',
      requestId,
    });
  }
});

/** 검색 후 Amazon 상위 5개 상품의 상세+리뷰를 한 번에 반환. (기존 /search는 변경 없음) */
router.post('/search/amazon-top-reviews', async (req: Request, res: Response): Promise<void> => {
  const requestId = uuidv4();

  const parsed = searchRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten(),
    });
    return;
  }

  const searchReq = parsed.data;
  try {
    const searchRes = await aggregateSearch(searchReq, { requestId });
    const amazonTop5 = (searchRes.results || [])
      .filter((p: { source?: string; sourceId?: string }) => p.source === 'amazon' && p.sourceId)
      .slice(0, 5);

    const details = await Promise.all(
      amazonTop5.map((p: { sourceId: string }) => fetchProductDetail('amazon', p.sourceId, requestId))
    );

    // 각 Amazon 상품별로 Brave "장단점" 검색 → consSearchResults에 반드시 채움 (실패 시 짧은 쿼리로 재시도)
    const braveKey = (process.env.BRAVE_KEY ?? '').trim();
    const hasBraveKey = !!braveKey;
    logger.info({ requestId, hasBraveKey }, 'Brave pros/cons search per product');
    const productsWithCons = await Promise.all(
      details.map(async (d) => {
        const fullTitle = typeof d.title === 'string' ? d.title.trim() : '';
        const modelQuery = toModelQuery(d.title) || fullTitle.slice(0, 80);
        const query = modelQuery ? `${modelQuery} pros and cons` : '';
        let consSearchResults: Array<{ title: string; url: string; description: string; content: string }> = [];
        if (query && hasBraveKey) {
          consSearchResults = await braveWebSearch(query, 5);
          if (consSearchResults.length === 0 && fullTitle) {
            const fallbackQuery = fullTitle.split(/\s+/).slice(0, 3).join(' ') + ' pros and cons';
            if (fallbackQuery.length > 4) {
              consSearchResults = await braveWebSearch(fallbackQuery, 5);
            }
          }
        }
        return { ...d, consSearchResults };
      })
    );

    res.status(200).json({
      query: searchReq.query,
      products: productsWithCons,
      meta: { requestId, latencyMs: searchRes.meta?.latencyMs },
    });
  } catch (err) {
    logger.error({ requestId, err });
    res.status(500).json({
      error: 'Internal server error',
      requestId,
    });
  }
});

/** Product detail + reviews (Amazon: sourceId = ASIN). */
router.post('/product/detail', async (req: Request, res: Response): Promise<void> => {
  const requestId = uuidv4();

  const parsed = productDetailRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten(),
    });
    return;
  }

  const { source, sourceId } = parsed.data;
  try {
    const response = await fetchProductDetail(source, sourceId, requestId);
    res.status(200).json(response);
  } catch (err) {
    logger.error({ requestId, source, sourceId, err });
    res.status(500).json({
      error: 'Internal server error',
      requestId,
    });
  }
});

export default router;
