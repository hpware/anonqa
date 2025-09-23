import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import isValidUUID from "@/lib/checkValidUUID";

export const POST = async (request: NextRequest) => {
  const body: any = await request.json();
  const cookie = await cookies();
  const session = cookie.get("session")?.value;
  if (!(body.teamId && session)) {
    return new Response(
      JSON.stringify({
        success: false,
        data: [],
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
        data: [],
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
};
