"use client";
import { Doc } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Page({ teams }: { teams: Doc<"users">[] }) {
  return (
    <div>
      <div className="absolute inset-0 flex flex-col justify-center text-center align-middle">
        <span className="text-xl font-bold barlow mb-3">Your teams</span>
        {/* team component */}
        <div className="flex flex-col gap-2 max-h-1/2 overflow-y-scroll noscrollbar">
          <Link href={`/manage/${teams[0].userId}/`}>
            <button className="flex flex-row justify-center text-center align-middle bg-gray-300 hover:bg-gray-300/70 p-3 mx-auto w-fit rounded gap-5 px-12 cursor-pointer duration-300 transition-all border border-black">
              <img
                src={teams[0].imageUrl}
                className="rounded-full w-10 h-10 m-1"
              />
              <div className="flex flex-col">
                <span className="text-md font-semibold">
                  {teams[0].displayName}
                </span>
                <span className="text-sm ml-3">@{teams[0].handle}</span>
              </div>
            </button>
            <button className="flex flex-row justify-center text-center align-middle bg-gray-300 hover:bg-gray-300/70 p-3 mx-auto w-fit rounded gap-5 px-12 cursor-pointer duration-300 transition-all border border-black">
              <img
                src={teams[0].imageUrl}
                className="rounded-full w-10 h-10 m-1"
              />
              <div className="flex flex-col">
                <span className="text-md font-semibold">
                  {teams[0].displayName}
                </span>
                <span className="text-sm ml-3">@{teams[0].handle}</span>
              </div>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
