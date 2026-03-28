import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import argon2 from "argon2";

export const POST = async (request: NextRequest) => {
  try {
    const body: any = await request.json();
    const cookie = await cookies();
    const session = cookie.get("session")?.value;
    if (!session || !body.checkType) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing params" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
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
    const loginData = await fetchQuery(api.func_users.getFname, {
      userId: checkSession.userid,
    });

    if (body.checkType === "email" && body.value) {
      const account = await fetchQuery(
        api.func_users.checkAccountAndReturnPassword,
        { email: body.value },
      );
      if (account.valid && account.userId === checkSession.userid) {
        return new Response(
          JSON.stringify({ success: true, valid: true }),
          { headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ success: true, valid: false }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    if (body.checkType === "password" && body.value) {
      const account = await fetchQuery(
        api.func_users.checkAccountAndReturnPassword,
        { email: body.email },
      );
      if (!account.valid || !account.passwordHash) {
        return new Response(
          JSON.stringify({ success: true, valid: false }),
          { headers: { "Content-Type": "application/json" } },
        );
      }
      const match = await argon2.verify(account.passwordHash, body.value);
      return new Response(
        JSON.stringify({ success: true, valid: match }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Invalid checkType" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ success: false, message: e.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
