import { cookies } from "next/headers";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";

export const GET = async () => {
  const cookie = await cookies();
  const session = cookie.get("session")?.value;
  if (session) await fetchMutation(api.func_users.revokeSession, { session });
  cookie.delete("session");
  redirect("/auth/login");
};
