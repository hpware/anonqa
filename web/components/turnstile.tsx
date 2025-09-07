"use client";
import { useEffect, useRef } from "react";

interface TurnstileProps {
  onVerify: (token: string) => void;
}

declare global {
  interface Window {
    turnstile: any;
  }
}

export function Turnstile({ onVerify }: TurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(siteKey);
    if (containerRef.current && window.turnstile) {
      window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
      });
    }
  }, [siteKey]);

  return <div ref={containerRef} />;
}
