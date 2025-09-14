import { internal } from "@/convex/_generated/api";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

// interfaces
interface bodyData {
  email: string;
  password: string;
  cf_turnstile_data: string;
}

export const POST = async (response: NextRequest) => {
  // imports
  const body: bodyData = await response.json();
  const cookieStore = await cookies();
  // content
  if (!(body && body.email && body.password && body.cf_turnstile_data)) {
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
    cookieStore.set("name", "value", { httpOnly: true });

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
  } catch (e) {
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
