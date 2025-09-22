import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import isValidUUID from "@/lib/checkValidUUID";

export const POST = async (request: NextRequest) => {
  try {
    const body: any = await request.json();
    const cookie = await cookies();
    const session = cookie.get("session")?.value;
    if (
      !(body.team_handle && body.team_name && session && isValidUUID(session))
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          teamId: null,
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
          teamId: null,
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
    const createNewTeamAction = await fetchMutation(
      api.func_feat_manage.createNewTeam,
      {
        team_handle: body.team_handle,
        team_name: body.team_name,
      },
    );
    return new Response(
      JSON.stringify({
        success: true,
        teamId: createNewTeamAction,
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
  } catch (e) {
    return new Response(
      JSON.stringify({
        success: false,
        teamId: null,
        status: 500,
        message: "Server Side Error",
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
