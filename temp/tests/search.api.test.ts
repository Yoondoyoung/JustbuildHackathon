import request from 'supertest';
import express from 'express';
import searchRoute from '../src/routes/search.route';

jest.mock('../src/services/orchestrator', () => ({
  aggregateSearch: jest.fn().mockResolvedValue({
    query: 'laptop',
    timestamp: new Date().toISOString(),
    results: [
      {
        source: 'google',
        title: 'Test Laptop',
        url: 'https://example.com/1',
        features: [],
        fingerprint: 'abc123',
      },
    ],
    meta: {
      requestId: 'test-uuid',
      latencyMs: 100,
      perSourceCounts: { amazon: 0, google: 1, walmart: 0 },
      errors: [],
      warnings: [],
    },
  }),
}));

const app = express();
app.use(express.json());
app.use('/', searchRoute);

describe('POST /search', () => {
  it('returns 200 and search response for valid body', async () => {
    const res = await request(app)
      .post('/search')
      .send({ query: 'laptop' })
      .expect(200);

    expect(res.body.query).toBe('laptop');
    expect(res.body.results).toBeDefined();
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.meta.requestId).toBeDefined();
    expect(res.body.meta.latencyMs).toBe(100);
    expect(res.body.meta.perSourceCounts).toEqual({ amazon: 0, google: 1, walmart: 0 });
  });

  it('accepts optional params', async () => {
    const res = await request(app)
      .post('/search')
      .send({
        query: 'phone',
        locale: 'US',
        maxResultsPerSource: 10,
        sort: 'price_asc',
      })
      .expect(200);
    expect(res.body.query).toBe('phone');
  });

  it('returns 400 when query is empty', async () => {
    await request(app)
      .post('/search')
      .send({ query: '' })
      .expect(400);
  });

  it('returns 400 when query is missing', async () => {
    await request(app)
      .post('/search')
      .send({})
      .expect(400);
  });
});
