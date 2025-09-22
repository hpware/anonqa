import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
export const DELETE = async (request: NextRequest) => {
  const body: any = await request.json();
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (
    !(
      body &&
      body.areyousure ===
        "YES, IM SURE I WANT TO DELETE MY ACCOUNT VIA THE API" &&
      body.reallyq === "ABSOLUTELY YES! I WANT MY ACCOUNT GONE NOW!" &&
      body.captcha === "NO THANKS!"
    )
  ) {
    return new Response(
      JSON.stringify({
        success: false,
        status: 400,
        message: "Missing params",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
  useMutation(api.func_users.setUserAsDeleted);
};
