import { useEffect, useState } from "react";
import { fetchLikeCount, hasLiked, toggleLike } from "../lib/content";
import { useSession } from "../hooks/useSession";

export function LikeButton({ contentId }: { contentId: string }) {
  const { session } = useSession();
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchLikeCount(contentId).then(setCount);
    if (session) hasLiked(contentId, session.user.id).then(setLiked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, session?.user.id]);

  async function handleClick() {
    if (!session || busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    try {
      await toggleLike(contentId, session.user.id, !next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!session || busy}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        liked
          ? "bg-accent-500 text-white"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      }`}
    >
      <span>{liked ? "♥" : "♡"}</span>
      <span>{count}</span>
    </button>
  );
}
