import { Link } from "react-router-dom";

export function TagPill({ tag, active }: { tag: string; active?: boolean }) {
  return (
    <Link
      to={`/?tag=${encodeURIComponent(tag)}`}
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
        active
          ? "bg-accent-500 text-white"
          : "bg-zinc-100 text-zinc-600 hover:bg-accent-50 hover:text-accent-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-accent-700/30"
      }`}
    >
      #{tag}
    </Link>
  );
}
