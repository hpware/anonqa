"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { CheckCircle2Icon, SquirrelIcon } from "lucide-react";
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

export default function SettingsPage({
  host,
  protocol,
}: {
  host: string;
  protocol: string;
}) {
  const router = useRouter();
  const [deleteAccountVerifyTextBox, setDeleteAccountVerifyTextBox] =
    useState("");
  const getStatus =
    {}; /** useQuery(api.func_users.getUserSocialLinkAccountStatus, {
    userid: "4f3bfccf-5ab4-46b4-4e3f-c6acaae8b666",
  }); */
  return (
    <div className="flex flex-col space-y-8 p-6 max-w-4xl mx-auto transition-colors gap-2">
      <div>
        <h2>Link your account(s)</h2>
        <span>{JSON.stringify(getStatus)}</span>
        <button
          className={`p-2 m-2 rounded flex flex-row ${true ? "bg-green-400 dark:bg-green-500" : "bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 "}`}
        >
          {true && <CheckCircle2Icon />}
          <span>Threads</span>
        </button>
      </div>
      <div>
        <h2>Change ask page settings</h2>
        <div className="flex flex-col p-4">
          <span>Add your custom short link!</span>
          <div className="flex flex-row items-center gap-2">
            <span>{`${protocol}//${host}/l/`}</span>
            <input
              type="text"
              className="bg-gray-100 dark:bg-gray-800 rounded p-2"
            />
            <button className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
              <SquirrelIcon />
            </button>
          </div>
        </div>
      </div>
      <div>
        <h2>Change account settings</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button>Delete your account</button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="flex flex-col">
                  <span>
                    This action cannot be undone. This will permanently delete
                    your account and remove data from our servers.
                  </span>
                  <span>
                    Please enter "{"I want to delete my account please."}"
                  </span>
                  <input
                    type="text"
                    className="p-2 m-1 border border-gray-300 rouneded"
                    placeholder={`I want to delete my account please.`}
                    value={deleteAccountVerifyTextBox}
                    onChange={(e) =>
                      setDeleteAccountVerifyTextBox(e.target.value)
                    }
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={
                  deleteAccountVerifyTextBox !==
                  "I want to delete my account please."
                }
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
