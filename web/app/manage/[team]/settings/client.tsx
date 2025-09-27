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
  CloudCheck,
  CloudCheckIcon,
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
import hideJoinCodeOnClientSide from "@/lib/hideJoinCodeOnClentSide";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import { toast } from "sonner";

export default function SettingsPage({
  host,
  protocol,
  teamId,
  teamData,
  userInfo,
}: {
  host: string;
  protocol: string;
  teamId: string;
  teamData: any;
  userInfo: any;
}) {
  const { width, height } = useWindowSize();
  const [deleteAccountVerifyTextBox, setDeleteAccountVerifyTextBox] =
    useState("");
  const [customMessageTextbox, setCustomMessageTextbox] = useState("");
  const [customMessages, setCustomMessages] = useState([]);
  const [revokeJoinCodeTextBox, setRevokeJoinCodeTextBox] = useState("");
  const [revokeUserAccessTextBox, setRevokeUserAccessTextBox] = useState("");
  const [customPFPTextBox, setCustomPFPTextBox] = useState("");
  const [deleteTeamTextBox, setDeleteTeamTextBox] = useState("");
  const [joinCodePlainTextBox, setJoinCodePlainTextBox] = useState("");
  const [teamData2, setTeamData2] = useState(teamData);
  const [openShadCnPopUp, setOpenShadCnPopUp] = useState({
    revokeId: false,
    revokeAccount: false,
  });
  const [imageUrlChangeTextBox, setImageUrlChangeTextBox] = useState({
    status: false,
    text: teamData2.imageUrl,
  });
  const [joinCodeCreate, setJoinCodeCreate] = useState({
    loading: false,
    success: false,
  });
  const [submitProfileData, setSubmitProfileData] = useState({
    loading: false,
    success: false,
    error: "",
  });
  const [updateLoginDetails, setUpdateLoginDetails] = useState({
    email: {
      allowedToChange: false,
      current: "",
      new: "",
      newButAgain: "",
    },
    password: {
      allowedToChange: false,
      current: "",
      new: "",
      newButAgain: "",
    },
  });
  const [confetiAction, setConfetiAction] = useState(false);
  const getAllJoinIds =
    useQuery(api.func_feat_manage.getJoinCodeData, {
      teamId: teamId,
    }) || [];

  const getAllUserAccountsInThisTeam =
    useQuery(api.func_feat_manage.getAllUserInfoInATeam, {
      teamId: teamId,
      currentUserId: userInfo.userid,
    }) || [];

  // useEffects
  useEffect(
    () => {
      if (confetiAction === true) {
        setTimeout(() => setConfetiAction(false), 5000);
      }
    },
    [confetiAction], // 5 sec confeti max,
  );

  useEffect(() => {
    if (
      teamData.customMessages !== undefined &&
      teamData.customMessages?.length !== 0
    ) {
      setCustomMessages(teamData.customMessages);
    }
  }, [teamData.customMessages]);

  const sendNewCustomMessage = async () => {
    toast.info("Creating custom message...");
    const req = await fetch("/api/customMessages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "create",
        teamId: teamId,
        msg: customMessageTextbox,
      }),
    });
    if (!req.ok) {
      toast.error("Failed to send custom message! dw you can still resent it!");
      return;
    }
    const res = await req.json();
    if (!res.success) {
      toast.error(
        `Failed to send custom message! dw you can still resent it! Server Failed with code: ${res.status} and message: ${res.message}`,
      );
      return;
    }
    toast.success("Custom Message Created!");
    setCustomMessageTextbox("");
  };
  const deleteCustomMessage = async (id: string) => {
    toast.info("Deleting custom message...");
    const req = await fetch("/api/customMessages", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "delete",
        teamId: teamId,
        msgId: id,
      }),
    });

    if (!req.ok) {
      toast.error("Delete Custom Message: Request Failed");
      return;
    }
    const res = await req.json();
    if (!res.success) {
      toast.error(
        `Delete Custom Message: Server Failed with code: ${res.status} and message: ${res.message}`,
      );
      return;
    }
    toast.success("Custom Message Deleted!");
    setCustomMessageTextbox("");
  };
  const createJoinCode = async () => {
    try {
      setJoinCodeCreate({
        loading: true,
        success: false,
      });
      const req = await fetch("/api/teams/joincode/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team_id: teamId,
        }),
      });
      const res = await req.json();
      setJoinCodePlainTextBox(res.joinId);
      setJoinCodeCreate({
        loading: false,
        success: true,
      });
      setConfetiAction(true);
    } catch (e) {
      console.error(e);
      setJoinCodeCreate({
        loading: false,
        success: false,
      });
    }
  };

  const revokeJoinCode = async (joinCode: string) => {
    toast.info("Revoking Join code...");
    const req = await fetch("/api/teams/joincode/revoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: joinCode,
        team_id: teamId,
      }),
    });
    if (!req.ok) {
      toast.error("Revoke join code: Request Failed");
      return;
    }
    const res = await req.json();
    if (!res.success) {
      toast.error(
        `Revoke join code: Server Failed with code: ${res.status} and message: ${res.message}`,
      );
      return;
    }
    toast.success("Join Code Revoked!");
  };

  const revokeAccountAccess = async (accountId: string) => {
    toast.info("Revoking Account Access...");
    const req = await fetch("/api/teams/account/revoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: accountId,
        teamId: teamId,
      }),
    });
    if (!req.ok) {
      toast("Revoke account access: Request Failed");
      return;
    }
    const res = await req.json();
    if (!res.success) {
      toast(
        `Revoke account access: Server Failed with code: ${res.status} and message: ${res.message}`,
      );
      return;
    }
    toast("Account Access Revoked!");
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
    if (!req.ok) {
      toast.error("Delete account: Request Failed");
    }
    const res = await req.json();
  };

  const submitUpdatesToTheServer = async () => {
    setSubmitProfileData({
      success: false,
      loading: true,
      error: "",
    });
    const req = await fetch("/api/teams/save_profile_settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        team_id: teamId,
        new_displayName: teamData2.displayName,
        new_handle: teamData2.handle,
        new_placeholder: teamData2.defaultMessages || "",
        customRandomMessages: teamData2.customRandomMessages || [],
        new_imageUrl: teamData2.imageUrl,
      }),
    });
    if (!req.ok) {
      toast("Profile data failed submition :O");
      setSubmitProfileData({
        success: false,
        loading: false,
        error: "Error",
      });
      return;
    }
    const res = await req.json();
    if (!res.success) {
      toast(`Profile data failed submition :O ${res.message}`);
      setSubmitProfileData({
        success: false,
        loading: false,
        error: `${res.message}`,
      });
    }
    toast("Profile data submitted successfully!");
    setConfetiAction(true);
    setSubmitProfileData({
      success: true,
      loading: false,
      error: "",
    });
  };

  const setPFPImage = () => {
    setTeamData2({
      deleted: teamData2.deleted,
      displayName: teamData2.displayName,
      handle: teamData2.handle,
      imageUrl: imageUrlChangeTextBox.text,
      pageType: teamData2.pageType,
      setCustomRandomMessages: teamData2.setCustomRandomMessages,
      customRandomMessages: teamData2.customRandomMessages,
      userId: teamData2.userId,
      defaultMessages: teamData2.defaultMessages,
    });
    toast("Profile pic loaded!");
  };
  const clearTextBoxState = () => {
    setRevokeUserAccessTextBox("");
    setRevokeJoinCodeTextBox("");
    setDeleteAccountVerifyTextBox("");
    setOpenShadCnPopUp({
      revokeId: false,
      revokeAccount: false,
    });
  };

  const checkIfCurrentSomethingIsCorrect = async (type: string) => {
    const req = await fetch("/api/teams/checkifsomethingiscorrect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkType: type,
      }),
    });
  };

  return (
    <div className="flex flex-col space-y-8 p-6 max-w-4xl mx-auto transition-colors gap-2">
      {confetiAction && <Confetti width={width} height={height} />}
      <div>
        <h2 className="text-2xl">Change team settings</h2>
        <div>
          <span className="text-lg">Update Profile!</span>
          <div>
            <div className="flex flex-row ph-no-capture">
              <button
                onClick={() =>
                  setImageUrlChangeTextBox({
                    status: !imageUrlChangeTextBox.status,
                    text: imageUrlChangeTextBox.text,
                  })
                }
              >
                <img
                  alt="Profile Picture"
                  src={teamData2.imageUrl}
                  className="w-12 h-12 rounded-full p-1 ph-no-capture"
                />
              </button>
              <div className="flex flex-col ml-2 ph-no-capture">
                {imageUrlChangeTextBox.status && (
                  <div className="flex flex-row gap-1">
                    <input
                      type="text"
                      value={imageUrlChangeTextBox.text}
                      placeholder="Paste your image url!"
                      onChange={(e) =>
                        setImageUrlChangeTextBox({
                          status: imageUrlChangeTextBox.status,
                          text: e.target.value,
                        })
                      }
                    />
                    <Button onClick={setPFPImage}>Apply</Button>
                  </div>
                )}
                <input
                  type="text"
                  value={teamData2.displayName}
                  placeholder="Your display name!"
                  onChange={(e) =>
                    setTeamData2({
                      deleted: teamData2.deleted,
                      displayName: e.target.value,
                      handle: teamData2.handle,
                      imageUrl: teamData2.imageUrl,
                      pageType: teamData2.pageType,
                      setCustomRandomMessages:
                        teamData2.setCustomRandomMessages,
                      customRandomMessages: teamData2.customRandomMessages,
                      userId: teamData2.userId,
                      defaultMessages: teamData2.defaultMessages,
                    })
                  }
                />
                <div className="flex flex-row">
                  <span>@</span>
                  <input
                    type="text"
                    value={teamData2.handle}
                    placeholder="Your account handle!"
                    onChange={(e) =>
                      setTeamData2({
                        deleted: teamData2.deleted,
                        displayName: teamData2.displayName,
                        handle: e.target.value,
                        imageUrl: teamData2.imageUrl,
                        pageType: teamData2.pageType,
                        setCustomRandomMessages:
                          teamData2.setCustomRandomMessages,
                        customRandomMessages: teamData2.customRandomMessages,
                        userId: teamData2.userId,
                        defaultMessages: teamData2.defaultMessages,
                      })
                    }
                  />
                </div>
                <input
                  type="text"
                  value={teamData2.defaultMessages[0]}
                  placeholder="Your page's placeholder!"
                  onChange={(e) =>
                    setTeamData2({
                      deleted: teamData2.deleted,
                      displayName: teamData2.displayName,
                      handle: teamData2.handle,
                      imageUrl: teamData2.imageUrl,
                      pageType: teamData2.pageType,
                      setCustomRandomMessages:
                        teamData2.setCustomRandomMessages,
                      customRandomMessages: teamData2.customRandomMessages,
                      userId: teamData2.userId,
                      defaultMessages: [e.target.value],
                    })
                  }
                />
              </div>
            </div>
            <Button
              onClick={submitUpdatesToTheServer}
              disabled={submitProfileData.loading}
            >
              {submitProfileData.loading ? (
                <span className="text-white flex flex-row gap-2">
                  <svg
                    aria-hidden="true"
                    className="w-12 h-12 translate-x-1 text-white animate-spin fill-blue-400"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="text-white">Submiting...</span>
                </span>
              ) : (
                <span className="text-white">Submit!</span>
              )}
            </Button>
          </div>
        </div>
        <div>
          <h2 className="text-lg">Manage Custom Messages!</h2>
          <AlertDialog>
            <AlertDialogTrigger>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="mr-2">Add a Custom Message</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Create custom messages!</span>
                </TooltipContent>
              </Tooltip>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create new custom messsage</AlertDialogTitle>
                <AlertDialogDescription>
                  <div>
                    <div className="flex flex-col">
                      <span>Please enter your custom randomized message!</span>
                      <input
                        type="text"
                        className="p-2 m-1 border border-gray-300 bg-white rounded-lg"
                        value={customMessageTextbox}
                        onChange={(e) =>
                          setCustomMessageTextbox(e.target.value)
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
                  onClick={sendNewCustomMessage}
                  disabled={customMessageTextbox.length === 0}
                >
                  Ok
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {JSON.stringify(customMessages) === "[]" && (
            <div>
              <span>
                🤔 Hmm, you don't seem like have any custom messages setted up
                yet.
              </span>
            </div>
          )}
          <div>
            {customMessages.map((i) => (
              <div key={i}></div>
            ))}
          </div>
        </div>
        <div className="">
          <h2 className="text-lg">Manage Join Codes!</h2>
          <Button onClick={createJoinCode} disabled={joinCodeCreate.loading}>
            {joinCodeCreate.loading ? (
              <span className="text-white flex flex-row gap-2">
                <svg
                  aria-hidden="true"
                  className="w-12 h-12 translate-x-1 text-white animate-spin fill-blue-400"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="text-white">Creating join code!</span>
              </span>
            ) : (
              <span className="text-white">Create join code</span>
            )}
          </Button>

          <AlertDialog
            open={joinCodeCreate.success}
            onOpenChange={(e) =>
              setJoinCodeCreate({ success: false, loading: false })
            }
          >
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
                    <div className="relative w-full bg-gray-100 rounded-md my-2">
                      <div className="overflow-x-auto">
                        <code className="block whitespace-nowrap py-2 px-3 font-mono text-sm ph-no-capture">
                          {joinCodePlainTextBox}
                        </code>
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex justify-end sm:justify-end">
                <AlertDialogAction className="ml-auto">Ok</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <h2 className="text-md">Currently active</h2>
          {getAllJoinIds.length === 0 && (
            <div>
              <span className="p-2">
                🤔 Hmm, don't seem like this team has any join codes rn!
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 max-h-1/2 overflow-y-scroll ph-no-capture">
            {getAllJoinIds.length !== 0 &&
              getAllJoinIds.map((i: any) => (
                <div
                  className="bg-gray-300 w-fit border border-black p-2 rounded flex flex-row gap-2"
                  key={i}
                >
                  <span>JoinID: {hideJoinCodeOnClientSide(i)}</span>
                  <AlertDialog onOpenChange={clearTextBoxState}>
                    <AlertDialogTrigger>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() =>
                              setOpenShadCnPopUp({
                                revokeId: true,
                                revokeAccount: false,
                              })
                            }
                          >
                            <CircleXIcon />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>Revoke this joinID</span>
                        </TooltipContent>
                      </Tooltip>
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
                        <AlertDialogAction
                          onClick={() => revokeJoinCode(i)}
                          disabled={
                            revokeJoinCodeTextBox !==
                            "I authorize the deletion of this join code"
                          }
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
        <div className="content-center justify-center items-center">
          <h2 className="text-lg p-2">Users in this team</h2>
          {getAllUserAccountsInThisTeam.filter((i) => i !== null).length ===
            0 && (
            <div>
              <span className="p-2">
                🤔 Hmm, doesn't seem like you have other members in this team.
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-1 justify-center items-center ph-no-capture">
            {getAllUserAccountsInThisTeam.filter((i) => i !== null).length !==
              0 &&
              getAllUserAccountsInThisTeam
                .filter((i) => i !== null)
                .map((i: any) => (
                  <div
                    className="bg-gray-300 w-fit border border-black p-2 rounded flex flex-row gap-2"
                    key={i.userId}
                  >
                    <CircleUserIcon />
                    <div className="flex flex-col">
                      <span>{i.fname || "Unknown"}</span>
                      <span>{i.email}</span>
                    </div>
                    <AlertDialog onOpenChange={clearTextBoxState}>
                      <AlertDialogTrigger asChild>
                        <button>
                          <Tooltip>
                            <TooltipTrigger asChild>
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
                          <AlertDialogTitle>
                            Revoke account access
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            <div>
                              <div className="flex flex-col">
                                <span>
                                  This will remove acccess to this user!
                                </span>
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
                            onClick={() => revokeAccountAccess(i.userId)}
                            disabled={
                              revokeUserAccessTextBox !==
                              "I authorize the deletion of this account"
                            }
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
        <AlertDialog onOpenChange={clearTextBoxState}>
          <AlertDialogTrigger asChild>
            <Button className="bg-red-500 p-2 rounded hover:bg-red-500/70 transition-all duration-300 cursor-pointer text-white m-1">
              Delete your team
            </Button>
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
      </div>
      {/**  const [updateLoginDetails, setUpdateLoginDetails] = useState({
        email: {
          allowedToChange: false,
          current: "",
          new: "",
          newButAgain: "",
        },
        password: {
          allowedToChange: false,
          current: "",
          new: "",
          newButAgain: "",
        },
      }); */}
      <div>
        <h2 className="text-2xl">Change account settings</h2>
        {/**        <div className="flex flex-col gap-1">
  <span>
    Please enter you current email to change it:{" "}
    <input
      type="email"
      value={updateLoginDetails.email.current}
      onChange={(e) =>
        setUpdateLoginDetails({
          email: {
            allowedToChange: false,
            current: e.target.value,
            new: updateLoginDetails.email.new,
            newButAgain: updateLoginDetails.email.newButAgain,
          },
          password: updateLoginDetails.password,
        })
      }
      className="border mr-2 rounded"
    />
    <Button
      onClick={() => {
        checkIfCurrentSomethingIsCorrect("email");
      }}
    >
      <CloudCheckIcon />
    </Button>
  </span>
  <span>
    Please enter you current password to change it:{" "}
    <input
      type="password"
      value={updateLoginDetails.password.current}
      onChange={(e) =>
        setUpdateLoginDetails({
          email: updateLoginDetails.email,
          password: {
            allowedToChange: false,
            current: e.target.value,
            new: updateLoginDetails.password.new,
            newButAgain: updateLoginDetails.password.newButAgain,
          },
        })
      }
      className="border mr-2 rounded"
    />
    <Button
      onClick={() => {
        checkIfCurrentSomethingIsCorrect("email");
      }}
    >
      <CloudCheckIcon />
    </Button>
  </span>
</div> */}
        <div>
          {" "}
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
    </div>
  );
}
