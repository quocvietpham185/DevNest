import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchFeed, type FeedItem } from "../lib/content";
import { ContentCard } from "../components/ContentCard";
import { EmptyState, ErrorState } from "../components/EmptyState";

export function Home() {
  const [params, setParams] = useSearchParams();
  const tag = params.get("tag") ?? undefined;
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchFeed({ tag })
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được feed"))
      .finally(() => setLoading(false));
  }, [tag]);

  return (
    <div className="flex flex-col gap-4">
      {tag && (
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          Đang lọc theo <span className="font-medium text-accent-600 dark:text-accent-400">#{tag}</span>
          <button onClick={() => setParams({})} className="text-xs underline">
            Bỏ lọc
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải feed...</p>
      ) : error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có nội dung nào" hint="Là người đầu tiên đăng blog, project, câu hỏi hoặc repo!" />
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
