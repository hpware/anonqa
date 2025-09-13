import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const GET = async (request: NextRequest, context: Props) => {
  try {
    const { slug } = await context.params;
    const fetchUrlStuff = null; /** await fetchQuery(api.shortlink.getTo, {
      slug: slug,
    }); */
    if (fetchUrlStuff === null) {
      return Response.redirect("/404", 301);
    }
    return Response.redirect(fetchUrlStuff, 308);
  } catch (e) {
    console.log(e);
    return new Response("500 Server Error", {
      status: 500,
    });
  }
};
