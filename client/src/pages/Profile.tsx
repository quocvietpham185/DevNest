import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProfileByUsername, type Profile as ProfileType } from "../lib/profile";
import { fetchFeed, type FeedItem } from "../lib/content";
import { ContentCard } from "../components/ContentCard";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { useSession } from "../hooks/useSession";

export function Profile() {
  const { username } = useParams<{ username: string }>();
  const { session } = useSession();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetchProfileByUsername(username)
      .then(async (p) => {
        setProfile(p);
        if (p) {
          const feed = await fetchFeed({ limit: 100 });
          setItems(feed.filter((item) => item.author?.id === p.id));
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được profile"))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải...</p>;
  if (error) return <ErrorState message={error} />;
  if (!profile) return <EmptyState title="Không tìm thấy user này" />;

  const isOwnProfile = session?.user.id === profile.id;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.username} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-lg font-semibold text-accent-700 dark:bg-accent-700/30 dark:text-accent-400">
            {profile.username[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">@{profile.username}</h1>
          {profile.bio && <p className="text-sm text-zinc-500 dark:text-zinc-400">{profile.bio}</p>}
        </div>
        {isOwnProfile && (
          <Link
            to="/settings/profile"
            className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Chỉnh sửa
          </Link>
        )}
      </header>

      {items.length === 0 ? (
        <EmptyState title="Chưa đăng nội dung nào" />
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
