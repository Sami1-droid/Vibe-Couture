import Link from 'next/link';

export default function HomePage() {
	return (
		<main className="mx-auto max-w-3xl p-6">
			<h1 className="text-3xl font-bold mb-6">Yango-like</h1>
			<div className="grid grid-cols-1 gap-4">
				<Link className="rounded border p-4 hover:bg-neutral-100" href="/rider">Rider App</Link>
				<Link className="rounded border p-4 hover:bg-neutral-100" href="/driver">Driver App</Link>
			</div>
		</main>
	);
}