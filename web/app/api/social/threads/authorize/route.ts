import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const GET = async (request: NextRequest) => {
  const cookie = await cookies();
  const session = cookie.get("session")?.value;
  if (!session) {
    return Response.redirect(new URL("/auth/login", request.url));
  }

  const checkSession = await fetchQuery(api.func_users.verifySession, {
    currentSession: session,
  });
  if (!checkSession.linked) {
    return Response.redirect(new URL("/auth/login", request.url));
  }

  const clientId = process.env.THREADS_CLIENT_ID;
  const redirectUri = process.env.THREADS_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return new Response(
      JSON.stringify({
        error: true,
        message: "Threads OAuth is not configured on the server.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const teamId = request.nextUrl.searchParams.get("teamId") || "";
  const state = `${session}:${teamId}`;

  const authUrl = `https://threads.net/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=threads_basic,threads_content_publish&response_type=code&state=${encodeURIComponent(state)}`;

  return Response.redirect(authUrl);
};
