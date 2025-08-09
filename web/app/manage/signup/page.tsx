// DO NOT I MEAN DO NOT LEAVE THIS IN THE PROD APP THIS IS ONLY HERE FOR TESTING ONLY AND THIS IS SUPER UNSECURE!
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function Page() {
  const router = useRouter();
  const [userHandle, setUserHandle] = useState<string>("");
  const handleUserHandleTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setUserHandle(e.target.value);
  };
  const submit = async () => {
    if (!userHandle) {
      return;
    }
    const req = await fetch("/api/testing/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username: userHandle,
      }),
    });
    const res = await req.json();
    if (res.exists) {
      localStorage.setItem("user", userHandle);
      localStorage.setItem("token", "PLEASE_CHANGE_THIS");
      router.push("/manage/?ref=loginPage");
    }
  };
  return (
    <div className="absolute inset-0 flex flex-col justify-center text-center m-auto w-1/2">
      <span>Enter your username:</span>
      <span className="text-sm">Spin up a account!</span>
      <input
        type="text"
        required
        value={userHandle}
        onChange={handleUserHandleTextChange}
      />
      <button
        className="p-2 bg-blue-400 hover:bg-blue-500 hover:cursor-pointer"
        onClick={submit}
      >
        Submit
      </button>
    </div>
  );
}
