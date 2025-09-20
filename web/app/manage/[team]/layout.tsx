"use server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import Client from "./layout_client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AnonQAManagementLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // server side checks
  const cookie = await cookies();
  const session = String(cookie.get("session")?.value) || "";
  const getUser = await fetchQuery(api.func_users.verifySession, {
    currentSession: session,
  });
  if (!getUser.linked) {
    // force to logout action to clear session
    redirect("/auth/logout");
  }
  const getFname = await fetchQuery(api.func_users.getFname, {
    userId: String(getUser.userid),
  });
  return (
    <Client userId={String(getUser.userid)} fname={String(getFname)}>
      {children}
    </Client>
  );
}
