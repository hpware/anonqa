import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import isValidUUID from "@/lib/checkValidUUID";

async function updateMessage(request: NextRequest, remove: boolean) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.teamId !== "string" ||
    !isValidUUID(body.teamId) ||
    typeof body.msg !== "string" ||
    !body.msg.trim() ||
    body.msg.length > 2000
  ) {
    return Response.json(
      { success: false, message: "Invalid team or message." },
      { status: 400 },
    );
  }
  const session = (await cookies()).get("session")?.value;
  if (!session)
    return Response.json(
      { success: false, message: "Please log in." },
      { status: 401 },
    );
  try {
    const account = await fetchQuery(api.func_users.verifySession, {
      currentSession: session,
    });
    if (!account.linked || !account.userid) {
      return Response.json(
        { success: false, message: "Please log in." },
        { status: 401 },
      );
    }
    const allowed = await fetchQuery(
      api.func_feat_manage.checkAbleToBeAccessed,
      {
        userId: account.userid,
        teamId: body.teamId,
        session,
      },
    );
    if (!allowed)
      return Response.json(
        { success: false, message: "Access denied." },
        { status: 403 },
      );
    const result = await fetchMutation(
      remove
        ? api.func_feat_manage.deleteCustomRandomDiceMessage
        : api.func_feat_manage.addNewCustomRandomDiceMessage,
      { msg: body.msg, teamId: body.teamId, session },
    );
    return Response.json(result, { status: result.success ? 200 : 409 });
  } catch (error) {
    console.error("Custom message update failed", error);
    return Response.json(
      { success: false, message: "Could not update custom messages." },
      { status: 500 },
    );
  }
}

export const POST = (request: NextRequest) => updateMessage(request, false);
export const DELETE = (request: NextRequest) => updateMessage(request, true);
