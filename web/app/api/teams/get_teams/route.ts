import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  return new Response("Hi");
};
