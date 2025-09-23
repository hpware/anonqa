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
  fname: string;
}

export const POST = async (response: NextRequest) => {
  // imports
  const body: bodyData = await response.json();
  const cookieStore = await cookies();
  // content
  if (!(body && body.email && body.password && body.fname)) {
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
    const checkIfEmailIsLinkedToAccount = await fetchQuery(
      api.func_users.lookUpAccountsByEmail,
      { email: body.email },
    );
    if (checkIfEmailIsLinkedToAccount !== null) {
      return new Response(
        JSON.stringify({
          error: true,
          status: 200,
          message: "This email is already linked to an account.",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    const hashedPassword = await argon2.hash(body.password);
    const checkUserAccount = await fetchMutation(
      api.func_users.createLoginAccount,
      { email: body.email, password: hashedPassword, fname: body.fname },
    );
    if (!checkUserAccount.success) {
      return new Response(
        JSON.stringify({
          error: true,
          status: 500,
          message: "Failed to create account in db!",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    const saveAndGetQuery = await fetchMutation(api.func_users.createSession, {
      userId: String(checkUserAccount.userId),
    });
    if (!saveAndGetQuery.success) {
      return new Response(
        JSON.stringify({
          error: true,
          status: 500,
          message: "Failed to create session in db!",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    cookieStore.set("session", saveAndGetQuery.session, {
      //httpOnly: true,
      expires: saveAndGetQuery.expiresAt,
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
