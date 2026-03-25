# Multi-stage build for NestJS
FROM node:20-alpine AS builder

WORKDIR /app

# [Offline Build Support] 
# 1. Use WASM for Query Engine (Included in node_modules, no binary download needed)
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=wasm
ENV PRISMA_CLIENT_ENGINE_TYPE=wasm

# 2. Use local binary for Schema Engine (Must exist in prisma/engines/)
ENV PRISMA_SCHEMA_ENGINE_BINARY=/app/prisma/engines/schema-engine-linux-musl

# Install dependencies first
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and engines
COPY prisma ./prisma/

# Ensure the local engine is executable
RUN chmod +x /app/prisma/engines/schema-engine-linux-musl

# Generate Prisma client
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# Final Stage
FROM node:20-alpine

WORKDIR /app

# Copy production artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY certs ./certs

# Runtime environment for WASM and local engine
ENV PRISMA_CLIENT_ENGINE_TYPE=wasm
ENV PRISMA_SCHEMA_ENGINE_BINARY=/app/prisma/engines/schema-engine-linux-musl
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]
