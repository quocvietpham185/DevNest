import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../lib/content";
import { useSession } from "../hooks/useSession";
import { ErrorState } from "../components/EmptyState";

const STATUS_OPTIONS = [
  { value: "in_progress", label: "Đang phát triển" },
  { value: "completed", label: "Hoàn thành" },
  { value: "looking_for_collaborators", label: "Tìm cộng tác viên" },
] as const;

export function NewProject() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]["value"]>("in_progress");
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setSubmitting(true);
    setError(null);
    try {
      const id = await createProject({
        authorId: session.user.id,
        title,
        description,
        status,
        repoUrl,
        demoUrl,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được project");
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) return <ErrorState message="Bạn cần đăng nhập để tạo project." />;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Giới thiệu project</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tên project"
        required
        className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Mô tả ngắn về project"
        rows={4}
        required
        className="rounded-2xl border border-zinc-300 p-4 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => setStatus(opt.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              status === opt.value
                ? "bg-accent-500 text-white"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <input
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        placeholder="Link repo (không bắt buộc)"
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />
      <input
        value={demoUrl}
        onChange={(e) => setDemoUrl(e.target.value)}
        placeholder="Link demo (không bắt buộc)"
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tech stack, phân cách bằng dấu phẩy"
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />

      {error && <ErrorState message={error} />}

      <button
        type="submit"
        disabled={submitting}
        className="self-end rounded-full bg-accent-500 px-5 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
      >
        {submitting ? "Đang đăng..." : "Đăng project"}
      </button>
    </form>
  );
}
