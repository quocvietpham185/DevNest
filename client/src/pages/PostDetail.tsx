import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchContentById, type FeedItem } from "../lib/content";
import { LikeButton } from "../components/LikeButton";
import { CommentSection } from "../components/CommentSection";
import { TagPill } from "../components/TagPill";
import { ErrorState } from "../components/EmptyState";

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<FeedItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchContentById(id)
      .then(setItem)
      .catch((err) => setError(err instanceof Error ? err.message : "Không tìm thấy bài viết"));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!item) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải...</p>;

  return (
    <article className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">{item.title}</h1>
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

      <div className="flex items-center gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <LikeButton contentId={item.id} />
      </div>

      <CommentSection contentId={item.id} />
    </article>
  );
}
