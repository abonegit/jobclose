# Stage 1: Build the application
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY app/package*.json ./
RUN npm ci

COPY app/tsconfig.json ./
COPY app/src ./src

RUN npm run build


# Stage 2: Create the production image
FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY app/package*.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]