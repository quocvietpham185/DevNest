import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ErrorState } from "../components/EmptyState";
import { ImageUploadButton } from "../components/ImageUploadButton";
import { CodeBlock } from "../components/CodeBlock";
import { useSession } from "../hooks/useSession";
import {
  deleteContent,
  fetchContentById,
  updatePost,
  updateProject,
  updateQuestion,
  updateRepo,
  type ContentKind,
  type FeedItem,
} from "../lib/content";

const STATUS_OPTIONS = [
  { value: "in_progress", label: "Đang phát triển" },
  { value: "completed", label: "Hoàn thành" },
  { value: "looking_for_collaborators", label: "Tìm cộng tác viên" },
] as const;

const KIND_LABELS: Record<ContentKind, string> = {
  post: "bài viết",
  project: "project",
  question: "câu hỏi",
  repo: "repo",
};

export function EditContent() {
  const { kind, id } = useParams<{ kind: ContentKind; id: string }>();
  const { session, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [item, setItem] = useState<FeedItem | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]["value"]>("in_progress");
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [owner, setOwner] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stars, setStars] = useState<number | undefined>();
  const [language, setLanguage] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchContentById(id)
      .then((loaded) => {
        setItem(loaded);
        setTitle(loaded.title);
        setBody(loaded.bodyMarkdown ?? "");
        setTags(loaded.tags.join(", "));
        setStatus((loaded.status as (typeof STATUS_OPTIONS)[number]["value"]) ?? "in_progress");
        setRepoUrl(loaded.kind === "project" ? loaded.githubUrl ?? "" : "");
        setDemoUrl(loaded.demoUrl ?? "");
        setOwner(loaded.repoOwner ?? "");
        setName(loaded.repoName ?? "");
        setDescription(loaded.excerpt ?? "");
        setStars(loaded.stars ?? undefined);
        setLanguage(loaded.language ?? "");
        setNote(loaded.kind === "repo" ? loaded.bodyMarkdown ?? "" : "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được nội dung"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!id || !kind) return;
    setSubmitting(true);
    setError(null);
    try {
      const parsedTags = tags.split(",").map((tag) => tag.trim()).filter(Boolean);
      if (kind === "post") {
        await updatePost(id, { title, bodyMarkdown: body, tags: parsedTags, published: item?.published ?? true });
      } else if (kind === "project") {
        await updateProject(id, { title, description, status, repoUrl, demoUrl, tags: parsedTags });
      } else if (kind === "question") {
        await updateQuestion(id, { title, bodyMarkdown: body, tags: parsedTags });
      } else {
        await updateRepo(id, { title, githubUrl: repoUrl, owner, name, description, stars, primaryLanguage: language, note });
      }
      navigate(`/${kind === "post" ? "blog" : `${kind}s`}/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được thay đổi");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!id || !window.confirm(`Bạn có chắc muốn xóa ${KIND_LABELS[kind ?? "post"]} này không?`)) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteContent(id);
      navigate(kind === "question" ? "/questions" : kind === "repo" ? "/repos" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa nội dung");
      setSubmitting(false);
    }
  }

  if (loading || sessionLoading) return <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải...</p>;
  if (error && !item) return <ErrorState message={error} />;
  if (!item || !kind || !session) {
    return <ErrorState message="Bạn cần đăng nhập để chỉnh sửa nội dung này." />;
  }
  if (item.kind !== kind) {
    return <ErrorState message="Loại nội dung không khớp với đường dẫn chỉnh sửa." />;
  }
  if (item.authorId !== session.user.id) {
    return <ErrorState message="Bạn không có quyền chỉnh sửa nội dung này." />;
  }

  const isMarkdown = kind === "post" || kind === "question";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Chỉnh sửa {KIND_LABELS[kind]}</h1>
        <button type="button" onClick={handleDelete} disabled={submitting} className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50">
          Xóa
        </button>
      </div>

      <input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Tiêu đề" className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />

      {isMarkdown ? (
        <>
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Chỉnh sửa nội dung Markdown
            </span>
            <ImageUploadButton
              userId={session.user.id}
              onInserted={(tag) => setBody((prev) => prev + tag)}
              disabled={submitting}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              required
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
        </>
      ) : kind === "project" ? (
        <>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} required rows={5} placeholder="Mô tả" className="rounded-2xl border border-zinc-300 p-4 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => <button type="button" key={option.value} onClick={() => setStatus(option.value)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${status === option.value ? "bg-accent-500 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}>{option.label}</button>)}
          </div>
          <input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="Link repo" className="rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />
          <input value={demoUrl} onChange={(event) => setDemoUrl(event.target.value)} placeholder="Link demo" className="rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />
        </>
      ) : (
        <>
          <div className="flex gap-3">
            <input value={owner} onChange={(event) => setOwner(event.target.value)} required placeholder="owner" className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />
            <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="repo name" className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />
          </div>
          <input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} required placeholder="GitHub URL" className="rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Mô tả" className="rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />
          <div className="flex gap-3">
            <input value={language} onChange={(event) => setLanguage(event.target.value)} placeholder="Ngôn ngữ" className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />
            <input type="number" value={stars ?? ""} onChange={(event) => setStars(event.target.value ? Number(event.target.value) : undefined)} placeholder="Stars" className="w-28 rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />
          </div>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} required rows={4} placeholder="Vì sao repo này đáng chú ý?" className="rounded-2xl border border-zinc-300 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />
        </>
      )}

      {(isMarkdown || kind === "project") && <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tag, phân cách bằng dấu phẩy" className="rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50" />}
      {error && <ErrorState message={error} />}
      <button type="submit" disabled={submitting} className="self-end rounded-full bg-accent-500 px-5 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50">{submitting ? "Đang lưu..." : "Lưu thay đổi"}</button>
    </form>
  );
}