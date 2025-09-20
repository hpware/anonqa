"use client";
import { Doc } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOutIcon } from "lucide-react";

export default function Page({ teams }: { teams: Doc<"users">[] }) {
  return (
    <div>
      <div className="absolute inset-0 flex flex-col justify-center text-center align-middle">
        <span className="text-xl font-bold barlow mb-3">Your teams</span>
        {/* team component */}
        <div className="flex flex-col gap-2 max-h-1/2 overflow-y-scroll noscrollbar">
          {teams.map((i) => (
            <Link href={`/manage/${i.userId}/`}>
              <button className="flex flex-row justify-center text-center align-middle bg-gray-300 hover:bg-gray-300/70 p-3 mx-auto w-fit rounded gap-5 px-12 cursor-pointer duration-300 transition-all border border-black">
                <img src={i.imageUrl} className="rounded-full w-10 h-10 m-1" />
                <div className="flex flex-col">
                  <span className="text-md font-semibold">{i.displayName}</span>
                  <span className="text-sm ml-3">@{i.handle}</span>
                </div>
              </button>
            </Link>
          ))}
        </div>
        <div>
          <button className="p-2 bg-blue-300 hover:bg-blue-400 transiton-all duration-300 m-2 rounded-lg">
            Create
          </button>
          <button className="p-2 bg-blue-300 hover:bg-blue-400 transiton-all duration-300 m-2 rounded-lg">
            Join
          </button>
          <Link href="/auth/logout">
            <button className="p-2 bg-blue-300 hover:bg-blue-400 transiton-all duration-300 m-2 rounded-lg">
              <LogOutIcon />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
