"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
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
  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    setUserData(user && user.length > 0 ? user : "");
    setLoginId(token ?? "");

    if (!user || !token) {
      router.push("/manage/login");
    }
  }, [router]);
  const logoutAction = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/manage/login");
  };
  const messages = useQuery(api.qa.get, { user: userData }) || [];
  return (
    <div>
      <div className="flex flex-col">
        <h2>This is a Proof of Concept.</h2>
        <span>
          Yeah I think you are logged in :) You are logged in as "{userData}"!
        </span>
        <button
          className="p-2 bg-gray-400 w-fit m-auto rounded"
          onClick={logoutAction}
        >
          Logout
        </button>
        <div className="w-[80%] m-auto p-2">
          <Table>
            <TableCaption>Messages</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">MsgID</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((i: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{i.msgId}</TableCell>
                  <TableCell>{i.msg}</TableCell>
                  <TableCell>{i.answered ? "已回答" : "尚未回答"}</TableCell>
                  {/*<button onClick={}>Answer</button>*/}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
