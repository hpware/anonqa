"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { Threads } from "./formats";

interface selectionsInterface {
  text: string;
  slug: string;
  changingDisplayText: string;
}

export default function Page() {
  const router = useRouter();
  const [userData, setUserData] = useState<string>("");
  const [loginId, setLoginId] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [flaggingFeat, setFlaggingFeat] = useState<boolean>(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    setUserData(user && user.length > 0 ? user : "");
    setLoginId(token ?? "");
  }, [router]);

  const message = useQuery(api.qa.getViaId, { id: "myid" }) || [];

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
    {
      text: "Post to threads",
      slug: "threads",
      changingDisplayText: "Threads",
    },
    {
      text: "Post to Twitter",
      slug: "twitter",
      changingDisplayText: "Twitter",
    },
    {
      text: "Post with pic (Stories)",
      slug: "pic-stories",
      changingDisplayText: "Stories Pic Mode",
    },
    {
      text: "Post with pic (Feed)",
      slug: "pic-feed",
      changingDisplayText: "Feed Pic Mode",
    },
    {
      text: "Post with text",
      slug: "text",
      changingDisplayText: "Text format",
    },
  ];

  return (
    <div className="flex flex-col space-y-8 p-6 max-w-4xl mx-auto transition-colors">
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
        <div className="flex flex-wrap gap-3">
          {selections.map((i) => (
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${selectedPlatform === i.slug ? "bg-gray-100 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
              onClick={() =>
                changeSelectedPlatform(i.slug, i.changingDisplayText)
              }
              disabled={selectedPlatform === i.slug}
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
          {answer || "Your answer preview will appear here"}
        </div>
        <Threads
          user={JSON.parse(
            JSON.stringify({
              id: "10098977380201680",
              name: "yh",
              is_verified: false,
              username: "aixntw",
              threads_profile_picture_url:
                "https://scontent.cdninstagram.com/v/t51.82787-15/532339131_17922115800103188_3915658158039943772_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=108&ccb=1-7&_nc_sid=18de74&_nc_ohc=EY2SQcVZxi4Q7kNvwGHszZ5&_nc_oc=Adm0bN_USmZw09NE5keSmSR-o3-ZnDGz5YGcblQOMW1HzGAgRcccjo9iwHfnyfk9ff67k4zz4TmLWOUuZr7b8w_X&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&edm=AP4hL3IEAAAA&_nc_gid=hc_oGTJg5DL5itTZJz-8dg&oh=00_AfZSJA5iey0a9Fjn_cnTsMvrkScJBUloyPcGF3vQjMzwaQ&oe=68C56848",
            }),
          )}
        >
          <span>Q: Hi</span>
          <span>A: Hi</span>
        </Threads>
      </div>
      <div>
        <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700  hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors">
          Generate
        </button>
      </div>
    </div>
  );
}
