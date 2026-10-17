"use client";
import { useEffect, useRef, useState } from "react";

interface TurnstileProps {
  onVerify: (token: string | null) => void;
}

declare global {
  interface Window {
    turnstile: any;
  }
}

export function Turnstile({ onVerify }: TurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY || "";
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (window.turnstile) {
        setLoaded(true);
        window.clearInterval(timer);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.turnstile) return;
    const widget = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      "expired-callback": () => onVerify(null),
      "error-callback": () => onVerify(null),
    });
    return () => window.turnstile.remove(widget);
  }, [loaded, siteKey, onVerify]);

  return <div ref={containerRef} className="!rounded" />;
}
