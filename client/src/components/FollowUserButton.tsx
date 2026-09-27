import { useEffect, useState } from "react";
import { isFollowingUser, toggleFollowUser } from "../lib/social";
import { useSession } from "../hooks/useSession";

export function FollowUserButton({ profileId }: { profileId: string }) {
  const { session } = useSession();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session && session.user.id !== profileId) {
      isFollowingUser(session.user.id, profileId).then(setFollowing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, session?.user.id]);

  if (!session || session.user.id === profileId) return null;

  async function handleClick() {
    if (!session || busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    try {
      await toggleFollowUser(session.user.id, profileId, !next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        following
          ? "border border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          : "bg-accent-500 text-white hover:bg-accent-600"
      }`}
    >
      {following ? "Đang theo dõi" : "Theo dõi"}
    </button>
  );
}
