"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";

export default function SettingsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<string>("");
  const [loginId, setLoginId] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [flaggingFeat, setFlaggingFeat] = useState<boolean>(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    setUserData(user && user.length > 0 ? user : "");
    setLoginId(token ?? "");
  }, [router]);

  const message = useQuery(api.qa.getViaId, { id: "myid" }) || [];

  return (
    <div className="flex flex-col space-y-8 p-6 max-w-4xl mx-auto transition-colors">
      <div>
        <h2>Link your account(s)</h2>
        <button>Threads</button>
        <button>X</button>
      </div>
    </div>
  );
}
