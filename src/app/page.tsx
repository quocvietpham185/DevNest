const PLACEHOLDER_FEED = [
  {
    kind: "post" as const,
    title: "Vì sao mình chuyển từ REST sang tRPC cho side-project",
    author: "quocvietpham185",
    tags: ["typescript", "trpc"],
  },
  {
    kind: "project" as const,
    title: "DevNest — nền tảng cộng đồng cho developer",
    author: "quocvietpham185",
    tags: ["nextjs", "supabase"],
  },
  {
    kind: "repo" as const,
    title: "supabase/supabase",
    author: "quocvietpham185",
    tags: ["postgres", "backend-as-a-service"],
  },
];

const KIND_LABEL: Record<(typeof PLACEHOLDER_FEED)[number]["kind"], string> = {
  post: "Blog",
  project: "Project",
  repo: "Repo",
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          DevNest
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Blog, project showcase và repo hay — một feed, một cộng đồng.
        </p>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <ul className="flex flex-col gap-4">
          {PLACEHOLDER_FEED.map((item) => (
            <li
              key={item.title}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {KIND_LABEL[item.kind]}
              </span>
              <h2 className="mt-1 text-base font-medium text-zinc-950 dark:text-zinc-50">
                {item.title}
              </h2>
              <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                <span>@{item.author}</span>
                <span className="flex gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
