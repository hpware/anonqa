import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { ThemeProvider } from "../[team]/themeProvider";

export default async function FlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await cookies()).get("session")?.value;
  if (!session) redirect("/auth/login");
  const account = await fetchQuery(api.func_users.verifySession, {
    currentSession: session,
  });
  if (!account.linked) redirect("/auth/logout");
  return <ThemeProvider>{children}</ThemeProvider>;
}
