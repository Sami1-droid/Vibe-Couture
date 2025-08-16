'use client';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function DriverPage() {
	const [online, setOnline] = useState(false);
	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		const sock = io('/api', { path: '/api/ws', auth: { userId: 'driver-demo', role: 'DRIVER' } });
		socketRef.current = sock;
		return () => { sock.disconnect(); };
	}, []);

	useEffect(() => {
		if (!socketRef.current) return;
		if (online) socketRef.current.emit('driver:online');
		else socketRef.current.emit('driver:offline');
	}, [online]);

	return (
		<main className="mx-auto max-w-xl p-6 space-y-4">
			<h2 className="text-2xl font-semibold">Driver</h2>
			<label className="flex items-center gap-2">
				<input type="checkbox" checked={online} onChange={(e) => setOnline(e.target.checked)} /> Online
			</label>
			<button className="rounded bg-black text-white px-3 py-2" onClick={() => {
				const lat = 40.7128 + (Math.random() - 0.5) * 0.01;
				const lng = -74.0060 + (Math.random() - 0.5) * 0.01;
				socketRef.current?.emit('driver:location:update', { lat, lng });
			}}>Send location</button>
		</main>
	);
}