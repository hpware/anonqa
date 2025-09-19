import { api } from "@/convex/_generared/api"
import { fetchQuery, fetchMutation } from "convex/nextjs"
import { NextRequest } from "next/server"
import { cookies } from "next/headers"

export const GET = async (request: NextRequest) => {
	const cookie = await cookies();
	const session = cookie.get("session");
	try {
	const checkSession = await fetchQuery(api.func_users.verifySession, { currentSession: session });
	} catch (e) {

	}
  //const req = await fetch(
  //  `https://graph.threads.net/v1.0/${post_id}/threads_publish?domain=THREADS&creation_id=17924832948103188&access_token=${access_token}`,
  //);
};
