import { redirect } from "next/navigation";
import Client from "./client";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { cookies } from "next/headers";
export default async function Page(props: {
  params: Promise<{ slug: string; team: string }>;
}) {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  const { slug, team } = await props.params;
  if (!uuidRegex.test(slug)) {
    redirect(`/manage/${team}`);
  }
  const cookieStore = await cookies();
  const session = String(cookieStore.get("session")?.value) || "";
  const message = await fetchQuery(api.func_qa.getViaId, {
    id: slug,
    session: session,
  });
  return <Client slug={slug} teamId={team} message={message} session={session} />;
}
