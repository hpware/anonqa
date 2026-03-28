import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import argon2 from "argon2";

export const POST = async (request: NextRequest) => {
  try {
    const body: any = await request.json();
    const cookie = await cookies();
    const session = cookie.get("session")?.value;

    if (!session || !body.type || !body.currentPassword) {
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

    // Verify current password
    const account = await fetchQuery(
      api.func_users.checkAccountAndReturnPassword,
      { email: body.currentEmail },
    );
    if (!account.valid || !account.passwordHash) {
      return new Response(
        JSON.stringify({ success: false, message: "Account not found" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    if (account.userId !== checkSession.userid) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    const passwordMatch = await argon2.verify(
      account.passwordHash,
      body.currentPassword,
    );
    if (!passwordMatch) {
      return new Response(
        JSON.stringify({ success: false, message: "Incorrect password" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (body.type === "email") {
      if (!body.newEmail) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing new email" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      // Check if new email is already taken
      const existingAccount = await fetchQuery(
        api.func_users.lookUpAccountsByEmail,
        { email: body.newEmail },
      );
      if (existingAccount) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Email already in use",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      await fetchMutation(api.func_feat_manage.updateEmailOrPassword, {
        userId: checkSession.userid,
        type: "email",
        newValue: body.newEmail,
      });
    } else if (body.type === "password") {
      if (!body.newPassword) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing new password" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      const hashedPassword = await argon2.hash(body.newPassword);
      await fetchMutation(api.func_feat_manage.updateEmailOrPassword, {
        userId: checkSession.userid,
        type: "password",
        newValue: hashedPassword,
      });
    } else {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid type" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Updated!" }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error(e);
    return new Response(
      JSON.stringify({ success: false, message: e.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
