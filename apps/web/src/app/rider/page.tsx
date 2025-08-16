'use client';
import { useState } from 'react';
import axios from 'axios';

export default function RiderPage() {
	const [origin, setOrigin] = useState({ lat: 0, lng: 0 });
	const [destination, setDestination] = useState({ lat: 0, lng: 0 });
	const [quote, setQuote] = useState<any>(null);
	const [tripId, setTripId] = useState<string | null>(null);

	const api = axios.create({ baseURL: '/api/v1', withCredentials: true });

	return (
		<main className="mx-auto max-w-xl p-6 space-y-4">
			<h2 className="text-2xl font-semibold">Rider</h2>
			<div className="grid grid-cols-2 gap-2">
				<input className="border p-2" placeholder="Origin lat" type="number" value={origin.lat} onChange={(e) => setOrigin({ ...origin, lat: Number(e.target.value) })} />
				<input className="border p-2" placeholder="Origin lng" type="number" value={origin.lng} onChange={(e) => setOrigin({ ...origin, lng: Number(e.target.value) })} />
				<input className="border p-2" placeholder="Dest lat" type="number" value={destination.lat} onChange={(e) => setDestination({ ...destination, lat: Number(e.target.value) })} />
				<input className="border p-2" placeholder="Dest lng" type="number" value={destination.lng} onChange={(e) => setDestination({ ...destination, lng: Number(e.target.value) })} />
			</div>
			<div className="flex gap-2">
				<button className="rounded bg-black text-white px-3 py-2" onClick={async () => {
					const { data } = await api.post('/quotes', { origin, destination });
					setQuote(data);
				}}>Get quote</button>
				<button className="rounded bg-emerald-600 text-white px-3 py-2" onClick={async () => {
					const { data } = await api.post('/trips', { origin, destination });
					setTripId(data.id);
				}}>Request ride</button>
			</div>
			{quote && <pre className="bg-neutral-100 p-3 rounded text-sm">{JSON.stringify(quote, null, 2)}</pre>}
			{tripId && <div className="text-sm">Trip created: {tripId}</div>}
		</main>
	);
}