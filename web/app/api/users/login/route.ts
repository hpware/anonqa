import { api } from "@/convex/_generated/api";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import argon2 from "argon2";

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
    const checkUserAccount = await fetchQuery(
      api.func_users.checkAccountAndReturnPassword,
      { email: body.email },
    );
    if (!checkUserAccount.valid) {
      return new Response(
        JSON.stringify({
          error: true,
          status: 200,
          message: "Incorrect Email or Password",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    try {
      const matchHash = await argon2.verify(
        String(checkUserAccount.passwordHash),
        body.password,
      );
      if (!matchHash) {
        return new Response(
          JSON.stringify({
            error: true,
            status: 200, // not the best status code (please change this)
            message: "Incorrect Email or Password",
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }
    } catch (e) {
      console.log(e);
      return new Response(
        JSON.stringify({
          error: true,
          status: 500,
          message: "Server Side Error: Matching failed",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
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
