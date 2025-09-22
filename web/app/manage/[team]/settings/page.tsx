import { headers } from "next/headers";
import Client from "./client";
export default async function Page(params: Promise<{ team: string }>) {
  const headersList = await headers();
  const url =
    headersList.get("referer") || headersList.get("x-forwarded-proto") + "://";
  const protocol = url.split("://")[0] + ":";
  const host = headersList.get("host") || "localhost:3000";
  return <Client host={host} protocol={protocol} teamId={params.team} />;
}
