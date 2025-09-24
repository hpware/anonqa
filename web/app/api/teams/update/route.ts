import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import isValidUUID from "@/lib/checkValidUUID";
import generateRandomString from "@/lib/randomGenString";
export const POST = async (request: NextRequest) => {
  try {
    const body: any = await request.json();
    const cookie = await cookies();
    const session = cookie.get("session")?.value || "";
    if (!(session && body.team_id && body.updatedInfo)) {
      return new Response(
        JSON.stringify({
          success: false,
          joinId: "",
          status: 400,
          message: "Invalid params",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    const checkSession = await fetchQuery(api.func_users.verifySession, {
      currentSession: session,
    });
    if (!checkSession.linked) {
      return new Response(
        JSON.stringify({
          success: false,
          joinId: "",
          status: 403,
          message: "You are not logged in!",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    const checkteamaccess = await fetchQuery(
      api.func_feat_manage.checkAbleToBeAccessed,
      {
        userId: String(checkSession.userid),
        teamId: body.team_id,
      },
    );
    if (!checkteamaccess) {
      return new Response(
        JSON.stringify({
          success: false,
          joinId: "",
          status: 403,
          message: "You don't have access to this team!",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  } catch (e: any) {
    console.error(e);
    return new Response(
      JSON.stringify({
        success: false,
        joinId: "",
        status: 500,
        message: "Server side error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
