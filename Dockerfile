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

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

# Make sure env is present inside the image (needed for next build / prisma)
# If you don't want to bake .env into the image, comment this and use docker run -e instead.
COPY .env ./.env

# Generate Prisma Client & apply migrations for SQLite
RUN npx prisma generate
# For SQLite, "migrate deploy" just ensures the schema is applied in /app/prisma/dev.db
RUN npx prisma migrate deploy || true

# Build Next.js
RUN npm run build

# ---- 3) Runtime layer
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy only what we need to run
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./.env

EXPOSE 3000
CMD ["npm", "start"]
