import { createHash } from "node:crypto";
import argon2 from "argon2";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { HttpError, serverSecret } from "./server-auth";

// Existing clients SHA-512 passwords before login/register. Preserve that format.
export const loginPassword = (password: string) =>
  createHash("sha512").update(password).digest("hex");

export async function verifyCurrentPassword(
  session: string,
  password: unknown,
) {
  if (typeof password !== "string" || !password || password.length > 1024)
    throw new HttpError(400, "Enter your current password.");
  const account = await fetchQuery(api.func_users.getAccountCredentials, {
    session,
    secret: serverSecret(),
  });
  if (!(await argon2.verify(account.passwordHash, loginPassword(password))))
    throw new HttpError(403, "Current password is incorrect.");
  return account;
}
