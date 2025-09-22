import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const GET = async () => {
  const cookie = await cookies();
  cookie.delete("session");
  redirect("/auth/login");
};
