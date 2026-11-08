import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { fetchContentById, type FeedItem } from "../lib/content";
import { fetchRepoReadme, refreshRepoMetadata, type FullReadme } from "../lib/api";
import { LikeButton } from "../components/LikeButton";
import { BookmarkButton } from "../components/BookmarkButton";
import { ReportButton } from "../components/ReportButton";
import { CommentSection } from "../components/CommentSection";
import { ErrorState } from "../components/EmptyState";
import { ContentOwnerActions } from "../components/ContentOwnerActions";
import { setPageMetadata } from "../lib/seo";

export function RepoDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<FeedItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [readme, setReadme] = useState<FullReadme | null>(null);
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [readmeError, setReadmeError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchContentById(id)
      .then(setItem)
      .catch((err) => setError(err instanceof Error ? err.message : "Không tìm thấy repo"));
  }, [id]);

  useEffect(() => {
    if (item) setPageMetadata(`${item.repoOwner}/${item.repoName}`, item.excerpt ?? undefined);
  }, [item]);

  async function loadReadme() {
    if (!item?.githubUrl) return;
    setReadmeLoading(true);
    setReadmeError(null);
    try {
      const data = await fetchRepoReadme(item.githubUrl);
      setReadme(data);
    } catch (err) {
      setReadmeError(err instanceof Error ? err.message : "Không thể tải README từ GitHub");
    } finally {
      setReadmeLoading(false);
    }
  }

  async function handleRefreshMetadata() {
    if (!id) return;
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const res = await refreshRepoMetadata(id);
      if (res.metadata) {
        setItem((prev) =>
          prev
            ? {
                ...prev,
                stars: res.metadata.stars,
                excerpt: res.metadata.description,
                language: res.metadata.primaryLanguage,
              }
            : null
        );
        setRefreshMsg("Đã đồng bộ thông tin mới nhất từ GitHub!");
      }
    } catch (err) {
      setRefreshMsg(err instanceof Error ? err.message : "Lỗi khi đồng bộ dữ liệu GitHub");
    } finally {
      setRefreshing(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!item) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải...</p>;

  return (
    <article className="flex flex-col gap-6">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            {item.repoOwner}/{item.repoName}
          </h1>
          <button
            type="button"
            onClick={handleRefreshMetadata}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <span>🔄</span>
            {refreshing ? "Đang đồng bộ..." : "Làm mới từ GitHub"}
          </button>
        </div>

        {refreshMsg && (
          <p className="mt-1 text-xs text-accent-600 dark:text-accent-400">{refreshMsg}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          {item.author && <span>Chia sẻ bởi @{item.author.username}</span>}
          {item.language && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">{item.language}</span>
          )}
          {typeof item.stars === "number" && <span>★ {item.stars} sao</span>}
        </div>
        <div className="mt-3">
          <ContentOwnerActions item={item} editPath={`/repo/${item.id}/edit`} afterDelete="/repos" />
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

      <div className="flex flex-wrap items-center gap-3">
        {item.githubUrl && (
          <a
            href={item.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-accent-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-600"
          >
            Xem trên GitHub ↗
          </a>
        )}

        {!readme && (
          <button
            type="button"
            onClick={loadReadme}
            disabled={readmeLoading}
            className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {readmeLoading ? "Đang tải README..." : "📖 Đọc README trong app"}
          </button>
        )}
      </div>

      {readmeError && <ErrorState message={readmeError} />}

      {readme && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <span className="font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              📄 {readme.name}
            </span>
            <span className="text-xs text-zinc-400">
              {(readme.size / 1024).toFixed(1)} KB (Phase 2 Auto-fetch)
            </span>
          </div>
          <div className="markdown-body text-[15px] dark:text-zinc-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {readme.content}
            </ReactMarkdown>
          </div>
        </section>
      )}

      <p className="text-xs text-zinc-400">
        Được hỗ trợ bởi hệ thống GitHub Cache & Sync (Phase 2).
      </p>

      <div className="flex items-center gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <LikeButton contentId={item.id} />
        <BookmarkButton contentId={item.id} />
        <ReportButton contentId={item.id} authorId={item.authorId} />
      </div>

      <CommentSection contentId={item.id} />
    </article>
  );
}
