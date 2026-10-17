import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import {
  requireSameOrigin,
  authenticatedSession,
  errorResponse,
  HttpError,
} from "@/lib/server-auth";
import isValidUUID from "@/lib/checkValidUUID";

async function access(request: Request) {
  const teamId = new URL(request.url).searchParams.get("teamId");
  if (!teamId || !isValidUUID(teamId))
    throw new HttpError(400, "Select a valid team.");
  return { teamId, ...(await authenticatedSession(teamId)) };
}
export const GET = async (request: Request) => {
  try {
    const { teamId, session } = await access(request);
    const status = await fetchQuery(api.func_feat_manage.threadsStatus, {
      teamId,
      session,
    });
    return Response.json(
      { success: true, ...status },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
};
export const DELETE = async (request: Request) => {
  try {
    requireSameOrigin(request);
    const { teamId, session } = await access(request);
    await fetchMutation(api.func_feat_manage.disconnectThreads, {
      teamId,
      session,
    });
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
};
