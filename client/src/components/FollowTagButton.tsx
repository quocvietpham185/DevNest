import { useEffect, useState } from "react";
import { isFollowingTag, toggleFollowTag } from "../lib/social";
import { useSession } from "../hooks/useSession";

export function FollowTagButton({ tag }: { tag: string }) {
  const { session } = useSession();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) isFollowingTag(tag, session.user.id).then(setFollowing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag, session?.user.id]);

  if (!session) return null;

  async function handleClick() {
    if (!session || busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    try {
      await toggleFollowTag(tag, session.user.id, !next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={busy} className="text-xs font-medium text-accent-600 hover:underline dark:text-accent-400">
      {following ? "Bỏ theo dõi tag" : "Theo dõi tag"}
    </button>
  );
}
