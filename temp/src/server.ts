import './load-dotenv';
import express from 'express';
import pino from 'pino';
import { env } from './config/env';
import searchRoute from './routes/search.route';

const logger = pino({
  transport:
    process.env.NODE_ENV !== 'test'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    bravesKeySet: !!(process.env.BRAVE_KEY ?? '').trim(),
  });
});

app.use('/', searchRoute);

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, mockMode: env.MOCK_MODE }, 'Server started');
});

export { app, server };
