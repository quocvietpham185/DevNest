import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchContentById, type FeedItem } from "../lib/content";
import { CommentSection } from "../components/CommentSection";
import { TagPill } from "../components/TagPill";
import { ErrorState } from "../components/EmptyState";

const STATUS_LABEL: Record<string, string> = {
  open: "Chưa giải quyết",
  resolved: "Đã giải quyết",
};

export function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<FeedItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    fetchContentById(id)
      .then(setItem)
      .catch((err) => setError(err instanceof Error ? err.message : "Không tìm thấy câu hỏi"));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <ErrorState message={error} />;
  if (!item) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải...</p>;

  return (
    <article className="flex flex-col gap-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">{item.title}</h1>
          {item.status && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                item.status === "resolved"
                  ? "bg-accent-500 text-white"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
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

      <div className="markdown-body text-[15px] dark:text-zinc-200">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.bodyMarkdown ?? ""}</ReactMarkdown>
      </div>

      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <CommentSection contentId={item.id} isQuestion questionAuthorId={item.author?.id} onAccepted={load} />
      </div>
    </article>
  );
}
