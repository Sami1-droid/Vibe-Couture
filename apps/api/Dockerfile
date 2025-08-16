# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* .npmrc* ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=optional

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate && npm run build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package.json package-lock.json* .npmrc* ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --omit=optional && npx prisma generate
EXPOSE 4000
CMD ["node", "dist/index.js"]