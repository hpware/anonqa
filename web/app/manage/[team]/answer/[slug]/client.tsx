"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { Threads } from "./formats";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CanvasText } from "./canvasText";

gsap.registerPlugin(useGSAP);

interface selectionsInterface {
  text: string;
  slug: string;
  changingDisplayText: string;
  template?: React.ReactNode;
}

export default function Page({
  slug,
  teamId,
}: {
  slug: string;
  teamId: string;
}) {
  const router = useRouter();
  const [answer, setAnswer] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const selectionsPreviewInterfaceRef = useRef(null);
  const getMessage = useQuery(api.func_qa.getViaId, { id: slug });
  useGSAP(
    () => {
      // gsap code here...
      gsap.to(".box", { x: 360 }); // <-- automatically reverted
    },
    { scope: selectionsPreviewInterfaceRef },
  );

  const sendUpdateToCloud = async () => {
    try {
      const req = await fetch("/api/teams/submit_qa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: selectedPlatform,
          q_id: slug,
          ans: answer,
          team_id: teamId,
        }),
      });
      const res = await req.json();
      if (!res.success) {
        toast(`Cannot send data to db, error: ${res.message}`);
        return;
      }
      setSuccess(true);
    } catch (e: any) {
      toast(`Cannot send data to db, error: ${e.msg}`);
    }
  };

  const message = useQuery(api.func_qa.getViaId, { id: slug }) || [];

  if (message.length === 0) {
    return <div>Oops! this content cannot be fetched!</div>;
  }

  const changeSelectedPlatform = (
    platform: string,
    changingDisplayText: string,
  ) => {
    if (platform === selectedPlatform) {
      return;
    }
    toast(`Changing Plaform to ${changingDisplayText}...`);
    setSelectedPlatform(platform);
  };

  const selections: selectionsInterface[] = [
    /**    {
  text: "Post to threads",
  slug: "threads",
  changingDisplayText: "Threads",
  template: (
    <Threads
      user={JSON.parse(
        JSON.stringify({
          id: "1",
          name: "hpware",
          is_verified: true,
          username: "testing",
          threads_profile_picture_url:
            "https://avatars.githubusercontent.com/u/157942818?v=4",
        }),
      )}
    >
      <span className="break-all">Q: {message[0].msg}</span>
      <span className="break-all">A: {answer}</span>
    </Threads>
  ),
},  */
    {
      text: "Post with pic (Stories)",
      slug: "pic-stories",
      changingDisplayText: "Stories Pic Mode",
      template: (
        <CanvasText
          text={`Q: ${message[0].msg}\n\nA: ${answer}`}
          width={400}
          height={600}
          fontSize={28}
          backgroundColor="#1a1a1a"
          textColor="#ffffff"
        />
      ),
    },
    {
      text: "Post with pic (Feed)",
      slug: "pic-feed",
      changingDisplayText: "Feed Pic Mode",
      template: (
        <CanvasText
          text={`Q: ${message[0].msg}\n\nA: ${answer}`}
          width={600}
          height={400}
          fontSize={24}
          backgroundColor="#ffffff"
          textColor="#000000"
        />
      ),
    },

    {
      text: "Post with text",
      slug: "text",
      changingDisplayText: "Text format",
      template: (
        <div className="flex flex-col">
          <span className="break-all">Q: {message[0].msg}</span>
          <span className="break-all">A: {answer}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="ph-no-capture">
      {success ? (
        <div>
          <span>Success!</span>
        </div>
      ) : (
        <div className="flex flex-col space-y-8 p-6 max-w-4xl mx-auto transition-colors">
          <div>
            <h2 className="text-lg font-medium">Question:</h2>
            <span className="italic">{message[0].msg}</span>
          </div>
          {/* Answer Input Section */}
          <div className="flex flex-col space-y-4">
            <label className="text-lg font-medium dark:text-gray-200">
              How would you answer this question?
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full h-32 p-3 rounded-lg border border-gray-300
                     dark:border-gray-600 bg-white dark:bg-gray-800
                     text-gray-900 dark:text-gray-100 resize-none
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-colors"
              placeholder="Type your answer here..."
            />
          </div>

          {/* Other Platforms */}
          <div className="space-y-3">
            <h4 className="text-md font-medium dark:text-gray-300">Formats</h4>
            <div
              className="flex flex-wrap gap-3"
              ref={selectionsPreviewInterfaceRef}
            >
              {selections.map((i) => (
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${selectedPlatform === i.slug ? "bg-gray-100 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
                  onClick={() =>
                    changeSelectedPlatform(i.slug, i.changingDisplayText)
                  }
                  disabled={selectedPlatform === i.slug}
                  key={i.text}
                >
                  {i.text}
                </button>
              ))}
            </div>
          </div>
          {/* Preview Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium dark:text-gray-200">Preview</h3>
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 min-h-[100px]">
              {selections.map((i) => {
                if (i.slug === selectedPlatform) {
                  return i.template ? (
                    <div key={i.slug}>{i.template}</div>
                  ) : null;
                }
                return null;
              })}
              {selectedPlatform.length == 0 && (
                <div>Please select a template.</div>
              )}
            </div>
          </div>
          <div>
            <button
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700  hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
              onClick={sendUpdateToCloud}
            >
              {selectedPlatform === "threads"
                ? "Post & Save"
                : "Generate & Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
