import type { Server as IOServer } from 'socket.io';
import type pino from 'pino';
import { getRedis } from '../util/redis.js';

export function attachSocketHandlers(io: IOServer, logger: pino.Logger) {
	const redis = getRedis();

	io.on('connection', (socket) => {
		const userId = socket.handshake.auth?.userId as string | undefined;
		const role = socket.handshake.auth?.role as 'RIDER' | 'DRIVER' | undefined;
		if (!userId || !role) {
			logger.warn({ sid: socket.id }, 'Socket missing auth info');
			return socket.disconnect();
		}
		socket.join(`${role}:${userId}`);

		if (role === 'DRIVER') {
			socket.on('driver:online', async () => {
				await redis.hSet('drivers:sockets', userId, socket.id);
			});
			socket.on('driver:offline', async () => {
				await redis.hDel('drivers:sockets', userId);
				await redis.zRem('drivers:available', userId);
			});
			socket.on('driver:location:update', async (payload: { lat: number; lng: number }) => {
				if (typeof payload?.lat === 'number' && typeof payload?.lng === 'number') {
					await redis.geoAdd('drivers:available', [{ longitude: payload.lng, latitude: payload.lat, member: userId }]);
				}
			});
		}

		socket.on('disconnect', async () => {
			if (role === 'DRIVER') {
				await redis.hDel('drivers:sockets', userId!);
			}
		});
	});
}