FROM node:22-alpine AS base
WORKDIR /app

# We keep production mode on for both build and run
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 1. Install dependencies
FROM base AS deps
COPY package.json ./
# Using your preferred install command
RUN npm install --production --no-audit

# 2. Build the app
FROM base AS builder
# Copying dependencies for the build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Runner (The actual final image)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# These are necessary for the 'node server.js' to work in a container
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy essential static files (standalone doesn't include these by default)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Copy the standalone output
COPY --from=builder /app/.next/standalone ./

EXPOSE 3000

# Instead of 'npm start', we run the standalone server directly
# This is much faster and uses way less RAM
CMD ["node", "server.js"]