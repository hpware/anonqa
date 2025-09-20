import { NextRequest } from "next/server";
import openai from "@/lib/openai";
import { safetyPrompt } from "@/lib/prompts";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

interface bodyData {
  user: string;
  message: string;
  cf_turnstile?: string; // beta
}

export const POST = async (request: NextRequest) => {
  const body: bodyData = await request.json();
  //
  var captchaSuccess = false;
  if (Boolean(process.env.NEXT_PUBLIC_CAPTCHA_FEAT)) {
    // if there is no turnstile data.
    if (!body.cf_turnstile) {
      return new Response(
        JSON.stringify({
          success: false,
          fail_message: "Captcha request failed or captcha request expired",
          downloadAuthUrl: null as any,
        }),
        { status: 400 },
      );
    }
    const CF_SECRET_KEY = process.env.CF_TURNSTILE_PRIVATE_KEY;
    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const result = await fetch(url, {
      body: JSON.stringify({
        secret: CF_SECRET_KEY,
        response: body.cf_turnstile,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const outcome = await result.json();
    const challengeTime = new Date(outcome.challenge_ts).getTime();
    const currentTime = new Date().getTime();
    if (outcome.success && currentTime - challengeTime < 3600000) {
      captchaSuccess = true;
    }
  } else {
    captchaSuccess = true;
  }
  if (!captchaSuccess) {
    return new Response(
      JSON.stringify({
        success: false,
        fail_message: "Captcha request failed or captcha request expired",
        downloadAuthUrl: null as any,
      }),
      { status: 400 },
    );
  }
  // check message ALLOWED or BLOCKED
  const completion = await openai.chat.completions.create({
    model: process.env.MOD_AI_MODEL || "openai/gpt-4o", // default model
    messages: [
      {
        role: "system",
        content: safetyPrompt,
      },
      {
        role: "user",
        content: body.message,
      },
    ],
  });
  const status = String(completion.choices[0].message);
  console.log(completion);
  console.log(status);
  let safe = false; // other models
  if (status == "ALLOW") {
    // this will all models like llama guard 4 to function correctly.
    safe = true;
  } else {
    safe = false; // default block action if the AI does not behave.
  }
  const { message, user } = body;
  const getUserDetails = await fetchQuery(api.func_users.data, { slug: user });
  try {
    await fetchMutation(api.func_qa.qa, {
      status: safe,
      toUser: getUserDetails[0].userId,
      msg: message,
    });
  } catch (e) {
    console.log(e);
  }
  return new Response(
    JSON.stringify({
      success: true,
      message: "Message sent successfully",
    }),
    { status: 200 },
  );
};
