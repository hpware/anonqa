import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import {
  requireSameOrigin,
  authenticatedSession,
  errorResponse,
  HttpError,
  serverSecret,
} from "@/lib/server-auth";
import { threadsRequest, ThreadsRejectedError } from "@/lib/threads";
import isValidUUID from "@/lib/checkValidUUID";

export const maxDuration = 60;
export const POST = async (request: Request) => {
  let attempt: { msgId: string; attemptId: string; secret: string } | undefined;
  let publishing = false;
  try {
    requireSameOrigin(request);
    const body = await request.json().catch(() => null);
    if (
      !body ||
      typeof body.teamId !== "string" ||
      !isValidUUID(body.teamId) ||
      typeof body.msgId !== "string" ||
      !isValidUUID(body.msgId) ||
      typeof body.answer !== "string" ||
      !body.answer.trim()
    )
      throw new HttpError(400, "Enter a valid team, question, and answer.");
    const { session } = await authenticatedSession(body.teamId);
    const secret = serverSecret();
    const connection = await fetchQuery(
      api.func_feat_manage.getThreadsConnection,
      { teamId: body.teamId, session, secret },
    );
    if (!connection || connection.expiresAt <= Date.now())
      throw new HttpError(
        409,
        "Connect or reconnect your Threads account in settings first.",
      );
    const reservation = await fetchMutation(
      api.func_qa.prepareThreadsPublication,
      {
        teamId: body.teamId,
        msgId: body.msgId,
        answer: body.answer,
        session,
        secret,
      },
    );
    if (!reservation.success) throw new HttpError(409, reservation.message);
    if (reservation.completed)
      return Response.json({
        success: true,
        postId: reservation.postId,
        url: reservation.url,
        message: "This answer was already posted.",
      });
    attempt = { msgId: body.msgId, attemptId: reservation.attemptId, secret };
    await fetchMutation(api.func_qa.updateThreadsPublication, {
      ...attempt,
      phase: "publishing",
    });
    publishing = true;
    // Meta supports automatic publication for TEXT posts, avoiding container processing delays.
    const post = await threadsRequest(
      `${encodeURIComponent(connection.profile.id)}/threads`,
      connection.token,
      {
        media_type: "TEXT",
        text: reservation.text,
        auto_publish_text: "true",
      },
    );
    if (typeof post.id !== "string" || !/^\d+$/.test(post.id))
      throw new HttpError(502, "Threads did not confirm publication.");
    // Resolve the post permalink; keep the profile link if that lookup fails.
    let url = `https://www.threads.com/@${encodeURIComponent(connection.profile.username)}`;
    try {
      const details = await threadsRequest(
        `${encodeURIComponent(post.id)}?fields=permalink`,
        connection.token,
      );
      if (typeof details.permalink === "string") {
        const permalink = new URL(details.permalink);
        if (
          permalink.protocol === "https:" &&
          [
            "www.threads.net",
            "threads.net",
            "www.threads.com",
            "threads.com",
          ].includes(permalink.hostname)
        )
          url = permalink.href;
      }
    } catch {
      /* Publication succeeded; saving it must not depend on the permalink lookup. */
    }
    await fetchMutation(api.func_qa.updateThreadsPublication, {
      ...attempt,
      phase: "published",
      postId: post.id,
      url,
    });
    return Response.json({ success: true, postId: post.id, url });
  } catch (error) {
    if (attempt && publishing && error instanceof ThreadsRejectedError) {
      try {
        await fetchMutation(api.func_qa.updateThreadsPublication, {
          ...attempt,
          phase: "rejected",
        });
        return errorResponse(error);
      } catch {
        /* Keep the reservation when cleanup cannot be confirmed. */
      }
    }
    if (attempt && !publishing) {
      try {
        await fetchMutation(api.func_qa.updateThreadsPublication, {
          ...attempt,
          phase: "cancel",
        });
      } catch {
        /* Leave the reservation in place if cleanup cannot be confirmed. */
      }
    }
    if (publishing)
      return errorResponse(
        new HttpError(
          502,
          "Publication could not be confirmed. Check your Threads profile before retrying; this question is locked to prevent duplicate posts.",
        ),
      );
    return errorResponse(error);
  }
};
