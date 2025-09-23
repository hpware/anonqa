import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery, fetchMutation } from "convex/nextjs";

export const POST = async (request: NextRequest) => {
  try {
    const body: any = await request.json();
    const cookie = await cookies();
    const session = cookie.get("session")?.value || "";
    if (!(session && body.type && body.q_id && body.ans && body.team_id)) {
      return new Response(
        JSON.stringify({
          success: false,
          status: 400,
          message: "Invalid params",
        }),
      );
    }
    const checkSession = await fetchQuery(api.func_users.verifySession, {
      currentSession: session,
    });
    if (!checkSession.linked) {
      return new Response(
        JSON.stringify({
          success: false,
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
    console.log(body.type);
    if (body.type === "ignore") {
      fetchMutation(api.func_feat_manage.setDataAsIgnored, {
        msgId: body.q_id,
      });
      return new Response(
        JSON.stringify({
          success: true,
          status: 200,
          message: "",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    //const updateData = await fetchMutation(api.func_feat_manage.)
  } catch (e: any) {
    console.error(e);
    return new Response(
      JSON.stringify({
        success: false,
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

/**{"type":"text","q_id":"52c0f207-8d0f-4884-a8c4-5e7d4118589e"}
 */
