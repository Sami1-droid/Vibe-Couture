# Yango-like Monorepo

Apps:
- `apps/api`: Express + Prisma + Redis + Socket.IO
- `apps/web`: Next.js 14 App Router + Tailwind

Infra:
- `docker-compose.yml`: Postgres, Redis, LocalStack (S3), OSRM, API, Web, Nginx

## Quickstart (Docker)

1. Copy env: `cp .env.example .env` and edit secrets for JWT/Stripe as needed.
2. Build and start: `docker compose up --build`
3. App: `http://localhost` (Nginx routes `/` to web, `/api` to api)

Note: For OSRM, you need prepared data mounted to `/data` or remove the service and set `OSRM_BASE_URL` to a hosted OSRM instance.

## Dev (local)

- Install deps: `npm i`
- Generate Prisma client: `npm run prisma:generate -w apps/api`
- Run API: `npm run dev -w apps/api`
- In a new terminal run Web: `npm run dev -w apps/web`
- Visit `http://localhost:3000`. Dev rewrites proxy `/api` to `http://localhost:4000/api`.

No public S3: uploads use presigned POST to private bucket via LocalStack in dev or AWS in prod.

Scaling: Socket.IO uses Redis adapter; stateless API suitable for horizontal scaling behind Nginx/K8s.