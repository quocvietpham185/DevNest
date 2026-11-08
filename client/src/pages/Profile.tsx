import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProfileByUsername, type Profile as ProfileType } from "../lib/profile";
import { fetchFeed, type FeedItem } from "../lib/content";
import { fetchBookmarkedItems, fetchFollowerCount } from "../lib/social";
import {
  fetchGitHubActivity,
  fetchGitHubPinnedRepos,
  syncGitHubProfile,
  type GitHubActivityEvent,
  type PinnedRepo,
} from "../lib/api";
import { ContentCard } from "../components/ContentCard";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { FollowUserButton } from "../components/FollowUserButton";
import { useSession } from "../hooks/useSession";
import { setPageMetadata } from "../lib/seo";

type Tab = "posts" | "bookmarks" | "pinned" | "activity";

export function Profile() {
  const { username } = useParams<{ username: string }>();
  const { session } = useSession();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [bookmarks, setBookmarks] = useState<FeedItem[]>([]);
  const [pinnedRepos, setPinnedRepos] = useState<PinnedRepo[]>([]);
  const [activity, setActivity] = useState<GitHubActivityEvent[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [tab, setTab] = useState<Tab>("posts");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setTab("posts");
    fetchProfileByUsername(username)
      .then(async (p) => {
        setProfile(p);
        if (p) {
          setPageMetadata(`@${p.username}`, p.bio ?? `Profile của @${p.username} trên DevNest`);
          const [feed, count] = await Promise.all([
            fetchFeed({ limit: 100 }),
            fetchFollowerCount(p.id),
          ]);
          setItems(feed.filter((item) => item.author?.id === p.id));
          setFollowerCount(count);

          // Phase 2: Load GitHub Pinned Repos & Activity
          if (p.githubUsername) {
            fetchGitHubPinnedRepos(p.githubUsername)
              .then(setPinnedRepos)
              .catch(() => setPinnedRepos(p.pinnedRepos ?? []));

            fetchGitHubActivity(p.githubUsername)
              .then(setActivity)
              .catch(() => setActivity(p.githubActivity ?? []));
          }
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được profile"))
      .finally(() => setLoading(false));
  }, [username]);

  const isOwnProfile = session?.user.id === profile?.id;

  useEffect(() => {
    if (tab === "bookmarks" && isOwnProfile && session) {
      fetchBookmarkedItems(session.user.id).then(setBookmarks);
    }
  }, [tab, isOwnProfile, session]);

  async function handleSync() {
    if (!session || !profile?.githubUsername) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await syncGitHubProfile(session.user.id, profile.githubUsername);
      if (res.profile) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                company: res.profile.company,
                location: res.profile.location,
                followersCount: res.profile.followers,
                followingCount: res.profile.following,
                publicReposCount: res.profile.publicRepos,
              }
            : null
        );
        if (res.pinned) setPinnedRepos(res.pinned);
        if (res.activity) setActivity(res.activity);
        setSyncMsg("Đã đồng bộ thành công từ GitHub!");
      }
    } catch (err) {
      setSyncMsg(err instanceof Error ? err.message : "Lỗi khi đồng bộ GitHub");
    } finally {
      setSyncing(false);
    }
  }

  if (loading) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải...</p>;
  if (error) return <ErrorState message={error} />;
  if (!profile) return <EmptyState title="Không tìm thấy user này" />;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.username} className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-lg font-semibold text-accent-700 dark:bg-accent-700/30 dark:text-accent-400">
                {profile.username[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">@{profile.username}</h1>
              {profile.githubUsername && (
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-accent-600 hover:underline dark:text-accent-400"
                >
                  <span>🐙 github.com/{profile.githubUsername}</span>
                  <span>↗</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwnProfile && profile.githubUsername && (
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                {syncing ? "Đang sync..." : "🔄 Đồng bộ GitHub"}
              </button>
            )}

            {isOwnProfile ? (
              <Link
                to="/settings/profile"
                className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Chỉnh sửa
              </Link>
            ) : (
              <FollowUserButton profileId={profile.id} />
            )}
          </div>
        </div>

        {syncMsg && <p className="text-xs text-accent-600 dark:text-accent-400">{syncMsg}</p>}

        {profile.bio && <p className="text-sm text-zinc-600 dark:text-zinc-300">{profile.bio}</p>}

        {/* Phase 2: GitHub Metadata Badges */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span>👥 {followerCount} người theo dõi trên DevNest</span>
          {profile.company && <span>🏢 {profile.company}</span>}
          {profile.location && <span>📍 {profile.location}</span>}
          {profile.followersCount !== undefined && profile.followersCount > 0 && (
            <span>★ {profile.followersCount} followers GitHub</span>
          )}
          {profile.publicReposCount !== undefined && profile.publicReposCount > 0 && (
            <span>📦 {profile.publicReposCount} repositories công khai</span>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-900" style={{ width: "fit-content" }}>
        <button
          onClick={() => setTab("posts")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            tab === "posts" ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          Bài đăng ({items.length})
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setTab("bookmarks")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === "bookmarks" ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Đã lưu
          </button>
        )}

        {profile.githubUsername && (
          <>
            <button
              onClick={() => setTab("pinned")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                tab === "pinned" ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              Pinned Repos ({pinnedRepos.length})
            </button>
            <button
              onClick={() => setTab("activity")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                tab === "activity" ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              GitHub Activity
            </button>
          </>
        )}
      </div>

      {/* Content based on tab */}
      {tab === "posts" && (
        items.length === 0 ? (
          <EmptyState title="Chưa đăng nội dung nào" />
        ) : (
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </ul>
        )
      )}

      {tab === "bookmarks" && (
        bookmarks.length === 0 ? (
          <EmptyState title="Chưa lưu nội dung nào" />
        ) : (
          <ul className="flex flex-col gap-4">
            {bookmarks.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </ul>
        )
      )}

      {tab === "pinned" && (
        pinnedRepos.length === 0 ? (
          <EmptyState title="Chưa có repository nào được ghim" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pinnedRepos.map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-accent-500/50 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-accent-700 dark:text-accent-400">
                      {repo.name}
                    </span>
                    <span className="text-xs text-zinc-400">↗</span>
                  </div>
                  {repo.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                      {repo.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-accent-500"></span>
                      {repo.language}
                    </span>
                  )}
                  <span>★ {repo.stars}</span>
                </div>
              </a>
            ))}
          </div>
        )
      )}

      {tab === "activity" && (
        activity.length === 0 ? (
          <EmptyState title="Chưa có hoạt động GitHub gần đây" />
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {activity.map((ev) => (
              <li key={ev.id} className="flex items-start justify-between gap-4 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-base">⚡</span>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{ev.summary}</p>
                    <a
                      href={`https://github.com/${ev.repo}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-accent-600 hover:underline dark:text-accent-400"
                    >
                      {ev.repo} ↗
                    </a>
                  </div>
                </div>
                <time className="shrink-0 text-xs text-zinc-400">
                  {new Date(ev.createdAt).toLocaleDateString("vi-VN")}
                </time>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
