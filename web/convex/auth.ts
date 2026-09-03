import { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * Server-to-server secret shared between the Next.js app and Convex.
 *
 * Convex public functions can be invoked by ANY client that knows the
 * deployment URL (it ships in the browser bundle), so privileged functions
 * must never trust their arguments alone. Functions that authenticate a
 * caller that has no session yet (login/register/anonymous QA submission)
 * require this secret instead.
 *
 * Set the SAME value in both places:
 *   1. Convex:  npx convex env set CONVEX_SERVER_SECRET <value>
 *   2. Web app: CONVEX_SERVER_SECRET in the Vercel/server environment.
 */
export async function requireServerSecret(secret?: string | null): Promise<void> {
  const expected = process.env.CONVEX_SERVER_SECRET;
  if (!expected) {
    throw new Error(
      "Server misconfiguration: CONVEX_SERVER_SECRET is not set on the Convex deployment. " +
        "Set it with `npx convex env set CONVEX_SERVER_SECRET <value>` and set the same " +
        "value in the web app environment.",
    );
  }
  if (!secret || secret !== expected) {
    throw new Error("Unauthorized call to a server-only Convex function.");
  }
}

/** Resolve the userId linked to a session id, or null if invalid/expired. */
export async function getUserIdFromSession(
  ctx: QueryCtx | MutationCtx,
  session: string,
): Promise<string | null> {
  if (!session) {
    return null;
  }
  const checkSession = await ctx.db
    .query("session")
    .withIndex("by_session", (q) => q.eq("sessionId", session))
    .unique();
  if (checkSession === null) {
    return null;
  }
  if (checkSession.expires_at <= Date.now()) {
    return null;
  }
  return checkSession.userAccount ?? null;
}

/** Throw unless the caller holds a valid, unexpired session. Returns the userId. */
export async function requireValidSession(
  ctx: QueryCtx | MutationCtx,
  session: string,
): Promise<string> {
  const userId = await getUserIdFromSession(ctx, session);
  if (userId === null) {
    throw new Error("Unauthorized: invalid or expired session.");
  }
  return userId;
}

/**
 * Throw unless the caller holds a valid session that belongs to the team.
 * Returns the session's userId.
 */
export async function requireTeamAccess(
  ctx: QueryCtx | MutationCtx,
  session: string,
  teamId: string,
): Promise<string> {
  const userId = await requireValidSession(ctx, session);
  const team = await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", teamId))
    .unique();
  if (!team) {
    throw new Error("Unauthorized: team not found.");
  }
  const controlable = team.controlableUsers ?? [];
  if (!controlable.includes(userId)) {
    throw new Error("Unauthorized: no access to this team.");
  }
  return userId;
}
