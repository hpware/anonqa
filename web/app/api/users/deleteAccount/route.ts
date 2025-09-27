import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
export const DELETE = async (request: NextRequest) => {
  const body: any = await request.json();
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (
    !(
      body &&
      body.areyousure ===
        "YES, IM SURE I WANT TO DELETE MY ACCOUNT VIA THE API" &&
      body.reallyq === "ABSOLUTELY YES! I WANT MY ACCOUNT GONE NOW!" &&
      body.captcha === "NO THANKS!"
    )
  ) {
    return new Response(
      JSON.stringify({
        success: false,
        status: 400,
        message: "Missing params",
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
    currentSession: String(session),
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
  const sendRequest = await fetchMutation(api.func_users.deleteThisUser, {
    userId: String(checkSession.userid),
    areyousure: "YES I AM SURE I WANT TO DELETE MY ACCOUNT FOREVER",
  });
  if (!sendRequest.success) {
    return new Response(
      JSON.stringify({
        success: false,
        status: 200,
        message: sendRequest.msg,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
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
};
