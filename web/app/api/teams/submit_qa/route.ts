import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const body: any = request.json();
    const cookie = await cookies();
    const session = cookie.get("session")?.value || "";
    if (!(session && body.type && body.q_id && body.ans)) {
      return new Response(
        JSON.stringify({
          success: false,
          status: 400,
          message: "Invalid params",
        }),
      );
    }
  } catch (e: any) {
    console.error(e);
    return new Response(
      JSON.stringify({
        success: false,
        status: 500,
        message: "Server side error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};

/**{"type":"text","q_id":"52c0f207-8d0f-4884-a8c4-5e7d4118589e"}
 */
