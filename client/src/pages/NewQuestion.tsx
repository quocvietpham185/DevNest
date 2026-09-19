import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createQuestion } from "../lib/content";
import { useSession } from "../hooks/useSession";
import { ErrorState } from "../components/EmptyState";

export function NewQuestion() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setSubmitting(true);
    setError(null);
    try {
      const id = await createQuestion({
        authorId: session.user.id,
        title,
        bodyMarkdown: body,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      navigate(`/questions/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không đăng được câu hỏi");
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) return <ErrorState message="Bạn cần đăng nhập để đặt câu hỏi." />;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Đặt câu hỏi</h1>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Câu hỏi của bạn là gì? (viết ngắn gọn, cụ thể)"
        required
        className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Mô tả chi tiết vấn đề, những gì bạn đã thử (hỗ trợ Markdown)"
        rows={10}
        required
        className="rounded-2xl border border-zinc-300 p-4 font-mono text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tag, phân cách bằng dấu phẩy"
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />

      {error && <ErrorState message={error} />}

      <button
        type="submit"
        disabled={submitting}
        className="self-end rounded-full bg-accent-500 px-5 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
      >
        {submitting ? "Đang đăng..." : "Đăng câu hỏi"}
      </button>
    </form>
  );
}
