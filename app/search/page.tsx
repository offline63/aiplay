"use client";

import { FormEvent, useEffect, useState } from "react";

type Anime = {
  id: number;
  title: {
    romaji: string;
    english: string | null;
  };
  coverImage: {
    large: string;
  };
  averageScore: number | null;
  episodes: number | null;
  genres: string[];
};

type AniListResponse = {
  data?: {
    Page: {
      pageInfo: {
        hasNextPage: boolean;
      };
      media: Anime[];
    };
  };
  errors?: Array<{ message: string }>;
};

const ANIME_QUERY = `
  query ($page: Int, $search: String) {
    Page(page: $page, perPage: 24) {
      pageInfo {
        hasNextPage
      }
      media(
        type: ANIME
        search: $search
        sort: POPULARITY_DESC
      ) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        averageScore
        episodes
        genres
      }
    }
  }
`;

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadAnime(
    pageNumber: number,
    searchText: string,
    append = false
  ) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: ANIME_QUERY,
          variables: {
            page: pageNumber,
            search: searchText.trim() || null,
          },
        }),
      });

      const data: AniListResponse = await response.json();

      if (!response.ok || data.errors || !data.data) {
        throw new Error(data.errors?.[0]?.message || "Anime load nahi hua");
      }

      const result = data.data.Page;

      setAnimeList((oldList) =>
        append ? [...oldList, ...result.media] : result.media
      );
      setHasNextPage(result.pageInfo.hasNextPage);
      setPage(pageNumber);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kuch galat ho gaya. Dobara try karo."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnime(1, "");
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newSearch = input.trim();

    setSearch(newSearch);
    loadAnime(1, newSearch);
  }

  function loadMore() {
    if (!loading && hasNextPage) {
      loadAnime(page + 1, search, true);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
        <a href="/" className="text-2xl font-black tracking-wider text-red-500">
          ANIPLAY
        </a>

        <a
          href="/"
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-semibold"
        >
          Home
        </a>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <h1 className="text-3xl font-black">Browse Anime</h1>

        <p className="mt-2 text-zinc-400">
          Kisi bhi anime ka naam search karo.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            type="search"
            placeholder="Search: Naruto, One Piece, Demon Slayer..."
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-red-600 px-5 py-3 font-bold disabled:opacity-50"
          >
            Search
          </button>
        </form>

        {search && (
          <p className="mt-5 text-sm text-zinc-400">
            Results for: <span className="font-bold text-white">{search}</span>
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-lg border border-red-900 bg-red-950 p-4 text-red-200">
            {error}
          </p>
        )}

        {!error && (
          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {animeList.map((anime) => (
              <a
                key={anime.id}
                href={`/anime/${anime.id}`}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-red-500"
              >
                <img
                  src={anime.coverImage.large}
                  alt={anime.title.english || anime.title.romaji}
                  className="h-64 w-full object-cover"
                  loading="lazy"
                />

                <div className="p-3">
                  <h2 className="line-clamp-2 min-h-10 font-bold">
                    {anime.title.english || anime.title.romaji}
                  </h2>

                  <p className="mt-2 text-xs text-yellow-400">
                    Score: {anime.averageScore ?? "N/A"}
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    Episodes: {anime.episodes ?? "?"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}

        {loading && (
          <p className="py-8 text-center text-zinc-400">Anime loading...</p>
        )}

        {!loading && animeList.length === 0 && !error && (
          <p className="py-8 text-center text-zinc-400">
            Koi anime nahi mila. Dusra keyword try karo.
          </p>
        )}

        {!loading && hasNextPage && animeList.length > 0 && (
          <div className="flex justify-center py-10">
            <button
              onClick={loadMore}
              className="rounded-lg bg-zinc-800 px-6 py-3 font-bold hover:bg-zinc-700"
            >
              Load More
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
