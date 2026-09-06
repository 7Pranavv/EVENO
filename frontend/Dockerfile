# ── Dependencies ─────────────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are INLINED INTO THE CLIENT BUNDLE by `next build`.
# They are build arguments, not runtime environment variables — setting them
# on the running container or in a Kubernetes env: block does nothing, because
# the strings were already written into the JavaScript the browser downloads.
# Rebuild the image to change them.
#
# NEXT_PUBLIC_API_BASE is fetched by the BROWSER, so it must be a URL the
# browser can reach — the public API address, never an in-cluster name like
# http://eveno-backend:8080.
ARG NEXT_PUBLIC_API_BASE
ARG NEXT_PUBLIC_DESCOPE_PROJECT_ID
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_DESCOPE_PROJECT_ID=$NEXT_PUBLIC_DESCOPE_PROJECT_ID

# Fail the build rather than shipping a bundle wired to the wrong backend or
# to no Descope project at all — both produce a site that looks fine and is
# completely non-functional.
RUN test -n "$NEXT_PUBLIC_API_BASE" || (echo "ERROR: build arg NEXT_PUBLIC_API_BASE is required" && exit 1)
RUN test -n "$NEXT_PUBLIC_DESCOPE_PROJECT_ID" || (echo "ERROR: build arg NEXT_PUBLIC_DESCOPE_PROJECT_ID is required" && exit 1)

ENV NEXT_TELEMETRY_DISABLED=1
# Switches next.config.ts to standalone output — see the comment there.
ENV DOCKER_BUILD=1
RUN npm run build

# ── Runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app

# standalone/ carries the server and its trimmed node_modules; static/ carries
# the built JS and CSS. There is no public/ directory in this project — if one
# is added, it needs its own COPY line here or those files 404.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
