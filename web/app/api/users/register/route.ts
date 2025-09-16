import { api } from "@/convex/_generated/api";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// interfaces
interface bodyData {
  email: string;
  password: string;
}

export const POST = async (response: NextRequest) => {
  // imports
  const body: bodyData = await response.json();
  const cookieStore = await cookies();
  // content
  if (!(body && body.email && body.password)) {
    return new Response(
      JSON.stringify({
        error: true,
        status: 400,
        message:
          "The json data is incompelete. And let me guess, you are not using via the website?",
      }),
      { status: 400, statusText: "Data Incompelete." },
    );
  }
  try {
    const createSession = uuidv4();
    const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    cookieStore.set("session", createSession, {
      httpOnly: true,
      expires: oneDayFromNow,
    });

    return new Response(
      JSON.stringify({
        error: false,
        status: 200,
        message: "ok",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (e: any) {
    // yeah I have no choice.
    return new Response(
      JSON.stringify({
        error: true,
        status: 500,
        message: `Server Side Error: ${e.message}`,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
