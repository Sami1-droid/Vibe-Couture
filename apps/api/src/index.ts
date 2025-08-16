import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pino from 'pino';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient as createRedisClient } from 'redis';
import { router as apiRouter } from './routes/index.js';
import { attachSocketHandlers } from './sockets/index.js';

const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });

const app = express();
app.set('trust proxy', true);
app.use(helmet());
// Stripe webhook: must use raw body before JSON parser
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Minimal request logging
app.use((req, res, next) => {
	const start = Date.now();
	res.on('finish', () => {
		logger.info({ method: req.method, url: req.originalUrl, status: res.statusCode, ms: Date.now() - start });
	});
	next();
});

app.use('/api/v1', apiRouter);
app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));

const server = http.createServer(app);

// Socket.io server for realtime updates
const io = new SocketIOServer(server, {
	path: '/api/ws',
	cors: { origin: false },
	connectionStateRecovery: {},
});

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = createRedisClient({ url: redisUrl });
const subClient = createRedisClient({ url: redisUrl });
await pubClient.connect();
await subClient.connect();
io.adapter(createAdapter(pubClient, subClient));

attachSocketHandlers(io, logger);

const port = Number(process.env.API_PORT || 4000);
server.listen(port, () => {
	logger.info({ port }, 'API server listening');
});