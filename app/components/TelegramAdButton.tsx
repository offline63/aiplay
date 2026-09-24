"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: unknown;
    };
    show_11876145?: () => Promise<unknown>;
  }
}

export default function TelegramAdButton() {
  const [isTelegram, setIsTelegram] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const insideTelegram = Boolean(window.Telegram?.WebApp);
    setIsTelegram(insideTelegram);

    if (!insideTelegram) return;

    const interval = window.setInterval(() => {
      if (window.show_11876145) {
        setReady(true);
        window.clearInterval(interval);
      }
    }, 250);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      if (!window.show_11876145) {
        setMessage("Ad service is not available yet.");
      }
    }, 10000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  if (!isTelegram) {
    return null;
  }

  async function showAd() {
    setMessage("");

    if (!window.show_11876145) {
      setMessage("Ad is still loading. Please wait a moment.");
      return;
    }

    try {
      await window.show_11876145();
      setMessage("Thanks for supporting AniPlay!");
    } catch {
      setMessage("No ad is available right now. Please try again later.");
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={showAd}
        disabled={!ready}
        className="inline-flex rounded-xl border border-yellow-300/30 bg-yellow-400/10 px-5 py-3 font-bold text-yellow-100/90 transition hover:border-yellow-300/60 hover:bg-yellow-400/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {ready ? "🎁 Watch an Ad" : "Loading Ad..."}
      </button>

      {message && (
        <p className="mt-3 text-sm text-white/50">{message}</p>
      )}
    </div>
  );
}
