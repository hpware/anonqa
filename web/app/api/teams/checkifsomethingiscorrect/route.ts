import {
  authenticatedSession,
  errorResponse,
  requireSameOrigin,
} from "@/lib/server-auth";
import { verifyCurrentPassword } from "@/lib/account";

export const POST = async (request: Request) => {
  try {
    requireSameOrigin(request);
    const { session } = await authenticatedSession();
    const body = await request.json().catch(() => null);
    await verifyCurrentPassword(session, body?.currentPassword);
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
};
