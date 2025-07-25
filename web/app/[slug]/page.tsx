"use server";
import { notFound } from "next/navigation";
import Client from "./client";
import { api } from "../../convex/_generated/api";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const checkUser = useQuery(api.pages.users, { slug: slug });
  if (!slug) {
    notFound();
  }
  return (
    <div>
      <Client slug={slug} />
    </div>
  );
}
