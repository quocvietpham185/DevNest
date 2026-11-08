import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createPost } from "../lib/content";
import { useSession } from "../hooks/useSession";
import { ErrorState } from "../components/EmptyState";
import { ImageUploadButton } from "../components/ImageUploadButton";
import { CodeBlock } from "../components/CodeBlock";

export function NewPost() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent, publish: boolean) {
    e.preventDefault();
    if (!session) return;
    setSubmitting(true);
    setError(null);
    try {
      const id = await createPost({
        authorId: session.user.id,
        title,
        bodyMarkdown: body,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        published: publish,
      });
      navigate(`/blog/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không đăng được bài viết");
    } finally {
      setSubmitting(false);
    }
  }

  function handleInsertImage(markdownTag: string) {
    setBody((prev) => prev + markdownTag);
  }

  if (!session) return <ErrorState message="Bạn cần đăng nhập để viết bài." />;

  return (
    <form className="flex flex-col gap-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tiêu đề bài viết"
        className="rounded-xl border-none bg-transparent px-0 text-2xl font-semibold text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
      />
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tag, phân cách bằng dấu phẩy (tối đa 5)"
        className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />

      <div className="flex items-center justify-between border-b border-zinc-200 pb-2 pt-1 dark:border-zinc-800">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Soạn thảo Markdown song song với xem trước
        </span>
        <ImageUploadButton
          userId={session.user.id}
          onInserted={handleInsertImage}
          disabled={submitting}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Viết nội dung bằng Markdown (hoặc dán/tải ảnh lên)..."
          rows={16}
          className="rounded-2xl border border-zinc-300 p-4 font-mono text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
        <div className="markdown-body rounded-2xl border border-zinc-200 p-4 text-sm dark:border-zinc-800 dark:text-zinc-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: CodeBlock,
              pre: ({ children }) => <>{children}</>,
            }}
          >
            {body || "*Xem trước sẽ hiện ở đây*"}
          </ReactMarkdown>
        </div>
      </div>

      {error && <ErrorState message={error} />}

      <div className="flex justify-end gap-2">
        <button
          onClick={(e) => handleSubmit(e, false)}
          disabled={submitting || !title.trim()}
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Lưu nháp
        </button>
        <button
          onClick={(e) => handleSubmit(e, true)}
          disabled={submitting || !title.trim() || !body.trim()}
          className="rounded-full bg-accent-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
        >
          {submitting ? "Đang đăng..." : "Xuất bản"}
        </button>
      </div>
    </form>
  );
}
