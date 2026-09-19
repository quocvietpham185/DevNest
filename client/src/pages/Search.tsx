import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchContent, type FeedItem } from "../lib/content";
import { ContentCard } from "../components/ContentCard";
import { EmptyState, ErrorState } from "../components/EmptyState";

export function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!q) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    searchContent(q)
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Tìm kiếm thất bại"))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
        Kết quả cho "<span className="font-semibold">{q}</span>"
      </h1>

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tìm...</p>
      ) : error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="Không tìm thấy kết quả nào" />
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
