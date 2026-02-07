/**
 * 한 번에 검색 → Amazon 상품 하나 골라서 → 상세+리뷰 조회 후 전체 결과 출력
 * Run: npm run test:product-detail
 */
import './load-dotenv';
import { v4 as uuidv4 } from 'uuid';
import { aggregateSearch } from '../src/services/orchestrator';
import { fetchProductDetail } from '../src/services/product-detail';
import type { ProductDetailResponse } from '../src/schemas/search.schemas';

async function main() {
  const requestId = uuidv4();
  console.log('=== 1. 검색 (laptop, 소스당 3개) ===\n');

  const searchRes = await aggregateSearch(
    { query: 'laptop', locale: 'US', maxResultsPerSource: 3 },
    { requestId }
  );

  const amazonFirst = searchRes.results.find((r) => r.source === 'amazon');
  const asin = amazonFirst?.sourceId ?? 'B072MQ5BRX';

  console.log(`검색 결과 수: ${searchRes.results.length}`);
  console.log(`선택한 Amazon 상품 ASIN: ${asin}`);
  if (amazonFirst) {
    console.log(`  제목: ${amazonFirst.title}`);
    console.log(`  가격: ${amazonFirst.price ? `$${amazonFirst.price.amount}` : '-'}`);
  }
  console.log('\n=== 2. 상세 API (상품 정보 + 리뷰) ===\n');

  const detail: ProductDetailResponse = await fetchProductDetail('amazon', asin, requestId);

  // 리뷰가 비어 있으면 예시 2개 넣어서 출력 형식 보여줌
  const reviewsToShow =
    detail.reviews.length > 0
      ? detail.reviews
      : [
          { body: '(SerpAPI가 이 상품의 리뷰 텍스트를 반환하지 않았습니다. 실제로는 상품 페이지에서 확인할 수 있습니다.)', rating: undefined, author: undefined },
          { body: '예시 리뷰 형식: 제품이 좋아요.', rating: 5, author: '예시 사용자', date: '2025-01-15' },
        ];

  const output = {
    ...detail,
    reviews: reviewsToShow,
  };

  console.log(JSON.stringify(output, null, 2));
  console.log('\n--- 요약 ---');
  console.log(`제목: ${output.title}`);
  console.log(`가격: ${output.price ? `$${output.price.amount} ${output.price.currency}` : '-'}`);
  console.log(`별점: ${output.rating ?? '-'} | 리뷰 수: ${output.reviewCount ?? '-'}`);
  console.log(`상세 리뷰 개수: ${output.reviews.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
