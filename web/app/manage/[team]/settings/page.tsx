import { headers } from "next/headers";
import Client from "./client";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
export default async function Page({
  params,
}: {
  params: Promise<{ team: string }>;
}) {
  const headersList = await headers();
  const url =
    headersList.get("referer") || headersList.get("x-forwarded-proto") + "://";
  const protocol = url.split("://")[0] + ":";
  const host = headersList.get("host") || "localhost:3000";
  const { team } = await params;
  const query = await fetchQuery(api.func_users.data_dash, {
    slug: team,
  });
  return (
    <Client host={host} protocol={protocol} teamId={team} teamData={query[0]} />
  );
}
