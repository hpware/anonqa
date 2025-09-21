import Client from "./client";
import { redirect } from "next/navigation";
export default async function Page(props: {
  params: Promise<{ team: string }>;
}) {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  const { team } = await props.params;
  if (!uuidRegex.test(team)) {
    redirect("/auth/logout");
  }
  return <Client slug={team} />;
}
