// server component (if i even need it)
"use server";
import Client from "./client";

export default async function LoginPage() {
  const disableRegister = process.env.NEXT_PUBLIC_DISABLE_REGISTER !== "false"; // later change this into synced the DB
  console.log(process.env.NEXT_PUBLIC_DISABLE_REGISTER);
  const serverOwnerTerms = process.env.NEXT_PUBLIC_SERVER_USER_TERMS || "";
  return (
    <Client
      disableRegister={disableRegister}
      serverOwnerTerms={serverOwnerTerms}
    />
  );
}
