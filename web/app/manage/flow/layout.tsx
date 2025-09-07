"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "../themeProvider";
import { useTheme } from "../themeProvider";

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

export default function FlowLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [userData, setUserData] = useState<string>("");
  const [loginId, setLoginId] = useState<string>("");
  const [flaggingFeat, setFlaggingFeat] = useState<boolean>(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    setUserData(user && user.length > 0 ? user : "");
    setLoginId(token ?? "");

    if (!user || !token) {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors bg-white dark:bg-gray-900 text-black dark:text-white">
        <div className="flex justify-between items-center p-4">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </ThemeProvider>
  );
}
