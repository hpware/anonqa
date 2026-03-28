import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const POST = async (request: NextRequest) => {
  const cookie = await cookies();
  const session = cookie.get("session")?.value;
  if (!session) {
    return new Response(
      JSON.stringify({ success: false, message: "Not logged in" }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  const checkSession = await fetchQuery(api.func_users.verifySession, {
    currentSession: session,
  });
  if (!checkSession.linked || !checkSession.userid) {
    return new Response(
      JSON.stringify({ success: false, message: "Not logged in" }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const body: any = await request.json();
    if (!body.teamId || !body.text) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing params" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const checkAccess = await fetchQuery(
      api.func_feat_manage.checkAbleToBeAccessed,
      { userId: String(checkSession.userid), teamId: body.teamId },
    );
    if (!checkAccess) {
      return new Response(
        JSON.stringify({ success: false, message: "No access" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    const accessToken = await fetchQuery(
      api.func_feat_manage.getThreadsAuthToken,
      { userId: body.teamId },
    );
    if (!accessToken) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Threads account not linked",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const threadsData = await fetchQuery(
      api.func_feat_manage.getThreadsUserData,
      { userId: body.teamId },
    );
    if (!threadsData) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Threads user data not found",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Step 1: Create media container
    const createRes = await fetch(
      `https://graph.threads.net/v1.0/${threadsData.id}/threads`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          media_type: "TEXT",
          text: body.text,
          access_token: accessToken,
        }),
      },
    );
    const createData = await createRes.json();

    if (!createData.id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to create Threads post",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Step 2: Publish
    const publishRes = await fetch(
      `https://graph.threads.net/v1.0/${threadsData.id}/threads_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          creation_id: createData.id,
          access_token: accessToken,
        }),
      },
    );
    const publishData = await publishRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        postId: publishData.id,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("Threads publish error:", e);
    return new Response(
      JSON.stringify({ success: false, message: e.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
