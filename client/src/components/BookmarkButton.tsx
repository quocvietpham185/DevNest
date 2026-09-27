import { useEffect, useState } from "react";
import { isBookmarked, toggleBookmark } from "../lib/social";
import { useSession } from "../hooks/useSession";

export function BookmarkButton({ contentId }: { contentId: string }) {
  const { session } = useSession();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) isBookmarked(contentId, session.user.id).then(setSaved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, session?.user.id]);

  async function handleClick() {
    if (!session || busy) return;
    setBusy(true);
    const next = !saved;
    setSaved(next);
    try {
      await toggleBookmark(contentId, session.user.id, !next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!session || busy}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        saved
          ? "bg-accent-500 text-white"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      }`}
    >
      {saved ? "Đã lưu" : "Lưu"}
    </button>
  );
}
