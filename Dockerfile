# ---- 1) Dependencies layer
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---- 2) Build layer
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Node modules + source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (no DB needed here)
RUN npx prisma generate

# Build Next.js
RUN npm run build

# ---- 3) Runtime layer
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy runtime artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Start: apply migrations at runtime (DATABASE_URL comes from Railway UI)
CMD sh -c "npx prisma migrate deploy && npm start"

EXPOSE 3000
