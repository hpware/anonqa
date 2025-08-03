"use client";

import { useState } from "react";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
} from "convex/react";
import { authClient } from "@/lib/auth-client";
import { api } from "../../convex/_generated/api";

export default function App() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-emerald-100 via-green-100 to-lime-100">
      {/* Green blobs for accent */}
      <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full blur-3xl opacity-40 bg-gradient-to-br from-emerald-400 via-green-500 to-lime-400" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-teal-400 via-emerald-500 to-green-600" />

      <div className="w-full max-w-xl px-4 sm:px-6">
        <AuthLoading>
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </AuthLoading>
        <Unauthenticated>
          <SignIn />
        </Unauthenticated>
        <Authenticated>
          <Dashboard />
        </Authenticated>
      </div>
    </section>
  );
}

function Dashboard() {
  const user = useQuery(api.auth.getCurrentUser);
  return (
    <div className="mx-auto my-10 bg-white/90 rounded-xl shadow-lg p-6 sm:p-8 border border-green-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-lg font-semibold text-green-800">
          Hello {user?.name}!
        </div>
        <button
          className="px-4 py-2 rounded-lg border border-green-400 text-green-700 bg-white hover:bg-green-50 transition"
          onClick={() => authClient.signOut()}
        >
          Sign out
        </button>
      </div>
      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-emerald-200 to-green-100 text-sm text-green-900">
        You are signed in. Explore the app using the navigation above.
      </div>
    </div>
  );
}

function SignIn() {
  const [showSignIn, setShowSignIn] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    if (showSignIn) {
      await authClient.signIn.email(
        {
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        },
        {
          onError: (ctx) => {
            window.alert(ctx.error.message);
          },
        },
      );
    } else {
      await authClient.signUp.email(
        {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        },
        {
          onError: (ctx) => {
            window.alert(ctx.error.message);
          },
        },
      );
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white/90 rounded-xl shadow-lg p-6 sm:p-8 border border-green-200">
      <div className="text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow">
          ✓
        </div>
      </div>
      <h1 className="text-2xl font-bold text-green-800 text-center mt-3">
        {showSignIn ? "Welcome back" : "Create your account"}
      </h1>
      <p className="text-gray-500 text-center mt-2">
        {showSignIn ? "Sign in to continue" : "Sign up to get started"}
      </p>
      <div className="my-6 h-px w-full bg-green-100" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!showSignIn && (
          <div>
            <label
              className="block mb-1 text-sm font-medium text-green-900"
              htmlFor="name"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              placeholder="Your name"
              className="w-full rounded-lg border border-green-200 bg-white px-3 py-2 text-sm placeholder:text-green-400 focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        )}
        <div>
          <label
            className="block mb-1 text-sm font-medium text-green-900"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            className="w-full rounded-lg border border-green-200 bg-white px-3 py-2 text-sm placeholder:text-green-400 focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div>
          <label
            className="block mb-1 text-sm font-medium text-green-900"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-green-200 bg-white px-3 py-2 text-sm placeholder:text-green-400 focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-600 text-white py-2 font-semibold hover:bg-emerald-700 transition"
        >
          {showSignIn ? "Sign in" : "Sign up"}
        </button>
      </form>
      <p className="text-center text-green-700 mt-4">
        {showSignIn ? "Don't have an account? " : "Already have an account? "}
        <button
          className="underline hover:text-emerald-600"
          onClick={() => setShowSignIn(!showSignIn)}
        >
          {showSignIn ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
