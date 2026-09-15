import { useState, type FormEvent } from "react";
import { lookupRepo, type RepoMetadata } from "../lib/api";

export function ShareRepo() {
  const [repoUrl, setRepoUrl] = useState("");
  const [metadata, setMetadata] = useState<RepoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMetadata(null);

    try {
      setMetadata(await lookupRepo(repoUrl));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Share một repo</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Dán link GitHub repo — backend sẽ tự lấy metadata (stars, ngôn ngữ, README) qua Octokit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          required
          value={repoUrl}
          onChange={(event) => setRepoUrl(event.target.value)}
          placeholder="owner/name hoặc https://github.com/owner/name"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
        >
          {loading ? "Đang tìm..." : "Tìm repo"}
        </button>
      </form>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {metadata && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-baseline justify-between">
            <h2 className="font-medium text-zinc-950 dark:text-zinc-50">
              {metadata.owner}/{metadata.name}
            </h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">★ {metadata.stars}</span>
          </div>
          {metadata.description && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{metadata.description}</p>
          )}
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            {metadata.primaryLanguage && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                {metadata.primaryLanguage}
              </span>
            )}
            <a
              href={metadata.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Xem trên GitHub
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
