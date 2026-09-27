import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { fetchFeed, type FeedItem } from "../lib/content";

export function RepoList() {
  const [repos, setRepos] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeed({ kind: "repo", limit: 50 })
      .then(setRepos)
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được danh sách repo"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Repository được chia sẻ</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Khám phá những repo đáng chú ý từ cộng đồng DevNest.</p>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải repo...</p>
      ) : error ? (
        <ErrorState message={error} />
      ) : repos.length === 0 ? (
        <EmptyState title="Chưa có repo nào" hint="Hãy chia sẻ repository đầu tiên với cộng đồng!" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {repos.map((repo) => (
            <li
              key={repo.id}
              className="flex min-h-56 flex-col rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-400">Repo</span>
                {repo.language && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {repo.language}
                  </span>
                )}
              </div>

              <Link
                to={`/repos/${repo.id}`}
                className="mt-3 text-lg font-semibold text-zinc-950 hover:text-accent-600 hover:underline dark:text-zinc-50 dark:hover:text-accent-400"
              >
                {repo.repoOwner}/{repo.repoName}
              </Link>

              <p className="mt-2 line-clamp-3 text-sm text-zinc-500 dark:text-zinc-400">
                {repo.excerpt ?? "Chưa có mô tả cho repository này."}
              </p>

              <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-zinc-500 dark:text-zinc-400">
                <span>{repo.author ? `@${repo.author.username}` : "DevNest"}</span>
                <span>★ {repo.stars ?? 0}</span>
              </div>

              {repo.githubUrl && (
                <a
                  href={repo.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 text-sm font-medium text-accent-600 hover:underline dark:text-accent-400"
                >
                  Xem trên GitHub ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}