"use server";
import Client from "./client";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function LoginPage() {
  const cookie = await cookies();
  if (cookie.get("session")?.value) {
    redirect("/manage/");
  }
  const serverOwnerTerms = process.env.NEXT_PUBLIC_SERVER_USER_TERMS || "";

  return <Client serverOwnerTerms={serverOwnerTerms} />;
}
