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
    setPlaceholder("Type your anonymous question here...");
  }, []);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPtavalue(e.target.value);
    if (e.target.value.length > 280) {
      setError("Please keep your question under 280 characters.");
    } else {
      setError("");
    }
  };

  const submitForm = async () => {
    setError("");
    dotAnimation();
    intervalRef.current = setInterval(dotAnimation, 1500);
    await fetchMutation(api.qa.qa, { toUser: slug, msg: ptavalue.trim() });
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeout(() => {
      setLoadingq("Submitted!");
    }, 500);
  };

  const dotAnimation = () => {
    setLoadingq("Submitting.");
    setTimeout(() => setLoadingq("Submitting.."), 300);
    setTimeout(() => setLoadingq("Submitting..."), 600);
  };

  const thisUser = user[0];

  return (
    <section className="container max-w-2xl">
      <div className="card surface p-4 sm:p-6">
        <header className="flex items-center gap-3 pb-4 border-b border-base/50">
          <img
            alt="Profile Picture"
            src={thisUser.imageUrl}
            className="w-12 h-12 rounded-full ring-2 ring-white/50"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">
                {thisUser.displayName}
              </span>
              <span className="badge badge-primary">@{thisUser.handle}</span>
            </div>
            <p className="subtle truncate">Ask a question anonymously</p>
          </div>
        </header>

        <div className="stack-md pt-4">
          <label className="label" htmlFor="question">
            Your question
          </label>
          <textarea
            id="question"
            required
            maxLength={280}
            className="textarea min-h-[140px]"
            placeholder={placeholder}
            value={ptavalue}
            onChange={handleTextareaChange}
          />
          <div className="flex items-center justify-between text-sm">
            <span className="subtle">
              {280 - ptavalue.length} characters left
            </span>
            {error.length > 0 && <span className="text-red-600">{error}</span>}
          </div>

          <div className="cluster-md justify-between">
            <button
              type="button"
              title="Random prompt"
              className="btn btn-ghost"
              onClick={() =>
                setPtavalue(
                  "What's one thing you wish more people knew about you?",
                )
              }
            >
              🎲 Random prompt
            </button>
            <button
              className="btn btn-primary"
              onClick={submitForm}
              disabled={ptavalue.trim().length === 0 || ptavalue.length > 280}
            >
              {loadingq}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
