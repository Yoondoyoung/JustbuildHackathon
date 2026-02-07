import { normalize } from '../src/services/normalization';

describe('normalization', () => {
  it('maps title, link, thumbnail to ProductItem', () => {
    const raw = {
      title: 'Test Product',
      link: 'https://example.com/p/1',
      thumbnail: 'https://example.com/img.jpg',
    };
    const out = normalize('amazon', raw);
    expect(out.source).toBe('amazon');
    expect(out.title).toBe('Test Product');
    expect(out.url).toBe('https://example.com/p/1');
    expect(out.imageUrl).toBe('https://example.com/img.jpg');
    expect(out.fingerprint).toBe('');
  });

  it('parses price string with $', () => {
    const raw = { title: 'X', link: '#', price: '$29.99' };
    const out = normalize('google', raw);
    expect(out.price).toEqual({ amount: 29.99, currency: 'USD' });
  });

  it('parses numeric price', () => {
    const raw = { title: 'X', link: '#', extracted_price: 19.5 };
    const out = normalize('google', raw);
    expect(out.price).toEqual({ amount: 19.5, currency: 'USD' });
  });

  it('maps rating and review_count', () => {
    const raw = { title: 'X', link: '#', rating: 4.5, review_count: 120 };
    const out = normalize('walmart', raw);
    expect(out.rating).toBe(4.5);
    expect(out.reviewCount).toBe(120);
  });

  it('extracts features from extensions', () => {
    const raw = {
      title: 'X',
      link: '#',
      extensions: ['Feature A', 'Feature B'],
    };
    const out = normalize('amazon', raw);
    expect(out.features).toEqual(['Feature A', 'Feature B']);
  });

  it('uses name when title missing', () => {
    const raw = { name: 'Product Name', link: '#' };
    const out = normalize('amazon', raw);
    expect(out.title).toBe('Product Name');
  });

  it('returns unknown availability when not specified', () => {
    const raw = { title: 'X', link: '#' };
    const out = normalize('amazon', raw);
    expect(out.availability).toBe('unknown');
  });
});
