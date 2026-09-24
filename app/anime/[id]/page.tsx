type Anime = {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  coverImage: {
    extraLarge: string | null;
    large: string;
  };
  bannerImage: string | null;
  description: string | null;
  averageScore: number | null;
  episodes: number | null;
  duration: number | null;
  status: string | null;
  seasonYear: number | null;
  genres: string[];
};

async function getAnime(id: number): Promise<Anime | null> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
        }
        bannerImage
        description(asHtml: false)
        averageScore
        episodes
        duration
        status
        seasonYear
        genres
      }
    }
  `;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { id },
      }),
      next: { revalidate: 21600 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data?.Media ?? null;
  } catch {
    return null;
  }
}

function cleanDescription(text: string | null) {
  if (!text) return "No description available for this anime.";
  return text.replace(/<brs*/?>/gi, "
").replace(/<[^>]*>/g, "");
}

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const animeId = Number(id);
  const anime = Number.isInteger(animeId) ? await getAnime(animeId) : null;

  if (!anime) {
    return (
      <main className="min-h-screen bg-zinc-950 px-5 py-10 text-white">
        <a href="/search" className="text-red-400">
          ← Back to Browse Anime
        </a>

        <h1 className="mt-10 text-3xl font-black">Anime not found</h1>
        <p className="mt-3 text-zinc-400">
          This anime could not be loaded. Please go back and try again.
        </p>
      </main>
    );
  }

  const title = anime.title.english || anime.title.romaji;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
        <a href="/" className="text-2xl font-black tracking-wider text-red-500">
          ANIPLAY
        </a>

        <a
          href="/search"
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-semibold"
        >
          Browse Anime
        </a>
      </header>

      <section className="relative overflow-hidden border-b border-zinc-800">
        {anime.bannerImage && (
          <img
            src={anime.bannerImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/50" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end">
          <img
            src={anime.coverImage.extraLarge || anime.coverImage.large}
            alt={title}
            className="h-72 w-48 rounded-xl border border-zinc-700 object-cover shadow-2xl"
          />

          <div className="max-w-3xl">
            <p className="text-sm font-bold tracking-widest text-red-400">
              ANIME DETAILS
            </p>

            <h1 className="mt-2 text-4xl font-black leading-tight">{title}</h1>

            {anime.title.native && (
              <p className="mt-2 text-zinc-400">{anime.title.native}</p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-sm font-bold text-yellow-300">
                Score: {anime.averageScore ?? "N/A"}
              </span>

              <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-200">
                Episodes: {anime.episodes ?? "?"}
              </span>

              <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-200">
                {anime.status?.replaceAll("_", " ") ?? "Unknown"}
              </span>

              {anime.seasonYear && (
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-200">
                  {anime.seasonYear}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <h2 className="text-2xl font-bold">About</h2>

        <p className="mt-4 max-w-4xl whitespace-pre-line leading-7 text-zinc-300">
          {cleanDescription(anime.description)}
        </p>

        <h2 className="mt-10 text-2xl font-bold">Genres</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {anime.genres.map((genre) => (
            <span
              key={genre}
              className="rounded-full border border-red-900 bg-red-950/40 px-3 py-1 text-sm text-red-200"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs font-bold tracking-wider text-zinc-500">
              EPISODES
            </p>
            <p className="mt-1 text-xl font-black">{anime.episodes ?? "?"}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs font-bold tracking-wider text-zinc-500">
              DURATION
            </p>
            <p className="mt-1 text-xl font-black">
              {anime.duration ? `${anime.duration} min` : "?"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
