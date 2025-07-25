"use client";
import { useState, useEffect } from "react";
export default function Client({ slug }: { slug: string }) {
  const [placeholder, setPlaceholder] = useState<string>("");
  useEffect(() => {
    setPlaceholder("Hello World!");
  }, []);
  return (
    <form className="justify-center m-auto flex flex-col w-full md:w-md">
      <div className="flex flex-row pt-3 border border-b-0 mt-2 rounded-t-lg bg-gradient-to-br from-blue-600 to-pink-300 text-white">
        <img
          alt="Profile Picture"
          src="https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D"
          className="w-12 h-12 rounded-full p-1"
        />
        <div className="flex flex-col">
          <span>SSSSSSSS</span>
          <span>@{slug}</span>
        </div>
      </div>
      <textarea
        required
        className="rounded rounded-t-none p-1 pt-0 h-[150px] border border-t-0"
        placeholder={placeholder}
      />
      <button className="p-2 m-2 bg-black rounded-lg text-white hover:cursor-pointer hover:bg-black/50 transition-all duration-300">
        Submit
      </button>
    </form>
  );
}
