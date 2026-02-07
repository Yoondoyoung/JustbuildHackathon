/**
 * Brave API 키 및 "단점" 검색 테스트.
 * Run: npm run test-brave
 * (프로젝트 루트에서 실행, .env에 BRAVE_KEY 설정)
 */
import './load-dotenv';
import { env } from '../src/config/env';
import { braveWebSearch } from '../src/connectors/brave.client';

async function main() {
  console.log('Checking BRAVE_KEY...');
  const key = (env.BRAVE_KEY ?? process.env.BRAVE_KEY ?? '').trim();
  console.log('  BRAVE_KEY:', key ? `${key.slice(0, 8)}... (length ${key.length})` : '(missing)');

  if (!key) {
    console.error('\nBRAVE_KEY가 없습니다. .env에 BRAVE_KEY=your_key 형태로 추가하세요.');
    process.exit(1);
  }

  const query = 'soccer shoes 단점';
  console.log('\nCalling Brave Web Search:', JSON.stringify(query));
  try {
    const results = await braveWebSearch(query, 5);
    console.log('  Results count:', results.length);
    results.forEach((r, i) => {
      console.log(`  [${i + 1}] ${r.title}`);
      console.log(`      ${r.url}`);
      console.log(`      ${r.description.slice(0, 80)}...`);
    });
    if (results.length === 0) {
      console.log('  (empty - check API key and quota at https://api.search.brave.com/)');
    }
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
