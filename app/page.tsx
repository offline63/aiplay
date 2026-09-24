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
  genres: string[];
};

async function getLatestAnime(): Promise<Anime[]> {
  const query = `
    query {
      Page(page: 1, perPage: 6) {
        media(
          type: ANIME
          status: RELEASING
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
          genres
        }
      }
    }
  `;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 21600 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.data.Page.media;
  } catch {
    return [];
  }
}

export default async function Home() {
  const animeList = await getLatestAnime();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="relative flex items-center justify-between border-b border-zinc-800 px-5 py-4">
        <a href="/" className="text-2xl font-black tracking-wider text-red-500">
          ANIPLAY
        </a>

        <a
          href="/search"
          className="absolute left-1/2 -translate-x-1/2 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold"
        >
          Browse Anime
        </a>

        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-300">
          BETA
        </span>
      </header>

      <section className="relative isolate min-h-[360px] overflow-hidden px-5 py-12">
        <img
          src="/hero.gif"
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-35"
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/30" />

        <div className="relative max-w-xl">
          <p className="mb-3 text-sm font-bold tracking-widest text-red-400">
            CURRENTLY AIRING
          </p>

          <h2 className="text-4xl font-black leading-tight">
            Discover the latest anime releases.
          </h2>

          <p className="mt-4 text-zinc-300">
            Search thousands of anime titles, explore trending releases, and find your next watch.
          </p>

          <a
            href="/search"
            className="mt-6 inline-block rounded-lg bg-red-600 px-5 py-3 font-bold hover:bg-red-500"
          >
            Explore Anime
          </a>
        </div>
      </section>

      <section className="px-5 pb-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Latest Anime</h2>
          <span className="text-sm text-zinc-400">
            {animeList.length} titles
          </span>
        </div>

        {animeList.length === 0 ? (
          <p className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-zinc-400">
            Anime data could not load. Check your internet and refresh.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {animeList.map((anime) => (
              <a
                key={anime.id}
                href={`/anime/${anime.id}`}
                className="block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
              >
                <img
                  src={anime.coverImage.large}
                  alt={anime.title.english || anime.title.romaji}
                  loading="lazy"
                  className="h-64 w-full object-cover"
                />

                <div className="p-3">
                  <h3 className="line-clamp-2 min-h-10 font-bold">
                    {anime.title.english || anime.title.romaji}
                  </h3>

                  <p className="mt-2 text-sm text-yellow-400">
                    Score: {anime.averageScore ?? "N/A"}
                  </p>

                  <p className="mt-1 line-clamp-1 text-xs text-zinc-400">
                    {anime.genres.slice(0, 2).join(" • ")}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
