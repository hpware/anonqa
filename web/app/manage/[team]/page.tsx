import Client from "./client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { cookies } from "next/headers";
export default async function Page(props: {
  params: Promise<{ team: string }>;
}) {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  const { team } = await props.params;
  if (!uuidRegex.test(team)) {
    redirect("/auth/logout");
  }
  const headersList = await headers();
  const url =
    headersList.get("referer") || headersList.get("x-forwarded-proto") + "://";
  const protocol = url.split("://")[0] + ":";
  const host = headersList.get("host") || "localhost:3000";
  // pass the session down so the live useQuery calls re-verify access in Convex
  const cookieStore = await cookies();
  const session = String(cookieStore.get("session")?.value) || "";
  return <Client slug={team} protocol={protocol} host={host} session={session} />;
}
