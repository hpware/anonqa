"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function AccountSettings({ session }: { session: string }) {
  const profile = useQuery(api.func_users.getAccountProfile, { session });
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (newPassword && newPassword !== confirmation) {
      setError("New passwords do not match.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/users/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          ...(email.trim() ? { email: email.trim() } : {}),
          ...(newPassword ? { newPassword } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.message || "Could not update your account.");
        return;
      }
      toast.success(result.message);
      // The server rotates this session. Reload so live queries use the new cookie.
      window.location.reload();
    } catch {
      setError("Could not update your account. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 max-w-lg sensitive">
      <p>
        Signed in as {profile?.email ?? "…"}. Confirm your current password to
        change your email or password.
      </p>
      <label className="block">
        New email (optional)
        <input
          className="block w-full rounded border p-2"
          type="email"
          autoComplete="email"
          maxLength={320}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
        />
      </label>
      <label className="block">
        Current password
        <input
          className="block w-full rounded border p-2"
          type="password"
          autoComplete="current-password"
          required
          maxLength={1024}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={pending}
        />
      </label>
      <label className="block">
        New password (optional, at least 12 characters)
        <input
          className="block w-full rounded border p-2"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={1024}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={pending}
        />
      </label>
      <label className="block">
        Confirm new password
        <input
          className="block w-full rounded border p-2"
          type="password"
          autoComplete="new-password"
          required={!!newPassword}
          maxLength={1024}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          disabled={pending}
        />
      </label>
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      <p>Saving signs out your other sessions.</p>
      <Button
        disabled={
          pending || !currentPassword || (!email.trim() && !newPassword)
        }
      >
        {pending ? "Saving…" : "Save account changes"}
      </Button>
    </form>
  );
}
