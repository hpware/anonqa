// server component (if i even need it)
"use server";
import Client from "./client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const cookie = await cookies();
  if (cookie.get("session")?.value) {
    redirect("/manage/");
  }
  const disableRegister = process.env.NEXT_PUBLIC_DISABLE_REGISTER !== "false"; // later change this into synced the DB
  const serverOwnerTerms = process.env.NEXT_PUBLIC_SERVER_USER_TERMS || "";
  return (
    <Client
      disableRegister={disableRegister}
      serverOwnerTerms={serverOwnerTerms}
    />
  );
}
