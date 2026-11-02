import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchContent, type ContentKind, type FeedItem } from "../lib/content";
import { ContentCard } from "../components/ContentCard";
import { EmptyState, ErrorState } from "../components/EmptyState";

export function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const [kind, setKind] = useState<ContentKind | "all">("all");
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
    searchContent(q, { kind: kind === "all" ? undefined : kind })
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Tìm kiếm thất bại"))
      .finally(() => setLoading(false));
  }, [q, kind]);

  const filters: { value: ContentKind | "all"; label: string }[] = [
    { value: "all", label: "Tất cả" },
    { value: "post", label: "Blog" },
    { value: "project", label: "Project" },
    { value: "question", label: "Q&A" },
    { value: "repo", label: "Repo" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
        Kết quả cho "<span className="font-semibold">{q}</span>"
      </h1>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            type="button"
            key={filter.value}
            onClick={() => setKind(filter.value)}
            className={`rounded-full px-3 py-1 text-sm ${
              kind === filter.value
                ? "bg-accent-500 text-white"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

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
