import { api } from "@/convex/_generated/api";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

/*export const GET = async (request: NextRequest) => {
  const cookie = await cookies();
  const session = cookie.get("session");
  if (!session) {
    return Response.redirect("/auth/logout");
  }
  try {
    const checkSession = await fetchQuery(api.func_users.verifySession, {
      currentSession: String(session),
    });
    if (!checkSession.linked) {
      return new Response(
        JSON.stringify({
          status: 403,
          error: true,
          message: "This acount does not exist.",
          system_action: "none",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "appilcation/json",
          },
        },
      );
    }
    const getThreadsLink = await fetchQuery(
      api.func_feat_manage.getThreadsAuthToken,
      {
        userId: String(checkSession.userid),
      },
    );
    if (getThreadsLink === null) {
      return new Response(
        JSON.stringify({
          status: 400,
          error: true,
          message: "Threads account is not linked",
          system_action: "none",
        }),
      );
    }
    try {
      const createThreadsPost_REQ = await fetch(
        "https://graph.threads.net/v1.0/10098977380201680/threads?media_type=TEXT&text=#BronzFonz&access_token=THAAgWU1Wx4RpBUVJvems1WGZAyQVBVT2I5MXVNOXVTRGZAhR0M2eHdQbW1yRGd1QjZAmeXlDU29INlRBV3UzeW04WDBWdE9Bek5paFgxS29MZAHkycWxjOTg2NW1hVmFaWXY3LUhpd01FMlc1ZAmhmay1QRzMwVURsRFVfVmMtUnBZASWlmanBrR0Q0eWZAUU19zNlRmYlVXX056ck4xUUR5MGFwOEVzUUpwdwZDZD",
      );
      const createThreadsPost_RES = await createThreadsPost_REQ.json();
      /**const req = await fetch(
  `https://graph.threads.net/v1.0/${post_id}/threads_publish?domain=THREADS&creation_id=17924832948103188&access_token=${access_token}`,
};
    } catch (e) {}
  } catch (e) {
    console.log(e);
    return new Response("server side error");
  }
}; */

export const GET = async () => {
  return Response.redirect("/");
};
