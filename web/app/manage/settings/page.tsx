"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const getStatus = useQuery(api.users.getUserSocialLinkAccountStatus, {
    userid: "4f3bfccf-5ab4-46b4-4e3f-c6acaae8b666",
  });
  return (
    <div className="flex flex-col space-y-8 p-6 max-w-4xl mx-auto transition-colors gap-2">
      <div>
        <h2>Link your account(s)</h2>
        <span>{JSON.stringify(getStatus)}</span>
        <button
          className={`p-2 m-2 rounded flex flex-row ${(getStatus?.threads?.length ?? 0) > 0 ? "bg-green-400 dark:bg-green-500" : "bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 "}`}
        >
          {(getStatus?.threads?.length ?? 0) > 0 && <CheckCircle2Icon />}
          <span>Threads</span>
        </button>
      </div>
      <div>
        <h2>Change account settings</h2>
      </div>
    </div>
  );
}
