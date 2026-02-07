import { aggregateSearch } from '../src/services/orchestrator';
import type { SearchRequest } from '../src/schemas/search.schemas';
import * as amazonConnector from '../src/connectors/amazon.serp';
import * as googleConnector from '../src/connectors/googleShopping.serp';
import * as walmartConnector from '../src/connectors/walmart.serp';

jest.mock('../src/connectors/amazon.serp', () => ({ search: jest.fn() }));
jest.mock('../src/connectors/googleShopping.serp', () => ({
  search: jest.fn().mockResolvedValue([
    { title: 'Google Product', link: 'https://google.com/1', thumbnail: '' },
  ]),
}));
jest.mock('../src/connectors/walmart.serp', () => ({
  search: jest.fn().mockResolvedValue([
    { title: 'Walmart Product', link: 'https://walmart.com/1', thumbnail: '' },
  ]),
}));

const mockAmazon = amazonConnector.search as jest.MockedFunction<typeof amazonConnector.search>;

describe('orchestrator partial failure', () => {
  beforeEach(() => {
    mockAmazon.mockRejectedValue(new Error('Amazon down'));
  });

  it('returns results from other sources and meta.errors for failed source', async () => {
    const req: SearchRequest = {
      query: 'laptop',
      locale: 'US',
      maxResultsPerSource: 5,
      sort: 'relevance',
    };
    const res = await aggregateSearch(req, { requestId: 'test-id' });

    expect(res.meta.errors).toHaveLength(1);
    expect(res.meta.errors[0].source).toBe('amazon');
    expect(res.meta.errors[0].message).toContain('Amazon down');
    expect(res.results.length).toBeGreaterThanOrEqual(1);
    expect(res.meta.perSourceCounts.amazon).toBe(0);
    expect(res.meta.perSourceCounts.google).toBe(1);
    expect(res.meta.perSourceCounts.walmart).toBe(1);
  });
});
