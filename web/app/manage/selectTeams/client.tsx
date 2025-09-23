"use client";
import { Doc } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOutIcon } from "lucide-react";
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
import { redirect } from "next/navigation";

export default function Page({ teams }: { teams: Doc<"users">[] }) {
  // dialog
  const [openCreationDialog, setOpenCreationDialog] = useState<boolean>(false);
  const [openJoinDialog, setOpenJoinDialog] = useState<boolean>(false);
  const [createNewTeamTextBoxes, setCreateNewTeamTextBoxes] = useState({
    team_handle: "",
    team_name: "",
  });
  const [joinCodeTextBox, setJoinCodeTextBox] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const sendCreateRequest = async () => {
    setLoading(true);
    const req = await fetch("/api/teams/createTeam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createNewTeamTextBoxes),
    });
    if (!req.ok) {
    }
    setCreateNewTeamTextBoxes({ team_handle: "", team_name: "" });
  };
  const sendJoinRequest = async () => {};
  return (
    <>
      <div>
        <div className="absolute inset-0 flex flex-col justify-center text-center align-middle">
          <span className="text-xl font-bold barlow mb-3">Your teams</span>
          {/* team component */}
          <div className="flex flex-col gap-2 max-h-1/2 overflow-y-scroll noscrollbar ph-no-capture">
            {teams.map((i) => (
              <Link href={`/manage/${i.userId}/`}>
                <button className="flex flex-row justify-center text-center align-middle bg-gray-300 hover:bg-gray-300/70 p-3 mx-auto w-fit rounded gap-5 px-12 cursor-pointer duration-300 transition-all border border-black">
                  <img
                    src={i.imageUrl}
                    className="rounded-full w-10 h-10 m-1"
                  />
                  <div className="flex flex-col">
                    <span className="text-md font-semibold">
                      {i.displayName}
                    </span>
                    <span className="text-sm ml-3">@{i.handle}</span>
                  </div>
                </button>
              </Link>
            ))}
          </div>
          <div>
            <Button
              className="p-2 bg-blue-300 hover:bg-blue-400 transiton-all duration-300 m-2 rounded-lg"
              onClick={() => setOpenCreationDialog(!openCreationDialog)}
            >
              Create
            </Button>
            <Button
              className="p-2 bg-blue-300 hover:bg-blue-400 transiton-all duration-300 m-2 rounded-lg"
              onClick={() => setOpenJoinDialog(!openJoinDialog)}
            >
              Join
            </Button>
            <a href="/auth/logout">
              <Button className="p-2 bg-blue-300 hover:bg-blue-400 transiton-all duration-300 m-2 rounded-lg">
                <LogOutIcon />
              </Button>
            </a>
          </div>
        </div>
      </div>
      <div>
        <AlertDialog
          open={openCreationDialog}
          onOpenChange={setOpenCreationDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create new team</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="flex flex-col">
                  <span>Please enter your team name!</span>
                  <input
                    type="text"
                    className="p-2 m-1 border border-gray-300 bg-white rounded-lg"
                    value={createNewTeamTextBoxes.team_name}
                    onChange={(e) =>
                      setCreateNewTeamTextBoxes({
                        team_handle: createNewTeamTextBoxes.team_handle,
                        team_name: e.target.value,
                      })
                    }
                  />
                  <span>Please enter your team handle!</span>
                  <input
                    type="text"
                    className="p-2 m-1 border border-gray-300 bg-white rounded-lg"
                    value={createNewTeamTextBoxes.team_handle}
                    onChange={(e) =>
                      setCreateNewTeamTextBoxes({
                        team_handle: e.target.value,
                        team_name: createNewTeamTextBoxes.team_name,
                      })
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
                className="transition-all duration-300 cursor-pointer"
                onClick={sendCreateRequest}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={openJoinDialog} onOpenChange={setOpenJoinDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Join team</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="flex flex-col">
                  <span>Please enter your join code!</span>
                  <input
                    type="text"
                    className="p-2 m-1 border border-gray-300 bg-white rounded-lg"
                    value={joinCodeTextBox}
                    onChange={(e) => setJoinCodeTextBox(e.target.value)}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="transition-all duration-300 cursor-pointer"
                onClick={sendJoinRequest}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
