"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";

export default function Page() {
  const router = useRouter();
  const [userData, setUserData] = useState<string>("");
  const [loginId, setLoginId] = useState<string>("");
  const [flaggingFeat, setFlaggingFeat] = useState<boolean>(false);
  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    setUserData(user && user.length > 0 ? user : "");
    setLoginId(token ?? "");
  }, [router]);
  const message = useQuery(api.qa.getViaId, { id: "myid" }) || [];
  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        <span>How would you answer this question?</span>
        <input type="text" />
      </div>
      <div>
        <span>Preview</span>
      </div>
      <div className="flex flex-col">
        <span>Please select the platform you want to post on!</span>
        <span>Native Platforms</span>
        <div>
          <button className="bg-gray-300 border rounded">
            Post via Threads
          </button>
          <button className="bg-gray-300 border rounded">Post via X</button>
        </div>
        <hr />
        <span>Post to other platforms</span>
        <div>
          <button className="bg-gray-300 border rounded">
            Post with pic (IG {"&"} Snapchat)
          </button>
          <button className="bg-gray-300 border rounded">
            Post with pic (other)
          </button>
          <button className="bg-gray-300 border rounded">Post with text</button>
        </div>
      </div>>
    </div>
  );
}
