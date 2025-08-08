"use client";
import { useRouter } from "next/navigation";
export default function Page() {
  const router = useRouter();
  const userData = localStorage.getItem("user");
  const loginId = localStorage.getItem("token");
  if (!userData && !loginId) {
    router.push("/manage/login");
  }
  return (
    <div>
      <div>Yeah I think you are logged in :)</div>
    </div>
  );
}
