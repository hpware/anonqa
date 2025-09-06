"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";

export default function Page() {
  const router = useRouter();
  const [userData, setUserData] = useState<string>("");
  const [loginId, setLoginId] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [flaggingFeat, setFlaggingFeat] = useState<boolean>(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    setUserData(user && user.length > 0 ? user : "");
    setLoginId(token ?? "");
  }, [router]);

  const message = useQuery(api.qa.getViaId, { id: "myid" }) || [];

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

      {/* Preview Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium dark:text-gray-200">Preview</h3>
        <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 min-h-[100px]">
          {answer || "Your answer preview will appear here"}
        </div>
      </div>

      {/* Platform Selection Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium dark:text-gray-200">
          Please select the platform you want to post on!
        </h3>

        {/* Native Platforms */}
        <div className="space-y-3">
          <h4 className="text-md font-medium dark:text-gray-300">
            Native Platforms
          </h4>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700
                             hover:bg-gray-300 dark:hover:bg-gray-600
                             rounded-lg transition-colors"
            >
              Post via Threads
            </button>
            <button
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700
                             hover:bg-gray-300 dark:hover:bg-gray-600
                             rounded-lg transition-colors"
            >
              Post via X
            </button>
          </div>
        </div>

        <hr className="border-gray-300 dark:border-gray-700" />

        {/* Other Platforms */}
        <div className="space-y-3">
          <h4 className="text-md font-medium dark:text-gray-300">
            Post to other platforms
          </h4>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700
                             hover:bg-gray-300 dark:hover:bg-gray-600
                             rounded-lg transition-colors"
            >
              Post with pic (IG & Snapchat)
            </button>
            <button
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700
                             hover:bg-gray-300 dark:hover:bg-gray-600
                             rounded-lg transition-colors"
            >
              Post with pic (other)
            </button>
            <button
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700
                             hover:bg-gray-300 dark:hover:bg-gray-600
                             rounded-lg transition-colors"
            >
              Post with text
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
