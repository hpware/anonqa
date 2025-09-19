"use server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import Client from "./client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const cookie = await cookies();
  const session = String(cookie.get("session")) || "";
  const getUser = await fetchQuery(api.func_users.verifySession, {
    currentSession: session,
  });
  console.log(session);
  console.log(getUser);
  if (!getUser.linked) {
    // force to logout action to clear session
    redirect("/auth/logout");
  }
  const teams = await fetchQuery(api.func_feat_manage.getTeams, {
    userId: String(getUser.userid),
  });
  console.log(teams);
  return <Client teams={["teams"]} />;
}
