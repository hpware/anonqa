# AnonQA web app

Requires Bun 1.4.2+ and Node.js 20.9+ (Node.js 24 LTS recommended). The Next.js frontend uses Convex for storage and sessions, an OpenAI-compatible moderation endpoint, and optional Cloudflare Turnstile.

## Local setup

From `web/`:

```sh
bun install --frozen-lockfile
cp .env.example .env.local
bunx convex dev
```

The Convex CLI provisions a development deployment and writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to `.env.local`. Leave it running to synchronize backend code. In another terminal, generate a secret with `openssl rand -hex 32`, put it in `.env.local` as `CONVEX_SERVER_SECRET`, and configure the **same** secret on the development backend:

```sh
bunx convex env set CONVEX_SERVER_SECRET <your-generated-secret>
```

Set `OPENAI_API_KEY`, `OPENAI_API_URL`, and a supported `MOD_AI_MODEL` in `.env.local`. Then run `bun run dev:frontend`. Alternatively, after setup, `bun run dev` starts both frontend and backend.

`NEXT_PUBLIC_DISABLE_REGISTER=false` enables registration. `NEXT_PUBLIC_CAPTCHA_FEAT=true` enables Turnstile and requires both its public site key and private key. The string `false` disables it. Analytics is optional; set `NEXT_PUBLIC_POSTHOG_KEY` to enable it. Configure account terms and administrator contact for your instance.

## Deployment

Deploy the Convex backend with `bunx convex deploy` and set `CONVEX_SERVER_SECRET` on that production deployment (`bunx convex env set --prod CONVEX_SERVER_SECRET <secret>`). Configure the production Convex URL, matching secret, moderation credentials, and chosen feature flags on the frontend host. Build with `bun run build` and serve with `bun run start`, or use Vercel's Next.js integration. Frontend and backend changes in this update must both be deployed.

For Docker, copy `.env.example` to `.env`, configure production values, and run `docker compose up --build` from this directory. Deploy Convex separately first. Public environment variables are supplied at image build time; rebuild when changing them. Server credentials are supplied at runtime through `.env`. The image runs Next.js standalone as the unprivileged Node user. Image builds do not deploy Convex or include environment files.

## Checks

```sh
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun test
bun audit --prod
bun run build
```

A build requires `NEXT_PUBLIC_CONVEX_URL` to be set. Integration with a live backend additionally requires the matching server secret and moderation credentials. The automated tests use an in-memory Convex backend and mocked moderation/network calls.

As of 2026-10-16, the production dependency audit reports no known vulnerabilities. The full audit reports **GHSA-vfj7-8cjw-p6xm** in `braces@3.0.3`, pulled in by `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch`. No patched `braces` release is published. This affects development lint tooling; revisit when upstream publishes a fix. Do not pass untrusted glob patterns to that tooling.

Lint currently reports four advisory warnings for existing profile `<img>` elements. Next.js also emits a fallback-font warning for Bitcount Grid Double.

## Feature status

Custom message creation/deletion, dice suggestions, profile settings, teams, anonymous submissions, answer formats, and session revocation are implemented. Threads integration and account email/password changes remain unavailable: their API stubs return an explicit HTTP 501. The UI does not offer these unfinished integrations.
