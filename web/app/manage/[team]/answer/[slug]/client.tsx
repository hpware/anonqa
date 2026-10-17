"use client";
import { useState, useRef } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { Threads } from "./formats";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CanvasText } from "./canvasText";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";

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
  message: initialMessages,
  session,
}: {
  slug: string;
  teamId: string;
  message: Doc<"qas">[];
  session: string;
}) {
  const [answer, setAnswer] = useState<string>(
    initialMessages[0]?.answer ?? "",
  );
  const [pending, setPending] = useState(false);
  const [postUrl, setPostUrl] = useState("");
  const threads = useQuery(api.func_feat_manage.threadsStatus, {
    teamId,
    session,
  });
  const [success, setSuccess] = useState<boolean>(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const selectionsPreviewInterfaceRef = useRef(null);
  const getMessage = useQuery(api.func_qa.getViaId, {
    id: slug,
    session: session,
  });
  useGSAP(
    () => {
      // gsap code here...
      gsap.to(".box", { x: 360 }); // <-- automatically reverted
    },
    { scope: selectionsPreviewInterfaceRef },
  );

  const message = getMessage ?? initialMessages;
  const previewAnswer = message[0]?.answered
    ? (message[0].answer ?? answer)
    : answer;

  const sendUpdateToCloud = async () => {
    setPending(true);
    try {
      const req = await fetch(
        selectedPlatform === "threads"
          ? "/api/social/threads/publish"
          : "/api/teams/submit_qa",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teamId,
            msgId: slug,
            answer,
            type: selectedPlatform,
            q_id: slug,
            ans: answer,
            team_id: teamId,
          }),
        },
      );
      const res = await req.json();
      if (!req.ok || !res.success) {
        toast(`Cannot send data to db, error: ${res.message}`);
        return;
      }
      if (res.url) setPostUrl(res.url);
      setSuccess(true);
    } catch {
      toast.error("Could not save your answer. Please try again.");
    } finally {
      setPending(false);
    }
  };

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
    ...((threads?.connected && !threads.expired && threads.profile) ||
    message[0].type === "threads"
      ? [
          {
            text: "Post to Threads",
            slug: "threads",
            changingDisplayText: "Threads",
            template: threads?.profile ? (
              <Threads user={threads.profile}>
                <span className="break-all">Q: {message[0].msg}</span>
                <span className="break-all">A: {previewAnswer}</span>
              </Threads>
            ) : (
              <div>
                <p>Q: {message[0].msg}</p>
                <p>A: {previewAnswer}</p>
              </div>
            ),
          },
        ]
      : []),
    {
      text: "Post with pic (Stories)",
      slug: "pic-stories",
      changingDisplayText: "Stories Pic Mode",
      template: (
        <CanvasText
          text={`Q: ${message[0].msg}\n\nA: ${previewAnswer}`}
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
          text={`Q: ${message[0].msg}\n\nA: ${previewAnswer}`}
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
          <span className="break-all">A: {previewAnswer}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="ph-no-capture">
      {(postUrl || message[0].linkedPosts?.url) && (
        <a
          className="text-blue-600 underline"
          href={postUrl || message[0].linkedPosts?.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Threads
        </a>
      )}
      {message[0].answered ? (
        <div>
          <span className="text-lg text-bold justify-center text-center italic">
            Revisit your answer!
          </span>
          <div className="space-y-2">
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 min-h-[100px]">
              {selections.map((i) => {
                if (i.slug === message[0].type) {
                  return i.template ? (
                    <div key={i.slug}>{i.template}</div>
                  ) : null;
                }
                return null;
              })}
            </div>
          </div>
          <Link
            href={`/manage/${teamId}/`}
            className="text-center justify-center items-center p-2 m-auto w-full"
          >
            <Button>
              <span>Go back and answer more questions!</span>
            </Button>
          </Link>
        </div>
      ) : success ? (
        <div>
          <span className="text-lg text-bold justify-center text-center italic">
            Success!
          </span>
          <div className="space-y-2">
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
          <Link
            href={`/manage/${teamId}/`}
            className="text-center justify-center items-center p-2 m-auto w-full"
          >
            <Button>
              <span>Go back and answer more questions!</span>
            </Button>
          </Link>
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
              disabled={pending}
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
                  disabled={pending || selectedPlatform === i.slug}
                  key={i.text}
                >
                  {i.text}
                </button>
              ))}
            </div>
          </div>
          {selectedPlatform === "threads" && (
            <p>
              {
                new TextEncoder().encode(`Q: ${message[0].msg}\n\nA: ${answer}`)
                  .length
              }
              /500 bytes. Posting shares this question and answer publicly on
              Threads.
            </p>
          )}
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
              disabled={
                pending ||
                !selectedPlatform ||
                !answer.trim() ||
                (selectedPlatform === "threads" &&
                  new TextEncoder().encode(
                    `Q: ${message[0].msg}\n\nA: ${answer}`,
                  ).length > 500)
              }
              onClick={sendUpdateToCloud}
            >
              {pending
                ? "Saving…"
                : selectedPlatform === "threads"
                  ? "Post & Save"
                  : "Generate & Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
