/**
 * One-off script to verify SerpAPI key and connectivity.
 * Run: npm run verify-serpapi
 * (Ensure .env has SERPAPI_API_KEY and MOCK_MODE=false)
 */
import './load-dotenv';
import { env } from '../src/config/env';
import { buildParams, serpSearch } from '../src/connectors/serpapi.client';

async function main() {
  console.log('Checking env...');
  console.log('  MOCK_MODE:', env.MOCK_MODE);
  console.log('  SERPAPI_API_KEY:', env.SERPAPI_API_KEY ? `${env.SERPAPI_API_KEY.slice(0, 8)}...` : '(missing)');
  console.log('  SERPAPI_BASE_URL:', env.SERPAPI_BASE_URL);

  if (env.MOCK_MODE) {
    console.log('\nMOCK_MODE is true — SerpAPI will not be called. Set MOCK_MODE=false to test real API.');
    process.exit(0);
    return;
  }

  if (!env.SERPAPI_API_KEY) {
    console.error('\nSERPAPI_API_KEY is required. Set it in .env');
    process.exit(1);
  }

  console.log('\nCalling SerpAPI (Amazon engine, query "laptop", limit 2)...');
  const params = buildParams(env.SERPAPI_ENGINE_AMAZON, 'laptop', 'US', 2);
  try {
    const data = await serpSearch<Record<string, unknown>>('amazon', params);
    const shopping = (data.shopping_results as unknown[]) ?? (data.organic_results as unknown[]) ?? [];
    console.log('  Status: OK');
    console.log('  Results count:', Array.isArray(shopping) ? shopping.length : 0);
    if (Array.isArray(shopping) && shopping.length > 0) {
      const first = shopping[0] as Record<string, unknown>;
      console.log('  First item title:', first.title ?? '(no title)');
    }
    console.log('\nSerpAPI is working correctly.');
  } catch (err) {
    console.error('\nSerpAPI request failed:', err instanceof Error ? err.message : err);
    if (err && typeof err === 'object' && 'response' in err) {
      const res = (err as { response?: { data?: unknown } }).response;
      if (res?.data) console.error('  Response:', JSON.stringify(res.data, null, 2));
    }
    process.exit(1);
  }
}

main();
