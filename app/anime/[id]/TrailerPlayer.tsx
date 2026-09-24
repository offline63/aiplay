"use client";

import { useState } from "react";

type TrailerPlayerProps = {
  trailerId: string;
  site: string;
};

export default function TrailerPlayer({
  trailerId,
  site
}: TrailerPlayerProps) {
  const [showTrailer, setShowTrailer] = useState(false);

  const supportedSite = site.toLowerCase() === "youtube";

  if (!supportedSite) return null;

  return (
    <section className="mt-8">
      <button
        type="button"
        onClick={() => setShowTrailer((value) => !value)}
        className="rounded-xl bg-red-500 px-5 py-3 font-bold text-white shadow-lg shadow-red-950/50 transition hover:bg-red-400"
      >
        {showTrailer ? "Hide Trailer" : "▶ Watch Trailer"}
      </button>

      {showTrailer && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/40">
          <div className="aspect-video">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&rel=0`}
              title="Anime trailer"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
