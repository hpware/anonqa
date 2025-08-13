"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ManagementPageLayout({
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
    <div>
      <div className="flex flex-col">
        <h2>This is a Proof of Concept.</h2>
        <span>You are logged in as {userData}!</span>
        {children}
      </div>
    </div>
  );
}
