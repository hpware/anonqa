"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function ThreadsSettings({
  teamId,
  session,
  configured,
  notice,
}: {
  teamId: string;
  session: string;
  configured: boolean;
  notice?: string;
}) {
  const status = useQuery(api.func_feat_manage.threadsStatus, {
    teamId,
    session,
  });
  const [pending, setPending] = useState(false);
  const disconnect = async () => {
    setPending(true);
    try {
      const response = await fetch(
        `/api/social/threads/getUserInfo?teamId=${encodeURIComponent(teamId)}`,
        { method: "DELETE" },
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        toast.error(result.message || "Could not disconnect Threads.");
        return;
      }
      toast.success("Threads disconnected.");
    } catch {
      toast.error("Could not disconnect Threads. Please try again.");
    } finally {
      setPending(false);
    }
  };
  return (
    <section className="space-y-3">
      <h2 className="text-xl">Threads</h2>
      {notice === "connected" && (
        <p role="status">Threads connected successfully.</p>
      )}
      {notice === "cancelled" && (
        <p role="status">Threads connection cancelled.</p>
      )}
      {notice === "error" && (
        <p role="alert">
          Could not connect Threads. Check the app configuration and try again.
        </p>
      )}
      {status?.connected && (
        <p>
          Connected as @{status.profile?.username}.
          {status.expired &&
            " Your connection expired. Reconnect to post answers."}
        </p>
      )}
      <p>
        Connecting lets team members publish question-and-answer posts to this
        Threads profile.
      </p>
      {configured ? (
        <Button asChild>
          <a
            href={`/api/social/threads/authorize?teamId=${encodeURIComponent(teamId)}`}
          >
            {status?.connected ? "Reconnect Threads" : "Connect Threads"}
          </a>
        </Button>
      ) : (
        <p>Threads connections are not enabled on this server.</p>
      )}
      {status?.connected && (
        <Button
          className="ml-2"
          variant="outline"
          onClick={disconnect}
          disabled={pending}
        >
          {pending ? "Disconnecting…" : "Disconnect Threads"}
        </Button>
      )}
    </section>
  );
}
