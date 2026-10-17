import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { HttpError, serverSecret } from "./server-auth";

export const threadsFields =
  "id,username,name,threads_profile_picture_url,is_verified";
export const oauthCookie = "threads_oauth";
export const oauthCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/social/threads",
  maxAge: 600,
};

export function threadsConfig() {
  const clientId = process.env.THREADS_APP_ID;
  const clientSecret = process.env.THREADS_APP_SECRET;
  const redirectUri = process.env.THREADS_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri)
    throw new HttpError(503, "Threads is not configured on this server.");
  const url = new URL(redirectUri);
  if (
    url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname)
    )
  )
    throw new HttpError(503, "Threads callback must use HTTPS.");
  return { clientId, clientSecret, redirectUri };
}

function signature(value: string) {
  return createHmac("sha256", serverSecret()).update(value).digest("base64url");
}
export function createOAuthState(teamId: string, session: string) {
  const nonce = randomBytes(32).toString("base64url");
  const value = Buffer.from(
    JSON.stringify({
      teamId,
      session: signature(session),
      nonce,
      expiresAt: Date.now() + 600000,
    }),
  ).toString("base64url");
  return { nonce, cookie: `${value}.${signature(value)}` };
}
export function verifyOAuthState(
  cookie: string,
  nonce: string,
  session: string,
): { teamId: string } {
  try {
    const [value, signed] = cookie.split(".");
    const expected = signature(value);
    if (
      !signed ||
      signed.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signed), Buffer.from(expected))
    )
      throw new Error();
    const state = JSON.parse(Buffer.from(value, "base64url").toString());
    if (
      !nonce ||
      state.nonce !== nonce ||
      state.session !== signature(session) ||
      state.expiresAt <= Date.now() ||
      typeof state.teamId !== "string"
    )
      throw new Error();
    return { teamId: state.teamId };
  } catch {
    throw new HttpError(
      400,
      "The Threads connection request expired or is invalid. Start again from settings.",
    );
  }
}

export class ThreadsRejectedError extends HttpError {}

export async function threadsRequest(
  path: string,
  token: string,
  body?: Record<string, string>,
) {
  const response = await fetch(`https://graph.threads.net/v1.0/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    ...(body ? { body: new URLSearchParams(body) } : {}),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  if (!response.ok || result.error) {
    const ErrorType = response.status < 500 ? ThreadsRejectedError : HttpError;
    throw new ErrorType(
      502,
      "Threads rejected the request. Check your connection and permissions in settings.",
    );
  }
  return result;
}

export async function exchangeThreadsCode(code: string) {
  const config = threadsConfig();
  const response = await fetch("https://graph.threads.com/oauth/access_token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
      code,
    }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  const short = await response.json();
  if (!response.ok || typeof short.access_token !== "string")
    throw new HttpError(
      502,
      "Could not connect to Threads. Start again from settings.",
    );
  const url = new URL("https://graph.threads.net/access_token");
  url.search = new URLSearchParams({
    grant_type: "th_exchange_token",
    client_secret: config.clientSecret,
    access_token: short.access_token,
  }).toString();
  const exchanged = await fetch(url, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  const long = await exchanged.json();
  if (
    !exchanged.ok ||
    typeof long.access_token !== "string" ||
    typeof long.expires_in !== "number" ||
    long.expires_in <= 0
  )
    throw new HttpError(
      502,
      "Could not save a long-lived Threads connection. Please try again.",
    );
  const raw = await threadsRequest(
    `me?fields=${threadsFields}`,
    long.access_token,
  );
  if (
    typeof raw.id !== "string" ||
    !/^\d+$/.test(raw.id) ||
    typeof raw.username !== "string"
  )
    throw new HttpError(502, "Threads returned an invalid profile.");
  return {
    token: long.access_token as string,
    expiresAt: Date.now() + long.expires_in * 1000,
    profile: {
      id: raw.id as string,
      username: raw.username as string,
      name: typeof raw.name === "string" ? raw.name : raw.username,
      is_verified: raw.is_verified === true,
      threads_profile_picture_url:
        typeof raw.threads_profile_picture_url === "string"
          ? raw.threads_profile_picture_url
          : "/assets/default.png",
    },
  };
}
