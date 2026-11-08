import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { fetchProfileByUsername, updateProfile } from "../lib/profile";
import { syncGitHubProfile } from "../lib/api";
import { ErrorState } from "../components/EmptyState";
import { supabase } from "../lib/supabaseClient";

export function EditProfile() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!session) return;
    // Query directly by id to be 100% reliable
    supabase
      .from("profiles")
      .select("username, github_username, bio, avatar_url")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setUsername(data.username);
          setGithubUsername(data.github_username ?? "");
          setBio(data.bio ?? "");
          setAvatarUrl(data.avatar_url ?? "");
        } else {
          const handle = session.user.user_metadata.user_name ?? session.user.email?.split("@")[0] ?? "";
          if (handle) {
            fetchProfileByUsername(handle).then((p) => {
              if (p) {
                setUsername(p.username);
                setGithubUsername(p.githubUsername ?? "");
                setBio(p.bio ?? "");
                setAvatarUrl(p.avatarUrl ?? "");
              }
            });
          }
        }
      });
  }, [session]);

  async function handleSyncGitHub() {
    if (!session || !githubUsername.trim()) return;
    setSyncing(true);
    setSyncMsg(null);
    setError(null);
    try {
      const res = await syncGitHubProfile(session.user.id, githubUsername.trim());
      if (res.profile) {
        if (!avatarUrl && res.profile.avatarUrl) setAvatarUrl(res.profile.avatarUrl);
        if (!bio && res.profile.bio) setBio(res.profile.bio);
        setSyncMsg("Đã đồng bộ thông tin từ GitHub thành công!");
      }
    } catch (err) {
      setSyncMsg(err instanceof Error ? err.message : "Lỗi khi đồng bộ GitHub");
    } finally {
      setSyncing(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateProfile(session.user.id, {
        username: username.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
        githubUsername: githubUsername.trim() || undefined,
      });
      navigate(`/u/${username.trim()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được profile");
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) return <ErrorState message="Bạn cần đăng nhập." />;

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Chỉnh sửa profile</h1>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Username DevNest</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">GitHub Username (Phase 2 Auto-sync)</label>
        <div className="flex gap-2">
          <input
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            placeholder="vd: octocat"
            className="flex-1 rounded-xl border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <button
            type="button"
            onClick={handleSyncGitHub}
            disabled={syncing || !githubUsername.trim()}
            className="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {syncing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
          </button>
        </div>
        {syncMsg && <p className="mt-1 text-xs text-accent-600 dark:text-accent-400">{syncMsg}</p>}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Link ảnh đại diện</label>
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Tiểu sử (Bio)</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Giới thiệu ngắn về bạn"
          rows={3}
          className="w-full rounded-2xl border border-zinc-300 p-4 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      {error && <ErrorState message={error} />}

      <button
        type="submit"
        disabled={submitting}
        className="self-end rounded-full bg-accent-500 px-5 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
      >
        {submitting ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
