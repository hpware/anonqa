"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import { SendIcon, ToggleRightIcon } from "lucide-react";
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
  const messages = useQuery(api.qa.get, { user: userData }) || [];
  return (
    <div>
      <div className="flex flex-row w-fit m-auto gap-2">
        <button className="p-2 bg-gray-400 rounded" onClick={logoutAction}>
          Logout
        </button>
        <button className="p-2 bg-gray-400 rounded">
          {flaggingFeat ? "Disable" : "Enable"} Flagging
        </button>
      </div>
      <div className="w-[80%] m-auto p-2">
        <Table>
          <TableCaption>Messages</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">MsgID</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Flagged?</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((i: any, index: number) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{i.msgId}</TableCell>
                <TableCell>{i.msg}</TableCell>
                <TableCell>{i.answered ? "已回答" : "尚未回答"}</TableCell>
                <TableCell>No</TableCell>
                <TableCell className="flex flex-row gap-2">
                  <button>Report</button>
                  <Link href={`/manage/answer/${i.msgId}`}>
                    <button>Answer</button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col">
        <span>Add your custom short link!</span>
        <div className="flex flex-row">
          <span>{`http://localhost:3000`}/l/ </span>
          <input type="text" className="bg-gray-100 rounded" />
          <button>
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
