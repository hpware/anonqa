"use client";
import { useState, useEffect, useRef } from "react";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default function Client({ slug, user }: { slug: string; user: any[] }) {
  const [placeholder, setPlaceholder] = useState<string>("");
  const [ptavalue, setPtavalue] = useState<string>("");
  const [loadingq, setLoadingq] = useState<string>("Submit");
  const [error, setError] = useState<string>("");
  const [imageNotAvailable, setImageNotAvailable] = useState<boolean>(false);
  const [customRandomizedMessages, setCustomRandomizedMessages] = useState<[]>(
    [],
  );
  const defultImage = "https://ngl.link/images/default_avatar.png";
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

  const changeImage = () => {
    setImageNotAvailable(true);
  };

  console.log(user);
  const thisUser = user[0];
  if (thisUser.setCustomRandomMessages) {
  }

  return (
    <div className="justify-center m-auto flex flex-col w-full md:w-md">
      <div className="flex flex-row pt-3 border border-b-0 mt-2 rounded-t-lg bg-gradient-to-br from-blue-600 to-pink-300 text-white">
        <img
          alt="Profile Picture"
          src={imageNotAvailable ? defultImage : thisUser.imageUrl}
          className="w-12 h-12 rounded-full p-1"
          onError={changeImage}
        />
        <div className="flex flex-col">
          <span>{thisUser.displayName}</span>
          <span>@{thisUser.handle}</span>
        </div>
      </div>
      <div className="relative">
        <textarea
          required
          className="rounded rounded-t-none p-1 pt-0 h-[150px] border border-t-0 w-full pr-14"
          placeholder={placeholder}
          value={ptavalue}
          onChange={handleTextareaChange}
        />
        <button
          className="absolute bottom-2 right-2 transform -translate-y-1/2 rounded-full p-2 bg-gray-300/60 w-10 h-10 flex items-center justify-center hover:cursor-pointer"
          style={{ pointerEvents: "auto" }}
        >
          🎲
        </button>
      </div>
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
