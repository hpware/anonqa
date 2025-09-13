"use server";
import { notFound } from "next/navigation";
import Client from "./client";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const user = await fetchQuery(api.users.data, { slug: slug });
  if (user.length === 0) {
    notFound();
  }
  return (
    <div>
      <Client slug={slug} user={user} />
    </div>
  );
}
