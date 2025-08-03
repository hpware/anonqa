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
    <section className="container">
      <AuthLoading>
        <div className="center min-h-[40vh]">
          <div className="subtle">Loading...</div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <Authenticated>
        <Dashboard />
      </Authenticated>
    </section>
  );
}

function Dashboard() {
  const user = useQuery(api.auth.getCurrentUser);
  return (
    <div className="max-w-lg mx-auto my-10 card surface p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Hello {user?.name}!</div>
        <button
          className="btn btn-outline"
          onClick={() => authClient.signOut()}
        >
          Sign out
        </button>
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
    <div className="max-w-md mx-auto my-10 card surface p-6 sm:p-8">
      <h1 className="heading-3 text-center">
        {showSignIn ? "Welcome back" : "Create your account"}
      </h1>
      <p className="subtle text-center mt-2">
        {showSignIn ? "Sign in to continue" : "Sign up to get started"}
      </p>
      <div className="divider" />
      <form onSubmit={handleSubmit} className="stack-md">
        {!showSignIn && (
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              placeholder="Your name"
              className="input"
            />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            className="input"
          />
        </div>
        <button type="submit" className="btn btn-primary w-full">
          {showSignIn ? "Sign in" : "Sign up"}
        </button>
      </form>
      <p className="text-center subtle mt-4">
        {showSignIn ? "Don't have an account? " : "Already have an account? "}
        <button
          className="btn btn-ghost"
          onClick={() => setShowSignIn(!showSignIn)}
        >
          {showSignIn ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
