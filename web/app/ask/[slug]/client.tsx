"use client";
import { useState, useEffect, useRef } from "react";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Turnstile } from "@/components/turnstile";
import { DicesIcon, SendIcon } from "lucide-react";
import gsap from "gsap";

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
  const sendIconRef = useRef(null);
  // this is just here for a shitty animation, please replace this later.
  useEffect(() => {
    if (!sendIconRef.current) return;

    const sendIconCurrent = sendIconRef.current;

    gsap.to(sendIconCurrent, {
      duration: 1,
      y: -100,
      stagger: {
        each: 0.1,
        repeat: -1,
        yoyo: true,
      },
      ease: "step(12).inOut",
    });
  }, []);
  useEffect(() => {
    setPlaceholder("A frame! This is filtered btw");
  }, []);
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPtavalue(e.target.value);
  };
  const submitForm = async () => {
    setError("");
    setSubmitting(true);
    await fetchMutation(api.func_qa.qa, { toUser: slug, msg: ptavalue });
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
    <div>
      {!submitting ? (
        <div className="justify-center m-auto flex flex-col w-full md:w-md absolute inset-0">
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
                <DicesIcon />
              </button>
            </div>
            {error.length > 0 && <span className="text-red-600">{error}</span>}
            <button
              className="p-2 m-2 bg-black rounded-lg text-white hover:cursor-pointer hover:bg-black/50 transition-all duration-300 disabled:bg-black/70 disabled:cursor-not-allowed cool-font"
              onClick={submitForm}
              disabled={ptavalue.length == 0}
            >
              Submit!
            </button>
          </div>
        </div>
      ) : (
        <div className="justify-center text-center items-center w-full h-screen absolute inset-0 flex flex-col bitcount-grid-double">
          <SendIcon className="w-12 h-12 p-1" ref={sendIconRef} />
          <span>Data sending!</span>
        </div>
      )}
    </div>
  );
}
