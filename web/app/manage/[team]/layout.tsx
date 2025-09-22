"use server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import Client from "./layout_client";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function AnonQAManagementLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ team: string }>;
}) {
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
  const { team } = await params;
  const checkAbleToBeAccessed = await fetchQuery(
    api.func_feat_manage.checkAbleToBeAccessed,
    { teamId: team, userId: String(getUser.userid) },
  );
  if (!checkAbleToBeAccessed) {
    return (
      <div className="flex flex-col justify-center abesolute inset-0 text-center h-screen w-full">
        <div className="flex flex-col justify-center text-center">
          <span className="text-3xl md:text-5xl lg:text-7xl">⊙⁠﹏⁠⊙</span>
          <span className="text-xl md:text-2xl mb-3">Aw snap!</span>
          <span>You don't have access to this team!</span>
          <span>
            Click{" "}
            <Link
              href="/manage/selectTeams"
              className="text-blue-600 hover:text-blue-600/70 transition-all duration-300"
            >
              here
            </Link>{" "}
            to select your team org.
          </span>
        </div>
      </div>
    );
  }
  return (
    <Client
      userId={String(getUser.userid)}
      fname={String(getFname)}
      slug={team}
    >
      {children}
    </Client>
  );
}
//createJoinCode
