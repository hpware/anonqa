"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function Page({ slug }: { slug: string }) {
  const router = useRouter();
  const [userData, setUserData] = useState<string>("");
  const [loginId, setLoginId] = useState<string>("");
  const [flaggingFeat, setFlaggingFeat] = useState<boolean>(false);
  const [reportingData, setReportingData] = useState();
  const [loading, setLoading] = useState();
  const getUserDetails = useQuery(api.func_users.data_dash, { slug: slug });
  const messages =
    useQuery(api.func_qa.getAllToUser, {
      user: getUserDetails?.[0]?.userId || "",
    }) || [];

  const getTeamSlugData = useQuery(api.func_users.getTeamSlugViaTeamId, {
    teamId: slug,
  });

  return (
    <div className={`transition-colors`}>
      <div className="flex flex-row w-fit m-auto gap-2"></div>
      <div className="justify-center text-center flex flex-col items-center [&_a]:text-blue-500 [&_a]:hover:text-blue-500/70">
        <span>Share your link to the world!</span>
        <span className="ph-no-capture">
          http://localhost:3000/ask/{getTeamSlugData}
        </span>
      </div>
      <div className="flex fle-row justify-center text-center gap-2 pt-2">
        {/**tabs*/}
        <Button>Unanswered</Button>
        <Button>Answered</Button>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button>Filtered</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Go to filtered messages</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="flex flex-col text-red-500">
                  WARNING! You are going into the filtered messages mode, you
                  might see some not appropriate content.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction className="bg-red-500 hover:bg-red-600/70 transition-all duration-300 cursor-pointer">
                Ok
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="w-[80%] m-auto p-2 geist-mono">
        <Table className="ph-no-capture">
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
          {messages.length !== 0 && (
            <TableBody>
              {messages.map((i: any, index: number) => (
                <TableRow key={index} className="border-b dark:border-gray-700">
                  <TableCell className="font-medium">{i.msgId}</TableCell>
                  <TableCell>{i.msg}</TableCell>
                  <TableCell>{i.answered ? "已回答" : "尚未回答"}</TableCell>
                  <TableCell>No</TableCell>
                  <TableCell className="flex flex-row gap-2">
                    <Link href={`/manage/${slug}/answer/${i.msgId}`}>
                      <button className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                        Answer
                      </button>
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger>
                        <button className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                          Ignore
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Ignore message</AlertDialogTitle>
                          <AlertDialogDescription>
                            <div className="flex flex-col">
                              Note that you will not be able to view this
                              message again!
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="cursor-pointer">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction className="transition-all duration-300 cursor-pointer">
                            Ok
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
        {messages.length === 0 && (
          <div>
            <span>Waiting for messages...</span>
          </div>
        )}
      </div>
      {/**{<ReportMenu /> */}
    </div>
  );
}
