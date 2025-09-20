"use client";
import { useEffect, useRef, useState } from "react";

interface TurnstileProps {
  onVerify: (token: string) => void;
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
    const checkTurnstile = () => {
      if (window.turnstile) {
        setLoaded(true);
      } else {
        setTimeout(checkTurnstile, 100);
      }
    };
    checkTurnstile();
  }, []);

  useEffect(() => {
    if (loaded && containerRef.current && window.turnstile) {
      window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
      });
    }
  }, [loaded, siteKey, onVerify]);

  return <div ref={containerRef} className="!rounded" />;
}
