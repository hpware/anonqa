import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { AccountSettings } from "@/components/account-settings";

export default async function AccountPage() {
  const session = (await cookies()).get("session")?.value;
  if (!session) redirect("/auth/login");
  const user = await fetchQuery(api.func_users.verifySession, {
    currentSession: session,
  });
  if (!user.linked) redirect("/auth/logout");
  return (
    <main className="mx-auto max-w-2xl space-y-5 p-6">
      <Link className="text-blue-600 underline" href="/manage/selectTeams">
        Back to teams
      </Link>
      <h1 className="text-2xl">Account settings</h1>
      <AccountSettings session={session} />
    </main>
  );
}
