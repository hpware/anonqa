"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  CheckCircle2Icon,
  CircleUserIcon,
  CircleXIcon,
  ClipboardCopyIcon,
  ClipboardIcon,
  SquirrelIcon,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import generateRandomString from "@/lib/randomGenString";
import { v4 as uuidv4 } from "uuid";

export default function SettingsPage({
  host,
  protocol,
  teamId,
}: {
  host: string;
  protocol: string;
  teamId: string;
}) {
  const router = useRouter();
  const [deleteAccountVerifyTextBox, setDeleteAccountVerifyTextBox] =
    useState("");
  const [flaggingFeat, setFlaggingFeat] = useState<boolean>(false);
  const [customMessages, setCustomMessages] = useState([]);
  const [joinCodes, setJoinCodes] = useState([]);
  const [revokeJoinCodeTextBox, setRevokeJoinCodeTextBox] = useState("");
  const [revokeUserAccessTextBox, setRevokeUserAccessTextBox] = useState("");
  const [deleteTeamTextBox, setDeleteTeamTextBox] = useState("");
  const [enableCustomMessagesPopup, setEnableCustomMessagesPopup] =
    useState<boolean>(false);

  const getStatus =
    {}; /** useQuery(api.func_users.getUserSocialLinkAccountStatus, {
    userid: "4f3bfccf-5ab4-46b4-4e3f-c6acaae8b666",
  }); */

  const getJoinCodes = async () => {
    const req = await fetch("/api/teams/joincode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teamId: teamId,
      }),
    });
  };
  useEffect(() => {});

  const revokeJoinCode = async (joinCode: string) => {
    const req = await fetch("/api/teams/joincode/revoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: joinCode,
      }),
    });
  };

  const revokeAccountAccess = async (accountId: string) => {
    const req = await fetch("/api/teams/account/revoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: accountId,
        teamId: "ccs",
      }),
    });
    const res = await req.json();
  };
  const submitDeletionOfAccount = async () => {
    const req = await fetch("/api/users/deleteAccount", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        areyousure: "YES, IM SURE I WANT TO DELETE MY ACCOUNT VIA THE API",
        reallyq: "ABSOLUTELY YES! I WANT MY ACCOUNT GONE NOW!",
        captcha: "NO THANKS!",
      }),
    });
  };

  const clearTextBoxState = () => {
    setRevokeUserAccessTextBox("");
    setRevokeJoinCodeTextBox("");
    setDeleteAccountVerifyTextBox("");
  };
  return (
    <div className="flex flex-col space-y-8 p-6 max-w-4xl mx-auto transition-colors gap-2">
      <div>
        <h2 className="text-2xl">Change team settings</h2>
        <Button
          onClick={() =>
            setEnableCustomMessagesPopup(!enableCustomMessagesPopup)
          }
          className="mr-2"
        >
          Custom Messages
        </Button>
        {enableCustomMessagesPopup && (
          <div>
            <span>Please set your custom message!</span>
            {customMessages.map((i) => (
              <div key={i}></div>
            ))}
            <div>
              <button>Add a new message!</button>
            </div>
          </div>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Create Join Code</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Your new join code!</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="flex flex-col">
                  <span>
                    Please note that this code can only be used once! And if
                    this code is ever leaked, someone with this code can add
                    into your team!
                  </span>
                  <code className="mx-0 my-auto overflow-x-scroll whitespace-nowrap py-2 px-1 -translate-x-5">
                    {`sinv_d_${generateRandomString(40, "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM")}`}
                  </code>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex justify-end sm:justify-end">
              <AlertDialogAction className="ml-auto">Ok</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="">
          <h2>Currently active join codes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 max-h-1/2 overflow-y-scroll">
            {[
              "wewf",
              "2r",
              "weww",
              "2q",
              "wqew",
              "23",
              "1wew",
              "2f",
              "wfew",
              "w2",
              "wew",
              "2",
            ].map((i) => (
              <div
                className="bg-gray-300 w-fit border border-black p-2 rounded flex flex-row gap-2"
                key={i}
              >
                <span>JoinID: sinv_d_fw0***siF9</span>
                <AlertDialog onOpenChange={clearTextBoxState}>
                  <AlertDialogTrigger asChild>
                    <button>
                      <Tooltip>
                        <TooltipTrigger>
                          <CircleXIcon />
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>Revoke this joinID</span>
                        </TooltipContent>
                      </Tooltip>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Revoke join code</AlertDialogTitle>
                      <AlertDialogDescription>
                        <div>
                          <div className="flex flex-col">
                            <span>
                              This action cannot be undone. This will
                              permanently deactivate this join code.
                            </span>
                            <span>
                              Please enter "
                              <b>{`I authorize the deletion of this join code`}</b>
                              "
                            </span>
                            <input
                              type="text"
                              className="p-2 m-1 border border-gray-300 bg-white rounded-lg"
                              placeholder={`I authorize the deletion of this join code`}
                              value={revokeJoinCodeTextBox}
                              onChange={(e) =>
                                setRevokeJoinCodeTextBox(e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={() => revokeJoinCode("d")}>
                        Ok
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
        <div className="content-center justify-center items-center">
          <h2 className="text-lg p-2">Users in this team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-1 justify-center items-center">
            {[
              "wewf",
              "2r",
              "weww",
              "2q",
              "wqew",
              "23",
              "1wew",
              "2f",
              "wfew",
              "w2",
              "wew",
              "2",
            ].map((i) => (
              <div
                className="bg-gray-300 w-fit border border-black p-2 rounded flex flex-row gap-2"
                key={i}
              >
                <CircleUserIcon />
                <div className="flex flex-col">
                  <span>Howard</span>
                  <span>howard@me.com</span>
                </div>
                <AlertDialog onOpenChange={clearTextBoxState}>
                  <AlertDialogTrigger asChild>
                    <button>
                      <Tooltip>
                        <TooltipTrigger>
                          <CircleXIcon />
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>Remove access to this account</span>
                        </TooltipContent>
                      </Tooltip>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Revoke join code</AlertDialogTitle>
                      <AlertDialogDescription>
                        <div>
                          <div className="flex flex-col">
                            <span>This will remove acccess to this user!</span>
                            <span>
                              Please enter "
                              <b>{`I authorize the deletion of this account`}</b>
                              "
                            </span>
                            <input
                              type="text"
                              className="p-2 m-1 border border-gray-300 bg-white rounded-lg"
                              placeholder={`I authorize the deletion of this account`}
                              value={revokeUserAccessTextBox}
                              onChange={(e) =>
                                setRevokeUserAccessTextBox(e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => revokeAccountAccess("dd")}
                      >
                        Ok
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
        {/*<h2>Link your account(s)</h2>
        <button
          className={`p-2 m-2 rounded flex flex-row ${true ? "bg-green-400 dark:bg-green-500" : "bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 "}`}
        >
          {true && <CheckCircle2Icon />}
          <span>Threads</span>
        </button>*/}
        <h3 className="text-xl">Important settings</h3>
        <button
          className="bg-blue-500 p-2 rounded hover:bg-blue-500/70 transition-all duration-300 cursor-pointer text-white m-1"
          onClick={() => setFlaggingFeat(!flaggingFeat)}
        >
          {flaggingFeat ? "Disable" : "Enable"} Flagging
        </button>
        <AlertDialog onOpenChange={clearTextBoxState}>
          <AlertDialogTrigger asChild>
            <button className="bg-red-500 p-2 rounded hover:bg-red-500/70 transition-all duration-300 cursor-pointer text-white m-1">
              Delete your team
            </button>
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
                    Please enter "
                    <b>{`I authorize the deletion of the account.`}</b>"
                  </span>
                  <input
                    type="text"
                    className="p-2 m-1 border border-gray-300 bg-white rounded-lg"
                    placeholder={`I authorize the deletion of the account.`}
                    value={deleteTeamTextBox}
                    onChange={(e) => setDeleteTeamTextBox(e.target.value)}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={
                  deleteAccountVerifyTextBox !==
                  "I authorize the deletion of the account."
                }
                className="bg-red-500 hover:bg-red-700 transition-all duration-300 cursor-pointer"
                onClick={submitDeletionOfAccount}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/**        <div className="flex flex-col p-4">
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
        </div> */}
      </div>
      <div>
        <h2 className="text-2xl">Change account settings</h2>
        <AlertDialog onOpenChange={clearTextBoxState}>
          <AlertDialogTrigger asChild>
            <button className="bg-red-500 p-2 rounded hover:bg-red-500/70 transition-all duration-300 cursor-pointer text-white m-1">
              Delete your account
            </button>
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
                    Please enter "
                    <b>{`I authorize the deletion of the account.`}</b>"
                  </span>
                  <input
                    type="text"
                    className="p-2 m-1 border border-gray-300 bg-white rounded-lg"
                    placeholder={`I authorize the deletion of the account.`}
                    value={deleteAccountVerifyTextBox}
                    onChange={(e) =>
                      setDeleteAccountVerifyTextBox(e.target.value)
                    }
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={
                  deleteAccountVerifyTextBox !==
                  "I authorize the deletion of the account."
                }
                className="bg-red-500 hover:bg-red-700 transition-all duration-300 cursor-pointer"
                onClick={submitDeletionOfAccount}
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
