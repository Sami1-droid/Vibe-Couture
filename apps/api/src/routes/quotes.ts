import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';

const QuoteRequest = z.object({
	origin: z.object({ lat: z.number(), lng: z.number() }),
	destination: z.object({ lat: z.number(), lng: z.number() }),
});

export const router = Router();

router.post('/', async (req, res) => {
	const parsed = QuoteRequest.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
	const { origin, destination } = parsed.data;
	try {
		const osrmBase = process.env.OSRM_BASE_URL || 'http://localhost:5000';
		const url = `${osrmBase}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false&geometries=polyline&alternatives=false`; 
		const { data } = await axios.get(url);
		const route = data?.routes?.[0];
		if (!route) return res.status(400).json({ message: 'No route found' });
		const distanceMeters = Math.round(route.distance);
		const durationSeconds = Math.round(route.duration);
		// Simple fare model: base + per_km + per_minute
		const base = 200; // cents
		const perKm = 100; // cents per km
		const perMin = 50; // cents per minute
		const fareEstimateCents = Math.max(base + Math.round((distanceMeters / 1000) * perKm + (durationSeconds / 60) * perMin), base);
		res.json({ distanceMeters, durationSeconds, fareEstimateCents });
	} catch (e: any) {
		return res.status(500).json({ message: e.message || 'OSRM error' });
	}
});