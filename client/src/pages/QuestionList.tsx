import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFeed, type FeedItem } from "../lib/content";
import { ContentCard } from "../components/ContentCard";
import { EmptyState, ErrorState } from "../components/EmptyState";

export function QuestionList() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeed({ kind: "question" })
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được câu hỏi"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Hỏi đáp / Thảo luận</h1>
        <Link
          to="/questions/new"
          className="rounded-full bg-accent-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-600"
        >
          Đặt câu hỏi
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải...</p>
      ) : error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có câu hỏi nào" hint="Đặt câu hỏi đầu tiên cho cộng đồng!" />
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
