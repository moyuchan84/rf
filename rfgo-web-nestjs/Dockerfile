# Multi-stage build for NestJS
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# Final Stage: Production-ready image
FROM node:20-alpine

WORKDIR /app

# Copy production artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# NestJS environment
ENV NODE_ENV=production

EXPOSE 3000

# Prisma needs to be generated in prod if binaries are different, but we copied node_modules
# Run the application
CMD ["node", "dist/main"]
