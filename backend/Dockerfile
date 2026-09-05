# ── Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Copied on their own so this layer is only rebuilt when dependencies change.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
# tsconfig.build.json excludes *.test.ts, so no test code reaches the image.
RUN npm run build

# Drop dev dependencies (typescript, ts-node, nodemon) from node_modules so
# they never reach the runtime image.
RUN npm prune --omit=dev

# ── Runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

# node:alpine ships an unprivileged `node` user — use it rather than root.
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/package.json ./package.json

USER node

EXPOSE 8080

# Kubernetes uses its own probes; this covers plain `docker run` and compose.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8080/healthz',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# No npm wrapper: node runs as PID 1 so it receives SIGTERM directly and the
# graceful shutdown in server.ts actually fires.
CMD ["node", "dist/server.js"]
