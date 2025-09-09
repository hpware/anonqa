"use client";
import { useState, useEffect, useRef } from "react";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Turnstile } from "@/components/turnstile";
import { SendIcon } from "lucide-react";

export default function Client({ slug, user }: { slug: string; user: any[] }) {
  // Default
  const defultImage = "/assets/default.png";
  const defaultRandomizedMessages = ["Hello World", "This is really fun!"];
  // Values
  const [placeholder, setPlaceholder] = useState<string>("");
  const [ptavalue, setPtavalue] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [imageNotAvailable, setImageNotAvailable] = useState<boolean>(false);
  const [randomizedMesssages, setRandomizedMessages] = useState(
    defaultRandomizedMessages,
  );
  const [customRandomizedMessages, setCustomRandomizedMessages] = useState<[]>(
    [],
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    setPlaceholder("A frame! This is filtered btw");
  }, []);
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPtavalue(e.target.value);
  };
  const submitForm = async () => {
    setError("");
    setSubmitting(true);
    await fetchMutation(api.qa.qa, { toUser: slug, msg: ptavalue });
  };

  const changeImage = () => {
    setImageNotAvailable(true);
  };

  const randomizeMessage = () => {};

  console.log(user);
  const thisUser = user[0];
  if (thisUser.setCustomRandomMessages) {
  }

  return (
    <div className="justify-center m-auto flex flex-col w-full md:w-md absolute inset-0">
      {!submitting ? (
        <div className="justify-center m-auto flex flex-col w-full md:w-md">
          <div className="flex flex-row">
            <img
              alt="Profile Picture"
              src={imageNotAvailable ? defultImage : thisUser.imageUrl}
              className="w-12 h-12 rounded-full p-1"
              onError={changeImage}
            />
            <div className="flex flex-col ml-2">
              <span>{thisUser.displayName}</span>
              <span>@{thisUser.handle}</span>
            </div>
          </div>
          <div className="relative md:m-0 m-2">
            <textarea
              required
              className="rounded p-1 mt-1 h-[150px] border w-full pr-14 resize-none"
              placeholder={placeholder}
              value={ptavalue}
              onChange={handleTextareaChange}
            />
            <button
              className="absolute bottom-2 right-2 transform -translate-y-1/2 rounded-full p-2 bg-gray-300/60 w-10 h-10 flex items-center justify-center hover:cursor-pointer"
              style={{ pointerEvents: "auto" }}
              onClick={randomizeMessage}
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
            Submit!
          </button>
        </div>
      ) : (
        <div>
          <SendIcon />
        </div>
      )}
    </div>
  );
}
