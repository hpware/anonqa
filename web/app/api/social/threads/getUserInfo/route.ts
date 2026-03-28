import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const GET = async (request: NextRequest) => {
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

  const teamId = request.nextUrl.searchParams.get("teamId");
  if (!teamId) {
    return new Response(
      JSON.stringify({ success: false, message: "Missing teamId" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const threadsData = await fetchQuery(
    api.func_feat_manage.getThreadsUserData,
    { userId: teamId },
  );

  return new Response(
    JSON.stringify({
      success: true,
      data: threadsData,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
};
