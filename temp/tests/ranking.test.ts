import { sortProducts, relevanceScore } from '../src/services/ranking';
import type { ProductItem } from '../src/schemas/search.schemas';

function item(overrides: Partial<ProductItem> = {}): ProductItem {
  return {
    source: 'amazon',
    title: 'Product',
    url: '#',
    features: [],
    fingerprint: 'fp',
    ...overrides,
  };
}

describe('relevanceScore', () => {
  it('gives higher score when query matches title', () => {
    const a = relevanceScore('laptop', item({ title: 'gaming laptop' }));
    const b = relevanceScore('laptop', item({ title: 'coffee mug' }));
    expect(a).toBeGreaterThan(b);
  });

  it('incorporates rating', () => {
    const low = relevanceScore('x', item({ title: 'x', rating: 1 }));
    const high = relevanceScore('x', item({ title: 'x', rating: 5 }));
    expect(high).toBeGreaterThan(low);
  });
});

describe('sortProducts', () => {
  it('sorts by relevance by default', () => {
    const items = [
      item({ title: 'other', fingerprint: '1' }),
      item({ title: 'exact match query', fingerprint: '2' }),
    ];
    const sorted = sortProducts(items, 'exact match', 'relevance');
    expect(sorted[0].title).toBe('exact match query');
  });

  it('sorts by price_asc', () => {
    const items = [
      item({ title: 'A', price: { amount: 100, currency: 'USD' }, fingerprint: '1' }),
      item({ title: 'B', price: { amount: 20, currency: 'USD' }, fingerprint: '2' }),
    ];
    const sorted = sortProducts(items, 'q', 'price_asc');
    expect(sorted[0].price?.amount).toBe(20);
  });

  it('sorts by price_desc', () => {
    const items = [
      item({ title: 'A', price: { amount: 20, currency: 'USD' }, fingerprint: '1' }),
      item({ title: 'B', price: { amount: 100, currency: 'USD' }, fingerprint: '2' }),
    ];
    const sorted = sortProducts(items, 'q', 'price_desc');
    expect(sorted[0].price?.amount).toBe(100);
  });

  it('sorts by rating_desc', () => {
    const items = [
      item({ title: 'A', rating: 3, fingerprint: '1' }),
      item({ title: 'B', rating: 5, fingerprint: '2' }),
    ];
    const sorted = sortProducts(items, 'q', 'rating_desc');
    expect(sorted[0].rating).toBe(5);
  });
});
