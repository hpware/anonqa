import { NextRequest } from "next/server";
import openai from "@/lib/openai";
import { safetyPrompt } from "@/lib/prompts";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const POST = async (request: NextRequest) => {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.user !== "string" ||
    !body.user ||
    typeof body.message !== "string" ||
    !body.message.trim() ||
    body.message.length > 2000
  ) {
    return Response.json(
      {
        success: false,
        fail_message: "Invalid recipient or message (max 2000 characters).",
      },
      { status: 400 },
    );
  }
  try {
    if (process.env.NEXT_PUBLIC_CAPTCHA_FEAT === "true") {
      if (typeof body.cf_turnstile !== "string" || !body.cf_turnstile) {
        return Response.json(
          { success: false, fail_message: "Please complete the captcha." },
          { status: 400 },
        );
      }
      const result = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: process.env.CF_TURNSTILE_PRIVATE_KEY,
            response: body.cf_turnstile,
          }),
        },
      );
      const outcome = await result.json();
      if (!result.ok || !outcome.success) {
        return Response.json(
          {
            success: false,
            fail_message: "Captcha failed or expired. Please try again.",
          },
          { status: 400 },
        );
      }
    }
    const users = await fetchQuery(api.func_users.data, { slug: body.user });
    if (!users.length || users[0].deleted) {
      return Response.json(
        { success: false, fail_message: "This user does not exist." },
        { status: 404 },
      );
    }
    const completion = await openai.chat.completions.create({
      model: process.env.MOD_AI_MODEL || "openai/gpt-4o",
      messages: [
        { role: "system", content: safetyPrompt },
        { role: "user", content: body.message },
      ],
    });
    const safe = completion.choices[0]?.message.content?.trim() === "ALLOW";
    await fetchMutation(api.func_qa.qa, {
      status: safe,
      toUser: users[0].userId,
      msg: body.message,
      secret: process.env.CONVEX_SERVER_SECRET ?? "",
    });
    return Response.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Message submission failed", error);
    return Response.json(
      {
        success: false,
        fail_message: "Could not send your message. Please try again.",
      },
      { status: 503 },
    );
  }
};
