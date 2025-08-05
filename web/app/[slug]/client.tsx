"use client";
import { useState, useEffect, useRef } from "react";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default function Client({ slug, user }: { slug: string; user: any[] }) {
  const [placeholder, setPlaceholder] = useState<string>("");
  const [ptavalue, setPtavalue] = useState<string>("");
  const [loadingq, setLoadingq] = useState<string>("Submit");
  const [error, setError] = useState<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    setPlaceholder("Hello World!");
  }, []);
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPtavalue(e.target.value);
  };
  const submitForm = async () => {
    setError("");
    dotAnimation();
    intervalRef.current = setInterval(dotAnimation, 1500);
    await fetchMutation(api.qa.qa, { toUser: slug, msg: ptavalue });
    // Stop animation when done
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeout(() => {
      setLoadingq("Submitted!");
    }, 1500);
  };

  const dotAnimation = () => {
    setLoadingq("Submitting.");
    setTimeout(() => setLoadingq("Submitting.."), 500);
    setTimeout(() => setLoadingq("Submitting..."), 1000);
  };

  console.log(user);
  const thisUser = user[0];

  return (
    <div className="justify-center m-auto flex flex-col w-full md:w-md">
      <div className="flex flex-row pt-3 border border-b-0 mt-2 rounded-t-lg bg-gradient-to-br from-blue-600 to-pink-300 text-white">
        <img
          alt="Profile Picture"
          src={thisUser.imageUrl}
          className="w-12 h-12 rounded-full p-1"
        />
        <div className="flex flex-col">
          <span>{thisUser.displayName}</span>
          <span>@{thisUser.handle}</span>
        </div>
      </div>
      <textarea
        required
        className="rounded rounded-t-none p-1 pt-0 h-[150px] border border-t-0"
        placeholder={placeholder}
        value={ptavalue}
        onChange={handleTextareaChange}
      />
      <button>🎲</button>
      {error.length > 0 && <span className="text-red-600">{error}</span>}
      <button
        className="p-2 m-2 bg-black rounded-lg text-white hover:cursor-pointer hover:bg-black/50 transition-all duration-300 disabled:bg-black/70 disabled:cursor-not-allowed"
        onClick={submitForm}
        disabled={ptavalue.length == 0}
      >
        {loadingq}
      </button>
    </div>
  );
}
