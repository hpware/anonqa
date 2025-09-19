"use client";

import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { BadgePlusIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

export default function ClientPage({
  disableRegister,
  serverOwnerTerms,
}: {
  disableRegister: boolean;
  serverOwnerTerms: string;
}) {
  if (disableRegister) {
    return (
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mt-8  bg-white p-8 rounded-lg space-y-6 shadow-md geist-mono">
          <div className="flex flex-row justify-center align-middle text-center gap-2 m-auto barlow pb-8">
            <BadgePlusIcon className="h-12 w-12 stroke-white bg-blue-600 p-2 rounded-full text-white" />
            <h2 className="my-auto text-center justify-center py-1 text-3xl font-bold tracking-tight text-gray-900">
              Register
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm">
              Registering currently not allowed on this server. If you are the
              server owner and want to enable registering, please set{" "}
              <code>NEXT_PUBLIC_DISABLE_REGISTER=false</code> in your env.
            </span>
            <span className="text-xs text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-blue-600 transition-all duration-300 hover:text-blue-700"
              >
                login here!
              </Link>
            </span>
          </div>
        </div>
      </div>
    );
  }
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const hashPassword = async (pass: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pass);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both fields.");
      setLoading(false);
      return;
    }

    try {
      const hashedPassword = await hashPassword(password);
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: hashedPassword,
          fname: firstName,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error === true) {
        setError(data.message || "Login failed.");
        return;
      }
      router.push("/manage/selectTeams");
    } catch (err) {
      console.error(err);
      setError(`Client Side Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mt-8  bg-white p-8 rounded-lg space-y-6 shadow-md geist-mono">
        <div className="flex flex-row justify-center align-middle text-center gap-2 m-auto barlow pb-8">
          <BadgePlusIcon className="h-12 w-12 stroke-white bg-blue-600 p-2 rounded-full text-white" />
          <h2 className="my-auto text-center justify-center py-1 text-3xl font-bold tracking-tight text-gray-900">
            Register
          </h2>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                id="firstname"
                name="firstname"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full rounded-md border px-3 py-2 text-base shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                disabled={loading}
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border px-3 py-2 text-base shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                disabled={loading}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                disabled={loading}
              />
            </div>
          </div>
          {error && (
            <div className="text-red-600 rounded-md text-sm">{error}</div>
          )}
          <div>
            <button
              onClick={handleSubmit}
              disabled={!(!loading && password && firstName && email)}
              className="disabled:opacity-50 disabled:cursor-not-allowed group relative flex w-full justify-center rounded-md bg-blue-600 py-2 px-4 text-sm text-white hover:cursor-pointer hover:border-white hover:bg-blue-700 transition-all duration-300"
            >
              {loading ? (
                <span className="text-white flex flex-row gap-2">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 p-1 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="text-white">Signing up...</span>
                </span>
              ) : (
                <span className="text-white">Signup</span>
              )}
            </button>
            <span className="text-xs text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-blue-600 transition-all duration-300 hover:text-blue-700"
              >
                login here!
              </Link>
            </span>
          </div>
          {serverOwnerTerms.length !== 0 && (
            <span className="text-center justfiy-center text-xs/5">
              By registering for an acccount, you agree the server owner's{" "}
              <a
                href={serverOwnerTerms}
                className="text-blue-600 transition-all duration-300 hover:text-blue-700"
              >
                terms
              </a>
              .
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
