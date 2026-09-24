type Anime = {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  coverImage: {
    large: string;
  };
  description: string | null;
  averageScore: number | null;
  episodes: number | null;
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
          large
        }
        description(asHtml: false)
        averageScore
        episodes
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
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        variables: { id }
      }),
      next: { revalidate: 21600 }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data?.Media || null;
  } catch {
    return null;
  }
}

export default async function AnimeDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const anime = await getAnime(Number(id));

  if (!anime) {
    return (
      <main className="min-h-screen bg-zinc-950 px-5 py-10 text-white">
        <a href="/search" className="text-red-400">
          Back to Browse Anime
        </a>

        <h1 className="mt-8 text-3xl font-black">
          Anime not found
        </h1>
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

      <section className="mx-auto flex max-w-5xl flex-col gap-7 px-5 py-10 sm:flex-row">
        <img
          src={anime.coverImage.large}
          alt={title}
          className="h-80 w-56 rounded-xl border border-zinc-700 object-cover"
        />

        <div className="max-w-3xl">
          <p className="text-sm font-bold tracking-widest text-red-400">
            ANIME DETAILS
          </p>

          <h1 className="mt-2 text-4xl font-black">
            {title}
          </h1>

          {anime.title.native && (
            <p className="mt-2 text-zinc-400">
              {anime.title.native}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-sm font-bold text-yellow-300">
              Score: {anime.averageScore ?? "N/A"}
            </span>

            <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm">
              Episodes: {anime.episodes ?? "?"}
            </span>

            <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm">
              {anime.status?.replaceAll("_", " ") ?? "Unknown"}
            </span>

            {anime.seasonYear && (
              <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm">
                {anime.seasonYear}
              </span>
            )}
          </div>

          <h2 className="mt-8 text-2xl font-bold">
            About
          </h2>

          <p className="mt-3 whitespace-pre-line leading-7 text-zinc-300">
            {anime.description || "No description available."}
          </p>

          <h2 className="mt-8 text-2xl font-bold">
            Genres
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {anime.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-red-900 bg-red-950/40 px-3 py-1 text-sm text-red-200"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
