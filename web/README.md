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

Custom messages, dice suggestions, profile settings, team creation/joining, anonymous submissions, answer formats, session revocation, account credential changes, and Threads linking/text publication are implemented.

### Account settings

Open **Account settings** from the team picker, or use the account section in team settings. Updating email/password requires the current password. New passwords require at least 12 characters. Changes rotate the current session and revoke other sessions. Existing password hashes and the login/register format remain compatible. There is no password-recovery email flow.

### Threads setup

Create a Meta app with the Threads use case and request `threads_basic` and `threads_content_publish`. Configure its OAuth redirect URI to exactly match `THREADS_REDIRECT_URI`, usually `https://your-domain/api/social/threads/authorize/callback`. Set `THREADS_APP_ID`, `THREADS_APP_SECRET`, and `THREADS_REDIRECT_URI` on the Next.js server. HTTPS is required outside local development. Meta may require tester enrollment or app review before other users can connect.

In team settings, use **Connect Threads** to authorize a profile. Team members can then select **Post to Threads** in the answer editor and explicitly publish the question and answer. The combined post is limited to 500 UTF-8 bytes. Successful posts are saved with a Threads link; when permalink lookup fails, the link opens the connected profile. The integration uses Meta's `auto_publish_text` option; image/video publishing is not offered. Existing image export formats continue to work locally.

Access tokens remain on the backend and are excluded from public and team-list queries. OAuth callbacks use signed, session-bound, short-lived state cookies. Long-lived tokens normally expire after 60 days; use **Reconnect Threads** when needed. **Disconnect Threads** deletes the saved connection locally; users can also revoke the app in Threads settings.

Concurrent or repeated publication requests cannot post the same question twice. If a network failure makes the publication outcome uncertain, the question stays reserved and the UI asks you to check Threads. To resolve such a request, a deployment administrator must inspect `qas.threadsPublication` in Convex: after confirming a post did not publish, clear that field to permit a retry; if it did publish, reconcile the saved answer/link instead. Do not clear a reservation until the original request has stopped and its outcome is known.

Meta API behavior is covered by mocked integration tests; verify the OAuth flow and posting with a test profile after configuring your own app. API references: [OAuth](https://developers.facebook.com/docs/threads/get-started/get-access-tokens-and-permissions/), [long-lived tokens](https://developers.facebook.com/docs/threads/get-started/long-lived-tokens/), and [publishing](https://developers.facebook.com/documentation/threads/reference/publishing/).
