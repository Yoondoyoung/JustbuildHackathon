# Product Search API

Node.js + TypeScript backend that aggregates product search results from **Amazon**, **Google Shopping**, and **Walmart** using **SerpAPI** only (no scraping, no official platform APIs).

## Features

- **Connectors**: SerpAPI-based clients per source (Amazon, Google Shopping, Walmart)
- **Orchestration**: `Promise.allSettled` for parallel calls; partial success returns 200 with `meta.errors`
- **Normalization**: Map SerpAPI raw fields to a unified `ProductItem` schema
- **Dedup**: Fingerprint (title + brand + model + core specs), group by fingerprint, pick representative by richness
- **Ranking**: Jaccard similarity + rating/review/price; sort by relevance, price_asc, price_desc, rating_desc
- **Caching**: In-memory LRU cache with TTL (key = hash of query + locale + filters + sort + limit)
- **Retries**: Configurable retries for 429, 5xx, timeouts with exponential backoff + jitter
- **Logging**: Pino with requestId, query, per-source counts, latency
- **Validation**: Zod for request body and env

## Stack

- Node 20+, TypeScript
- Express, zod, axios, pino, lru-cache, uuid
- Jest + supertest for tests

## Setup

1. **Clone / open project**
   ```bash
   cd product-search-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment**
   - Copy `.env.example` to `.env`
   - Set `SERPAPI_API_KEY` (get one at [serpapi.com](https://serpapi.com/))
   - For local dev without a key, set `MOCK_MODE=true` to use hardcoded sample results per connector

   ```bash
   cp .env.example .env
   # Edit .env: SERPAPI_API_KEY=your_key
   # Or: MOCK_MODE=true
   ```

4. **Build**
   ```bash
   npm run build
   ```

5. **Run**
   ```bash
   npm run dev    # dev with tsx watch
   # or
   npm start      # run compiled dist/server.js
   ```

6. **Test**
   ```bash
   npm test       # Jest with coverage (uses MOCK_MODE internally)
   ```

## SerpAPI 동작 확인 (테스트 방법)

API 키를 넣었을 때 SerpAPI가 정상 동작하는지 확인하려면 아래 순서대로 진행하면 됩니다.

### 1단계: 환경 설정

1. **프로젝트 폴더로 이동**
   ```bash
   cd product-search-api
   ```

2. **`.env` 파일 확인**
   - `.env`가 없으면 `.env.example`을 복사해서 만듭니다.
     ```bash
     cp .env.example .env
     ```
   - `.env`를 열어 다음 두 값을 설정합니다.
     - `SERPAPI_API_KEY=여기에_본인_SerpAPI_키_입력`
     - `MOCK_MODE=false` (실제 API 호출하려면 반드시 `false`)

3. **의존성 설치** (아직 안 했다면)
   ```bash
   npm install
   ```

### 2단계: 검증 스크립트 실행

터미널에서 한 번만 실행하는 검증 스크립트를 돌립니다.

```bash
npm run verify-serpapi
```

- **성공 시** 예시:
  ```
  Checking env...
    MOCK_MODE: false
    SERPAPI_API_KEY: ab12cd34...
    SERPAPI_BASE_URL: https://serpapi.com/search.json

  Calling SerpAPI (Amazon engine, query "laptop", limit 2)...
    Status: OK
    Results count: 2
    First item title: Some Laptop Product Name...

  SerpAPI is working correctly.
  ```

- **실패 시** 예시:
  - `SERPAPI_API_KEY is required` → `.env`에 `SERPAPI_API_KEY`를 넣었는지, 키 앞뒤에 공백/따옴표가 없는지 확인.
  - `Invalid API key` / `401` → [serpapi.com](https://serpapi.com/)에서 키가 유효한지, 할당량이 남아 있는지 확인.
  - `ECONNREFUSED` / `ETIMEDOUT` → 인터넷 연결·방화벽 확인.

### 3단계: 서버 띄우고 API로 검색 테스트 (선택)

실제 검색 API까지 확인하려면:

1. **서버 실행**
   ```bash
   npm run dev
   ```

2. **다른 터미널에서 검색 요청**
   ```bash
   curl -X POST http://localhost:3000/search -H "Content-Type: application/json" -d "{\"query\":\"laptop\",\"locale\":\"US\",\"maxResultsPerSource\":3}"
   ```
   Windows PowerShell이라면:
   ```powershell
   Invoke-RestMethod -Method Post -Uri "http://localhost:3000/search" -ContentType "application/json" -Body '{"query":"laptop","locale":"US","maxResultsPerSource":3}'
   ```

3. **응답 확인**
   - `results` 배열에 Amazon·Google·Walmart 등 소스별 상품이 들어오면 SerpAPI 연동이 정상입니다.
   - `meta.errors`에 메시지가 있으면 해당 소스만 실패한 것이므로, 키·할당량·엔진 이름을 확인하면 됩니다.

정리하면, **가장 빠른 확인**은 `npm run verify-serpapi` 한 번 실행해서 `SerpAPI is working correctly.`가 나오는지 보는 것입니다.

## Env vars (Zod-validated)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SERPAPI_API_KEY` | Yes (unless `MOCK_MODE=true`) | - | SerpAPI key |
| `SERPAPI_BASE_URL` | No | `https://serpapi.com/search.json` | SerpAPI endpoint |
| `SERPAPI_ENGINE_GOOGLE_SHOPPING` | No | `google_shopping` | Engine for Google |
| `SERPAPI_ENGINE_AMAZON` | No | `amazon` | Engine for Amazon |
| `SERPAPI_ENGINE_WALMART` | No | `walmart` | Engine for Walmart |
| `PER_SOURCE_TIMEOUT_MS` | No | `6000` | HTTP timeout per source |
| `RETRY_MAX` | No | `2` | Retry count for 429/5xx/timeouts |
| `CACHE_TTL_MS` | No | `1800000` | Cache TTL (ms) |
| `DEBUG_RAW` | No | `false` | Include `raw` on each ProductItem |
| `MOCK_MODE` | No | `false` | If true, skip SerpAPI and return sample data |
| `PORT` | No | `3000` | Server port |

## API

### POST /search

**Request body (JSON)**

- `query` (string, required): Search query
- `locale` (string, default `"US"`)
- `maxResultsPerSource` (number, 1–20, default `5`)
- `priceMin`, `priceMax` (number, optional)
- `condition` (optional): `"new"` \| `"used"` \| `"refurb"`
- `sort` (default `"relevance"`): `"relevance"` \| `"price_asc"` \| `"price_desc"` \| `"rating_desc"`

**Response (200)**

```json
{
  "query": "laptop",
  "timestamp": "2025-02-07T12:00:00.000Z",
  "results": [
    {
      "source": "google",
      "sourceId": "...",
      "title": "...",
      "brand": "...",
      "model": "...",
      "price": { "amount": 99.99, "currency": "USD" },
      "listPrice": { "amount": 129.99, "currency": "USD" },
      "rating": 4.5,
      "reviewCount": 120,
      "availability": "in_stock",
      "shipping": { "cost": 0, "etaDays": 2, "primeLike": true },
      "url": "https://...",
      "imageUrl": "https://...",
      "features": ["..."],
      "fingerprint": "..."
    }
  ],
  "meta": {
    "requestId": "uuid",
    "latencyMs": 450,
    "perSourceCounts": { "amazon": 5, "google": 5, "walmart": 4 },
    "errors": [],
    "warnings": []
  }
}
```

Validation errors return **400**. Server errors return **500**.

## Project structure

```
src/
  server.ts              # Express app + listen
  routes/search.route.ts # POST /search, zod, requestId, orchestrator
  schemas/search.schemas.ts
  services/
    orchestrator.ts      # cache get → allSettled → normalize → dedup → rank → cache set
    normalization.ts    # raw → ProductItem
    dedup.ts            # fingerprint, group, representative
    ranking.ts          # relevance score + sort modes
    cache.ts            # LRU keyed by query+locale+filters+sort+limit
  connectors/
    serpapi.client.ts   # buildParams, serpSearch (httpRequest)
    amazon.serp.ts
    googleShopping.serp.ts
    walmart.serp.ts
  utils/
    http.ts             # axios timeout, retry, backoff, SourceRequestError
    text.ts             # normalizeText, tokenize
    ids.ts              # stableHash, cacheKey
    time.ts             # nowISO, timer
    errors.ts           # SourceRequestError, toSourceError
  config/env.ts         # zod-validated env
tests/
  search.api.test.ts    # supertest POST /search
  normalization.test.ts
  dedup.test.ts
  ranking.test.ts
  orchestrator.partial.test.ts  # one connector rejects, 200 + meta.errors
```

## How to use this code in your project

1. **Run as a standalone service**
   - Use the repo as-is: `npm run dev` or `npm start`, call `POST http://localhost:3000/search` with a JSON body.

2. **Mount in another Express app**
   - `import searchRoute from './product-search-api/src/routes/search.route'; app.use('/api', searchRoute);`
   - Ensure env vars are set (or use `dotenv` in your app).

3. **Reuse modules**
   - `import { aggregateSearch } from './product-search-api/src/services/orchestrator';`
   - Call `aggregateSearch(req, { requestId })` with a validated `SearchRequest` and use the returned `SearchResponse`.

4. **Use with real SerpAPI**
   - Set `SERPAPI_API_KEY` in `.env` and leave `MOCK_MODE=false` (default).
   - Responses will be live from SerpAPI (subject to SerpAPI quotas and pricing).

5. **Run tests in CI**
   - `npm test` (setup forces `MOCK_MODE=true` and a test key so no real API calls).
