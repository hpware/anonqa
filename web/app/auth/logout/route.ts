import { cookies } from "next/headers";

export const GET = async () => {
  const cookie = await cookies();
  cookie.delete("session");
  return Response.redirect("/auth/login", 302);
};
