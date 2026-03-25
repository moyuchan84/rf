# Stage 1: Build the React application
FROM node:20-alpine AS builder

# [Offline Build Support] Optional: Pass internal NPM registry
ARG NPM_REGISTRY
RUN if [ -n "$NPM_REGISTRY" ]; then npm config set registry $NPM_REGISTRY; fi

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy code and build (using Vite)
COPY . .
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy SPA config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
