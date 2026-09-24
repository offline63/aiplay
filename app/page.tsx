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
  format: string | null;
  seasonYear: number | null;
};

type AnimeSectionProps = {
  title: string;
  subtitle: string;
  anime: Anime[];
};

async function getAnimeList(
  sort: string[],
  status?: string
): Promise<Anime[]> {
  const query = `
    query ($sort: [MediaSort], $status: MediaStatus) {
      Page(page: 1, perPage: 12) {
        media(
          type: ANIME
          sort: $sort
          status: $status
          isAdult: false
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
          format
          seasonYear
        }
      }
    }
  `;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        variables: {
          sort,
          status
        }
      }),
      next: {
        revalidate: 21600
      }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.data?.Page?.media || [];
  } catch {
    return [];
  }
}

function AnimeCard({ anime }: { anime: Anime }) {
  const title = anime.title.english || anime.title.romaji;

  return (
    <a
      href={`/anime/${anime.id}`}
      className="group w-36 shrink-0 sm:w-40"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:ring-red-500/70">
        <img
          src={anime.coverImage.large}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/50 to-transparent p-2 pt-10">
          <span className="rounded-md bg-yellow-400/90 px-2 py-1 text-xs font-bold text-black">
            ★ {anime.averageScore ?? "N/A"}
          </span>
        </div>
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-white/80 transition group-hover:text-red-300">
        {title}
      </h3>

      <p className="mt-1 text-xs text-white/45">
        {anime.format ?? "ANIME"}
        {anime.seasonYear ? ` • ${anime.seasonYear}` : ""}
        {anime.episodes ? ` • ${anime.episodes} eps` : ""}
      </p>
    </a>
  );
}

function AnimeSection({ title, subtitle, anime }: AnimeSectionProps) {
  if (anime.length === 0) return null;

  return (
    <section className="mt-11">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white/95">
            {title}
          </h2>

          <p className="mt-1 text-sm text-white/45">
            {subtitle}
          </p>
        </div>

        <a
          href="/search"
          className="text-sm font-semibold text-red-300/80 transition hover:text-red-200"
        >
          View all →
        </a>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3">
        {anime.map((item) => (
          <AnimeCard key={item.id} anime={item} />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [trending, popular, topRated, upcoming] = await Promise.all([
    getAnimeList(["TRENDING_DESC"]),
    getAnimeList(["POPULARITY_DESC"]),
    getAnimeList(["SCORE_DESC"]),
    getAnimeList(["POPULARITY_DESC"], "NOT_YET_RELEASED")
  ]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/85 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a
            href="/"
            className="text-2xl font-black tracking-wider text-red-500"
          >
            ANIPLAY
          </a>

          <a
            href="/search"
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-red-400/60 hover:bg-red-500/10 hover:text-white"
          >
            Search Anime
          </a>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-white/10 bg-zinc-950">
        <img
          src="/hero.gif"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/45" />
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="text-sm font-bold tracking-[0.25em] text-red-300/75">
            DISCOVER YOUR NEXT FAVOURITE
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white/95 sm:text-6xl">
            Anime, made simple.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
            Explore trending series, high-rated classics and upcoming releases.
            Every list refreshes automatically from AniList.
          </p>

          <a
            href="/search"
            className="mt-8 inline-flex rounded-xl bg-red-500 px-5 py-3 font-bold text-white shadow-lg shadow-red-950/50 transition hover:bg-red-400"
          >
            Browse Anime →
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pb-16">
        <AnimeSection
          title="Trending Now"
          subtitle="Anime people are discovering right now"
          anime={trending}
        />

        <AnimeSection
          title="Most Popular"
          subtitle="The community’s most followed anime"
          anime={popular}
        />

        <AnimeSection
          title="Top Rated"
          subtitle="Highly rated favourites worth watching"
          anime={topRated}
        />

        <AnimeSection
          title="Upcoming Anime"
          subtitle="Popular anime that have not released yet"
          anime={upcoming}
        />
      </div>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-white/35">
        AniPlay uses AniList for anime information.
      </footer>
    </main>
  );
}
