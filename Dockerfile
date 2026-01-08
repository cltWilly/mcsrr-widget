FROM node:22-alpine AS base
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json ./
RUN npm install --production --no-audit


FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build


FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# These are necessary for the 'node server.js' to work in a container
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy essential static files (standalone doesn't include these by default)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static


COPY --from=builder /app/.next/standalone ./

EXPOSE 3000

CMD ["node", "server.js"]