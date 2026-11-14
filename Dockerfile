
# Stage 1: Build the React frontend
FROM node:22-bookworm-slim AS frontend-builder

WORKDIR /app/frontend

COPY app/frontend/package*.json ./
RUN npm ci

COPY app/frontend/ ./
RUN npm run build


# Stage 2: Build the Express backend
FROM node:22-bookworm-slim AS backend-builder

WORKDIR /app

COPY app/package*.json ./
RUN npm ci

COPY app/tsconfig.json ./
COPY app/src ./src

RUN npm run build


# Stage 3: Production runtime
FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Install production dependencies only
COPY app/package*.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force

# Copy compiled backend
COPY --from=backend-builder /app/dist ./dist
COPY app/certs/global-bundle.pem ./certs/global-bundle.pem

# Copy built React frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Run as non-root user
USER node

EXPOSE 3000

# Container health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]
