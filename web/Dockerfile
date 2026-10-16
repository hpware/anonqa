FROM oven/bun:1.4.2 AS dependencies
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_CONVEX_URL
ARG NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY=""
ARG NEXT_PUBLIC_CAPTCHA_FEAT=false
ARG NEXT_PUBLIC_DISABLE_REGISTER=true
ARG NEXT_PUBLIC_POSTHOG_KEY=""
ARG NEXT_PUBLIC_SERVER_USER_TERMS=""
ARG NEXT_PUBLIC_ADMINISTRATOR_EMAIL=""
ENV NEXT_PUBLIC_CONVEX_URL=$NEXT_PUBLIC_CONVEX_URL \
    NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY \
    NEXT_PUBLIC_CAPTCHA_FEAT=$NEXT_PUBLIC_CAPTCHA_FEAT \
    NEXT_PUBLIC_DISABLE_REGISTER=$NEXT_PUBLIC_DISABLE_REGISTER \
    NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY \
    NEXT_PUBLIC_SERVER_USER_TERMS=$NEXT_PUBLIC_SERVER_USER_TERMS \
    NEXT_PUBLIC_ADMINISTRATOR_EMAIL=$NEXT_PUBLIC_ADMINISTRATOR_EMAIL
RUN node node_modules/next/dist/bin/next build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
