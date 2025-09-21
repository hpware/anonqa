import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | AnonQA Dashboard",
  description: "Login page for the anonqa app",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
