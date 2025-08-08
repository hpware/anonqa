import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required and must be a string." },
        { status: 400 },
      );
    }

    const userExists = await fetchQuery(api.users.doesUserNameExist, {
      username,
    });

    return NextResponse.json({ exists: userExists });
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
