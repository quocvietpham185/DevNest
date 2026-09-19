import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchContentById, type FeedItem } from "../lib/content";
import { LikeButton } from "../components/LikeButton";
import { CommentSection } from "../components/CommentSection";
import { TagPill } from "../components/TagPill";
import { ErrorState } from "../components/EmptyState";

const STATUS_LABEL: Record<string, string> = {
  in_progress: "Đang phát triển",
  completed: "Hoàn thành",
  looking_for_collaborators: "Tìm cộng tác viên",
};

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<FeedItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchContentById(id)
      .then(setItem)
      .catch((err) => setError(err instanceof Error ? err.message : "Không tìm thấy project"));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!item) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải...</p>;

  return (
    <article className="flex flex-col gap-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">{item.title}</h1>
          {item.status && (
            <span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-700 dark:bg-accent-700/20 dark:text-accent-400">
              {STATUS_LABEL[item.status] ?? item.status}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          {item.author && <span>@{item.author.username}</span>}
          {item.tags.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>
      </header>

      <p className="whitespace-pre-wrap text-[15px] text-zinc-700 dark:text-zinc-300">{item.excerpt}</p>

      <div className="flex flex-wrap gap-2">
        {item.githubUrl && (
          <a
            href={item.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Xem repo
          </a>
        )}
        {item.demoUrl && (
          <a
            href={item.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-accent-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-600"
          >
            Xem demo
          </a>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <LikeButton contentId={item.id} />
      </div>

      <CommentSection contentId={item.id} />
    </article>
  );
}
