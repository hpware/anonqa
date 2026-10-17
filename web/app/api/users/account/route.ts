import { cookies } from "next/headers";
import argon2 from "argon2";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import {
  requireSameOrigin,
  authenticatedSession,
  errorResponse,
  HttpError,
  serverSecret,
} from "@/lib/server-auth";
import { loginPassword, verifyCurrentPassword } from "@/lib/account";

export const GET = async () => {
  try {
    const { session } = await authenticatedSession();
    return Response.json(
      {
        success: true,
        ...(await fetchQuery(api.func_users.getAccountProfile, { session })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
};

export const POST = async (request: Request) => {
  try {
    requireSameOrigin(request);
    const { session } = await authenticatedSession();
    const body = await request.json().catch(() => null);
    if (!body || (body.email === undefined && body.newPassword === undefined))
      throw new HttpError(400, "Enter a new email or password.");
    let email: string | undefined;
    if (body.email !== undefined) {
      if (
        typeof body.email !== "string" ||
        body.email.length > 320 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
      )
        throw new HttpError(400, "Enter a valid email address.");
      email = body.email.trim();
    }
    if (
      body.newPassword !== undefined &&
      (typeof body.newPassword !== "string" ||
        !body.newPassword.trim() ||
        body.newPassword.length < 12 ||
        body.newPassword.length > 1024)
    ) {
      throw new HttpError(
        400,
        "New passwords must contain 12–1024 characters.",
      );
    }
    const account = await verifyCurrentPassword(session, body.currentPassword);
    const result = await fetchMutation(
      api.func_users.updateAccountCredentials,
      {
        session,
        secret: serverSecret(),
        expectedPasswordHash: account.passwordHash,
        expectedEmail: account.email,
        ...(email ? { email } : {}),
        ...(body.newPassword !== undefined
          ? { passwordHash: await argon2.hash(loginPassword(body.newPassword)) }
          : {}),
      },
    );
    if (!result.success) throw new HttpError(409, result.message);
    (await cookies()).set("session", result.session, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: result.expiresAt,
    });
    return Response.json({
      success: true,
      message: "Account updated. Other sessions have been signed out.",
    });
  } catch (error) {
    return errorResponse(error);
  }
};
