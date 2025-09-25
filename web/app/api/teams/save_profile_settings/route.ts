import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const POST = async (request: NextRequest) => {
  try {
    const body: any = await request.json();
    const cookie = await cookies();
    const session = cookie.get("session")?.value;
    /*      new_displayName: "v.string()",
    new_handle: "v.string()",
    new_imageUrl: "v.string()",
    new_placeholder: ["v.array(v.string())"],
    customRandomMessages: "v.string()",
    teamId: body.team_id, */
    if (
      !(
        body.team_id &&
        body.new_displayName &&
        body.new_handle &&
        body.new_imageUrl &&
        body.new_placeholder &&
        body.customRandomMessages &&
        session
      )
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          status: 400,
          message: "Wrong params!",
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
    fetchMutation(api.func_users.saveNewUserSettings, {
      new_displayName: body.new_displayName,
      new_handle: body.new_handle,
      new_imageUrl: body.new_imageUrl,
      new_placeholder: body.new_placeholder,
      customRandomMessages: body.customRandomMessages,
      teamId: body.team_id,
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
