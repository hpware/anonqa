import { NextRequest } from "next/server";
import openai from "@/lib/openai";
import { safetyPrompt } from "@/lib/prompts";

interface bodyData {
  user: string;
  message: string;
  cf_turnstile?: string; // beta
}

export const POST = async (request: NextRequest) => {
  const body: Promise<bodyData> = request.json();
  const completion = await openai.chat.completions.create({
    model: process.env.MOD_AI_MODEL || "openai/gpt-4o",
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
  console.log(completion.choices[0].message);
};
