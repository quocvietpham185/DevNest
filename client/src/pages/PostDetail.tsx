import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { fetchContentById, type FeedItem } from "../lib/content";
import { LikeButton } from "../components/LikeButton";
import { BookmarkButton } from "../components/BookmarkButton";
import { ReportButton } from "../components/ReportButton";
import { CommentSection } from "../components/CommentSection";
import { TagPill } from "../components/TagPill";
import { ErrorState } from "../components/EmptyState";
import { ContentOwnerActions } from "../components/ContentOwnerActions";
import { ReadingProgressBar } from "../components/ReadingProgressBar";
import { CodeBlock } from "../components/CodeBlock";
import { setPageMetadata } from "../lib/seo";

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

  useEffect(() => {
    if (item) setPageMetadata(item.title, item.excerpt ?? undefined);
  }, [item]);

  if (error) return <ErrorState message={error} />;
  if (!item) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải...</p>;

  return (
    <article className="flex flex-col gap-6">
      <ReadingProgressBar />
      <header>
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">{item.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          {item.author && <span>@{item.author.username}</span>}
          {item.tags.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>
        <div className="mt-3"><ContentOwnerActions item={item} editPath={`/post/${item.id}/edit`} afterDelete="/" /></div>
      </header>

      <div className="markdown-body text-[15px] dark:text-zinc-200">
        {item.bodyMarkdown && (
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <span>⏱️</span>
            <span>Thời gian đọc: khoảng {Math.max(1, Math.ceil(item.bodyMarkdown.trim().split(/\s+/).length / 200))} phút</span>
          </div>
        )}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            code: CodeBlock,
            pre: ({ children }) => <>{children}</>,
          }}
        >
          {item.bodyMarkdown ?? ""}
        </ReactMarkdown>
      </div>

      <div className="flex items-center gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <LikeButton contentId={item.id} />
        <BookmarkButton contentId={item.id} />
        <ReportButton contentId={item.id} authorId={item.authorId} />
      </div>

      <CommentSection contentId={item.id} />
    </article>
  );
}
