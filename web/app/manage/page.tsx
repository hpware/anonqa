"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import { SendIcon } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Page() {
  const router = useRouter();
  const [userData, setUserData] = useState<string>("");
  const [loginId, setLoginId] = useState<string>("");
  const [flaggingFeat, setFlaggingFeat] = useState<boolean>(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    setUserData(user && user.length > 0 ? user : "");
    setLoginId(token ?? "");
  }, [router]);

  const logoutAction = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  const messages = useQuery(api.func_qa.get, { user: userData }) || [];

  return (
    <div className={`transition-colors`}>
      <div className="flex flex-row w-fit m-auto gap-2">
        <button
          className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={logoutAction}
        >
          Logout
        </button>
        <button className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
          {flaggingFeat ? "Disable" : "Enable"} Flagging Messages
        </button>
        <Link href="/manage/settings">
          <button className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
            Settings
          </button>
        </Link>
      </div>

      <div className="w-[80%] m-auto p-2 geist-mono">
        <Table>
          <TableCaption>Messages</TableCaption>
          <TableHeader>
            <TableRow className="border-b dark:border-gray-700">
              <TableHead className="w-[100px]">MsgID</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Flagged?</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((i: any, index: number) => (
              <TableRow key={index} className="border-b dark:border-gray-700">
                <TableCell className="font-medium">{i.msgId}</TableCell>
                <TableCell>{i.msg}</TableCell>
                <TableCell>{i.answered ? "已回答" : "尚未回答"}</TableCell>
                <TableCell>No</TableCell>
                <TableCell className="flex flex-row gap-2">
                  <button className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                    Report
                  </button>
                  <Link href={`/manage/answer/${i.msgId}`}>
                    <button className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                      Answer
                    </button>
                  </Link>
                  <button className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                    Ignore
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col p-4">
        <span>Add your custom short link!</span>
        <div className="flex flex-row items-center gap-2">
          <span>{`http://localhost:3000`}/l/</span>
          <input
            type="text"
            className="bg-gray-100 dark:bg-gray-800 rounded p-2"
          />
          <button className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
