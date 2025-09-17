import { headers } from "next/headers";
import Client from "./client";
export default async function Page() {
  const headersList = await headers();
  const url =
    headersList.get("referer") || headersList.get("x-forwarded-proto") + "://";
  const protocol = url.split("://")[0] + ":";
  const host = headersList.get("host") || "localhost:3000";
  return <Client host={host} protocol={protocol} />;
}
