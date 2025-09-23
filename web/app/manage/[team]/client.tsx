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

export default function Page({
  slug,
  host,
  protocol,
}: {
  slug: string;
  host: string;
  protocol: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<string>("unanswered");

  const getUserDetails = useQuery(api.func_users.data_dash, { slug: slug });
  const messages =
    useQuery(api.func_qa.getAllToUser, {
      user: getUserDetails?.[0]?.userId || "",
    }) || [];

  const getTeamSlugData = useQuery(api.func_users.getTeamSlugViaTeamId, {
    teamId: slug,
  });

  const ignoreTextAction = async (id: string) => {
    await fetch("/api/teams/submit_qa", {
      method: "POST",
      headers: {
        "Content-Type": "applications/json",
      },
      body: JSON.stringify({
        type: "ignore",
        q_id: id,
        ans: "filler",
        team_id: slug,
      }),
    });
  };
  const unansweredMessages = messages.filter(
    (i) => !i.answered && i.moderation && !i.ignore,
  );
  const answeredMessages = messages.filter(
    (i) => i.answered && i.moderation && !i.ignore,
  );
  const filteredMessages = messages.filter((i) => !i.moderation && !i.ignore);

  return (
    <div className={`transition-colors`}>
      <div className="flex flex-row w-fit m-auto gap-2"></div>
      <div className="justify-center text-center flex flex-col items-center [&_a]:text-blue-500 [&_a]:hover:text-blue-500/70">
        <span>Share your link to the world!</span>
        <code className="ph-no-capture p-2 bg-gray-300 rounded">
          {protocol}//{host}/ask/{getTeamSlugData}
        </code>
      </div>
      <div className="flex fle-row justify-center text-center gap-2 pt-2">
        {/**tabs*/}
        <Button
          onClick={() => setMode("unanswered")}
          className={`${mode === "unanswered" && "bg-gray-700"}`}
        >
          Unanswered
        </Button>
        <Button
          onClick={() => setMode("answered")}
          className={`${mode === "answered" && "bg-gray-700"}`}
        >
          Answered
        </Button>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button className={`${mode === "filtered" && "bg-gray-700"}`}>
              Filtered
            </Button>
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
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600/70 transition-all duration-300 cursor-pointer"
                onClick={() => setMode("filtered")}
              >
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
              <TableHead>Question</TableHead>
              {mode === "answered" && <TableHead>Type</TableHead>}
              {mode === "answered" && <TableHead>Answer</TableHead>}
              <TableHead className="align-left">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {messages.length !== 0 && (
            <TableBody>
              {mode === "unanswered" &&
                unansweredMessages.map((i: any, index: number) => (
                  <TableRow
                    key={index}
                    className="border-b dark:border-gray-700"
                  >
                    <TableCell className="font-medium">{i.msg}</TableCell>
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
                            <AlertDialogAction
                              className="transition-all duration-300 cursor-pointer"
                              onClick={() => ignoreTextAction(i.msgId)}
                            >
                              Ok
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              {mode === "answered" &&
                answeredMessages.map((i: any, index: number) => (
                  <TableRow
                    key={index}
                    className="border-b dark:border-gray-700"
                  >
                    <TableCell className="font-medium">{i.msg}</TableCell>
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
                            <AlertDialogAction
                              className="transition-all duration-300 cursor-pointer"
                              onClick={() => ignoreTextAction(i.msgId)}
                            >
                              Ok
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              {mode === "filtered" &&
                filteredMessages.map((i: any, index: number) => (
                  <TableRow
                    key={index}
                    className="border-b dark:border-gray-700"
                  >
                    <TableCell className="font-medium">{i.msg}</TableCell>
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
                            <AlertDialogAction
                              className="transition-all duration-300 cursor-pointer"
                              onClick={() => ignoreTextAction(i.msgId)}
                            >
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
