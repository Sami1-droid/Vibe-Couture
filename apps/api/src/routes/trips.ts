import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from './auth.js';
import { prisma } from '../util/prisma.js';
import axios from 'axios';
import { getRedis } from '../util/redis.js';

const CreateTrip = z.object({
	origin: z.object({ lat: z.number(), lng: z.number() }),
	destination: z.object({ lat: z.number(), lng: z.number() }),
	paymentMethodId: z.string().optional(),
});

export const router = Router();

router.post('/', authMiddleware, async (req, res) => {
	const parsed = CreateTrip.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
	const userId = (req as any).user.id as string;
	const { origin, destination } = parsed.data;

	// Get quote via OSRM
	const osrmBase = process.env.OSRM_BASE_URL || 'http://localhost:5000';
	const url = `${osrmBase}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false&geometries=polyline&alternatives=false`;
	const { data } = await axios.get(url);
	const route = data?.routes?.[0];
	if (!route) return res.status(400).json({ message: 'No route found' });
	const distanceMeters = Math.round(route.distance);
	const durationSeconds = Math.round(route.duration);
	const base = 200, perKm = 100, perMin = 50;
	const fareEstimateCents = Math.max(base + Math.round((distanceMeters / 1000) * perKm + (durationSeconds / 60) * perMin), base);

	const trip = await prisma.trip.create({
		data: {
			riderId: userId,
			status: 'REQUESTED',
			originLat: origin.lat,
			originLng: origin.lng,
			destLat: destination.lat,
			destLng: destination.lng,
			estimatedDistanceM: distanceMeters,
			estimatedDurationS: durationSeconds,
			fareEstimateCents,
		},
	});

	// Dispatch: find nearest available driver via Redis GEO (radius 5km)
	const redis = getRedis();
	const results = await redis.geoSearch(
		'drivers:available',
		{ longitude: origin.lng, latitude: origin.lat },
		{ radius: 5, unit: 'km' },
		{ SORT: 'ASC', COUNT: 10 }
	);
	// TODO: notify drivers via Socket.io using sockets mapping
	void results;

	res.status(201).json({ id: trip.id, status: trip.status, fareEstimateCents });
});

router.get('/:id', authMiddleware, async (req, res) => {
	const id = req.params.id;
	const trip = await prisma.trip.findUnique({ where: { id } });
	if (!trip) return res.status(404).json({ message: 'Not found' });
	const userId = (req as any).user.id as string;
	if (trip.riderId !== userId && trip.driverId !== userId) return res.status(403).json({ message: 'Forbidden' });
	res.json(trip);
});