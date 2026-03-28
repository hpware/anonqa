import { NextRequest } from "next/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const GET = async (request: NextRequest) => {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return Response.redirect(new URL("/manage/selectTeams", request.url));
  }

  const [sessionId, teamId] = state.split(":");

  const checkSession = await fetchQuery(api.func_users.verifySession, {
    currentSession: sessionId,
  });
  if (!checkSession.linked || !checkSession.userid) {
    return Response.redirect(new URL("/auth/login", request.url));
  }

  const clientId = process.env.THREADS_CLIENT_ID;
  const clientSecret = process.env.THREADS_CLIENT_SECRET;
  const redirectUri = process.env.THREADS_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return Response.redirect(new URL("/manage/selectTeams", request.url));
  }

  try {
    // Exchange code for short-lived token
    const tokenRes = await fetch(
      "https://graph.threads.net/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code: code,
        }),
      },
    );
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return Response.redirect(new URL("/manage/selectTeams", request.url));
    }

    // Exchange for long-lived token
    const longLivedRes = await fetch(
      `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${clientSecret}&access_token=${tokenData.access_token}`,
    );
    const longLivedData = await longLivedRes.json();
    const accessToken = longLivedData.access_token || tokenData.access_token;

    // Get user info
    const userInfoRes = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,name,is_verified,username,threads_profile_picture_url&access_token=${accessToken}`,
    );
    const userInfo = await userInfoRes.json();

    // Save to database
    await fetchMutation(api.func_feat_manage.saveThreadsAuth, {
      userId: teamId || checkSession.userid,
      accessToken: accessToken,
      threadsData: {
        id: userInfo.id || "",
        name: userInfo.name || "",
        is_verified: userInfo.is_verified || false,
        username: userInfo.username || "",
        threads_profile_picture_url:
          userInfo.threads_profile_picture_url || "",
      },
    });

    const redirectPath = teamId
      ? `/manage/${teamId}/settings`
      : "/manage/selectTeams";
    return Response.redirect(new URL(redirectPath, request.url));
  } catch (e) {
    console.error("Threads OAuth error:", e);
    return Response.redirect(new URL("/manage/selectTeams", request.url));
  }
};
