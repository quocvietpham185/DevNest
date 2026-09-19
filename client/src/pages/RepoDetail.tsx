import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchContentById, type FeedItem } from "../lib/content";
import { LikeButton } from "../components/LikeButton";
import { CommentSection } from "../components/CommentSection";
import { ErrorState } from "../components/EmptyState";

export function RepoDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<FeedItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchContentById(id)
      .then(setItem)
      .catch((err) => setError(err instanceof Error ? err.message : "Không tìm thấy repo"));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!item) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải...</p>;

  return (
    <article className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          {item.repoOwner}/{item.repoName}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          {item.author && <span>Chia sẻ bởi @{item.author.username}</span>}
          {item.language && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">{item.language}</span>
          )}
          {typeof item.stars === "number" && <span>★ {item.stars}</span>}
        </div>
      </header>

      {item.excerpt && <p className="text-[15px] text-zinc-600 dark:text-zinc-400">{item.excerpt}</p>}

      {item.bodyMarkdown && (
        <div className="rounded-2xl border border-accent-100 bg-accent-50 p-4 text-[15px] text-zinc-700 dark:border-accent-700/30 dark:bg-accent-700/10 dark:text-zinc-200">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-400">
            Vì sao repo này đáng chú ý
          </p>
          {item.bodyMarkdown}
        </div>
      )}

      {item.githubUrl && (
        <a
          href={item.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="self-start rounded-full bg-accent-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-600"
        >
          Xem trên GitHub
        </a>
      )}

      <p className="text-xs text-zinc-400">Dữ liệu tại thời điểm chia sẻ, không tự động cập nhật.</p>

      <div className="flex items-center gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <LikeButton contentId={item.id} />
      </div>

      <CommentSection contentId={item.id} />
    </article>
  );
}
