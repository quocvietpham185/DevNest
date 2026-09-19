import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { fetchProfileByUsername, updateProfile } from "../lib/profile";
import { ErrorState } from "../components/EmptyState";

export function EditProfile() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handle = session?.user.user_metadata.user_name ?? session?.user.email;
    if (!handle) return;
    fetchProfileByUsername(handle).then((p) => {
      if (!p) return;
      setUsername(p.username);
      setBio(p.bio ?? "");
      setAvatarUrl(p.avatarUrl ?? "");
    });
  }, [session]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateProfile(session.user.id, { username, bio, avatarUrl });
      navigate(`/u/${username}`);
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
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
        className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />
      <input
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        placeholder="Link ảnh đại diện"
        className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Giới thiệu ngắn về bạn"
        rows={4}
        className="rounded-2xl border border-zinc-300 p-4 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />

      {error && <ErrorState message={error} />}

      <button
        type="submit"
        disabled={submitting}
        className="self-end rounded-full bg-accent-500 px-5 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
      >
        {submitting ? "Đang lưu..." : "Lưu"}
      </button>
    </form>
  );
}
