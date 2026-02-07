import { deduplicate, computeFingerprint, extractCoreSpecTokens } from '../src/services/dedup';
import type { ProductItem } from '../src/schemas/search.schemas';

describe('extractCoreSpecTokens', () => {
  it('extracts storage and size tokens', () => {
    expect(extractCoreSpecTokens('iPhone 128GB Storage')).toContain('128gb');
    expect(extractCoreSpecTokens('Laptop 13-inch')).toContain('13-inch');
  });
});

describe('computeFingerprint', () => {
  it('returns stable hash for same inputs', () => {
    const item: ProductItem = {
      source: 'amazon',
      title: 'Test Product',
      url: '#',
      features: [],
      fingerprint: '',
    };
    const a = computeFingerprint(item);
    const b = computeFingerprint(item);
    expect(a).toBe(b);
    expect(a).toHaveLength(32);
  });

  it('differs for different titles', () => {
    const item1: ProductItem = { source: 'amazon', title: 'Product A', url: '#', features: [], fingerprint: '' };
    const item2: ProductItem = { source: 'amazon', title: 'Product B', url: '#', features: [], fingerprint: '' };
    expect(computeFingerprint(item1)).not.toBe(computeFingerprint(item2));
  });
});

describe('deduplicate', () => {
  it('merges items with same fingerprint', () => {
    const items: ProductItem[] = [
      { source: 'amazon', title: 'Same Product', url: '#', features: [], fingerprint: '' },
      { source: 'google', title: 'Same Product', url: '#', features: [], fingerprint: '' },
    ];
    const withFp = items.map((i) => ({ ...i, fingerprint: 'abc'.padEnd(32, 'x') }));
    const result = deduplicate(withFp);
    expect(result).toHaveLength(1);
  });

  it('prefers item with price and rating', () => {
    const items: ProductItem[] = [
      { source: 'amazon', title: 'X', url: '#', features: [], fingerprint: 'fp'.padEnd(32, 'a') },
      {
        source: 'google',
        title: 'X',
        url: '#',
        features: [],
        fingerprint: 'fp'.padEnd(32, 'a'),
        price: { amount: 10, currency: 'USD' },
        rating: 4.5,
      },
    ];
    const result = deduplicate(items);
    expect(result).toHaveLength(1);
    expect(result[0].price?.amount).toBe(10);
    expect(result[0].rating).toBe(4.5);
  });
});
