FROM node:18 AS base
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=0

FROM base AS deps
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci --no-audit

FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/ ./
EXPOSE 3000
CMD ["npm", "start"]