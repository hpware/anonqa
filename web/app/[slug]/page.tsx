"use server";
import { notFound } from "next/navigation";
import Client from "./client";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  if (!slug) {
    notFound();
  }
  return (
    <div>
      <Client slug={slug} />
    </div>
  );
}
