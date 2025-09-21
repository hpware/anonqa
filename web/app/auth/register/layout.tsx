import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    process.env.NEXT_PUBLIC_DISABLE_REGISTER !== "false"
      ? "Registering is disabled on this server."
      : "Register | AnonQA Dashboard",
  description:
    process.env.NEXT_PUBLIC_DISABLE_REGISTER !== "false"
      ? "Registering is disabled on this server."
      : "Registering page for anonqa",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
