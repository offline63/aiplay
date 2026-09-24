"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    show_11876145?: () => Promise<unknown> | unknown;
  }
}

export default function TelegramAdButton() {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const existing = document.querySelector(
      'script[data-zone="11876145"]'
    );

    if (existing) {
      setReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://libtl.com/sdk.js";
    script.async = true;
    script.dataset.zone = "11876145";
    script.dataset.sdk = "show_11876145";

    script.onload = () => setReady(true);
    script.onerror = () => {
      setMessage("Ad service could not load. Please try again later.");
    };

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  async function showAd() {
    setMessage("");

    if (!ready || !window.show_11876145) {
      setMessage("Open AniPlay from Telegram to watch an ad.");
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
        <p className="mt-3 text-sm text-white/50">
          {message}
        </p>
      )}
    </div>
  );
}

-1"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: unknown;
    };
    show_11876145?: () => Promise<unknown> | unknown;
  }
}

export default function TelegramAdButton() {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  const isTelegram =
    typeof window !== "undefined" &&
    Boolean(window.Telegram?.WebApp);

  useEffect(() => {
    if (!isTelegram) return;

    const script = document.createElement("script");
    script.src = "https://libtl.com/sdk.js";
    script.async = true;
    script.dataset.zone = "11876145";
    script.dataset.sdk = "show_11876145";

    script.onload = () => setReady(true);

    script.onerror = () => {
      setMessage("Ad service could not load.");
    };

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [isTelegram]);

  if (!isTelegram) {
    return null;
  }

  async function showAd() {
    setMessage("");

    if (!ready || !window.show_11876145) {
      setMessage("Ad is loading. Please try again.");
      return;
    }

    try {
      await window.show_11876145();
      setMessage("Thanks for supporting AniPlay!");
    } catch {
      setMessage("No ad is available right now.");
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
