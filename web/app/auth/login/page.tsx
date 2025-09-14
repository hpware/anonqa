// server component (if i even need it)
"use server";
import Client from "./client";

export default async function LoginPage() {
  const serverOwnerTerms = process.env.NEXT_PUBLIC_SERVER_USER_TERMS || "";

  return <Client serverOwnerTerms={serverOwnerTerms} />;
}
