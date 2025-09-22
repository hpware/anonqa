import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const GET = async () => {
  const cookie = cookies();
  cookie.delete("session");
  redirect("/auth/login");
};
