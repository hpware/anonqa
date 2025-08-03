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
    <section className="relative min-h-screen flex items-center justify-center py-6 px-2 sm:px-0 bg-gradient-to-br from-purple-600 via-indigo-700 to-indigo-900">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full blur-2xl opacity-30 bg-gradient-to-br from-pink-400 via-fuchsia-500 to-purple-500" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full blur-2xl opacity-20 bg-gradient-to-br from-indigo-400 via-blue-500 to-cyan-400" />
      </div>
      <div className="relative w-full max-w-xl">
        <div className="overflow-hidden rounded-2xl shadow-xl bg-white/90 backdrop-blur border border-indigo-200">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600">
            <img
              alt="Profile Picture"
              src={thisUser.imageUrl}
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate text-white">
                  {thisUser.displayName}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/20 text-xs text-white">
                  @{thisUser.handle}
                </span>
              </div>
              <p className="text-white/80 text-xs truncate">
                Ask a question anonymously
              </p>
            </div>
          </div>
          {/* Body */}
          <form
            className="flex flex-col gap-4 px-5 py-6 bg-white"
            onSubmit={(e) => {
              e.preventDefault();
              submitForm();
            }}
          >
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700"
            >
              Your question
            </label>
            <textarea
              id="question"
              required
              maxLength={280}
              className="block w-full rounded-lg border border-indigo-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[120px] resize-none"
              placeholder={placeholder}
              value={ptavalue}
              onChange={handleTextareaChange}
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{280 - ptavalue.length} characters left</span>
              {error.length > 0 && (
                <span className="text-red-600">{error}</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                type="button"
                title="Random prompt"
                className="flex-1 px-4 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition"
                onClick={() =>
                  setPtavalue(
                    "What's one thing you wish more people knew about you?",
                  )
                }
              >
                🎲 Random prompt
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
                disabled={ptavalue.trim().length === 0 || ptavalue.length > 280}
              >
                {loadingq}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
