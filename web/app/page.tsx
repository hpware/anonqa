"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  router.push("/manage/");
  return (
    <div className="font-sans">
      <div className="absolute inset-0 flex flex-col justify-center text-center">
        <span className="bg-clip-text bg-gradient-to-br from-purple-600 to-blue-600 text-transparent">
          Redirecting to management...
        </span>
      </div>
    </div>
  );
}
