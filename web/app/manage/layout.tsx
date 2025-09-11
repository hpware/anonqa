"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "./themeProvider";
import { useTheme } from "./themeProvider";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
      className="p-2 rounded bg-gray-100 dark:bg-gray-800"
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}

export default function ManagementPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [userData, setUserData] = useState<string>("");
  const [loginId, setLoginId] = useState<string>("");
  const [flaggingFeat, setFlaggingFeat] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    setUserData(user && user.length > 0 ? user : "");
    setLoginId(token ?? "");

    if (!user || !token) {
      router.push("/auth/login");
    }
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors bg-white dark:bg-gray-900 text-black dark:text-white">
        <div className="flex flex-col">
          <div
            className={`min-h-12 fixed z-50 inset-x-0 flex flex-row justify-between text-center border transition-all duration-300 ${scrolled ? "mt-5 rounded-2xl mx-7 shadow border-gray-300/30 p-2 backdrop-blur-lg " : "mt-0 p-4 rounded-xl border-gray-300/0"}`}
          >
            <div className="flex flex-row items-center justify-center text-center px-2">
              <Link href="/manage">
                <span className="p-2">Home</span>
              </Link>
              <span className="geint-sans">
                You are logged in as {userData}!
              </span>
            </div>
            <ThemeToggle />
          </div>
          <div className="pt-12 mt-6">{children}</div>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
