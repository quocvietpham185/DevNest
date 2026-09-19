import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { lookupRepo } from "../lib/api";
import { createRepo } from "../lib/content";
import { useSession } from "../hooks/useSession";
import { ErrorState } from "../components/EmptyState";

export function ShareRepo() {
  const { session } = useSession();
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState("");
  const [owner, setOwner] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stars, setStars] = useState<number | undefined>(undefined);
  const [language, setLanguage] = useState("");
  const [note, setNote] = useState("");
  const [looked, setLooked] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLookup(event: FormEvent) {
    event.preventDefault();
    setLookupLoading(true);
    setLookupError(null);
    try {
      const metadata = await lookupRepo(repoUrl);
      setOwner(metadata.owner);
      setName(metadata.name);
      setDescription(metadata.description ?? "");
      setStars(metadata.stars);
      setLanguage(metadata.primaryLanguage ?? "");
      setLooked(true);
    } catch (err) {
      // Fetch nhẹ chỉ để gợi ý điền sẵn — lỗi/timeout không chặn việc tự nhập tay (PRD mục 5.2).
      setLookupError(err instanceof Error ? err.message : "Không lấy được thông tin, bạn có thể tự nhập bên dưới");
      setLooked(true);
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!session) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const parsedOwner = owner || repoUrl.replace(/^https?:\/\/github\.com\//, "").split("/")[0];
      const parsedName = name || repoUrl.replace(/^https?:\/\/github\.com\//, "").split("/")[1];
      const id = await createRepo({
        authorId: session.user.id,
        title: `${parsedOwner}/${parsedName}`,
        githubUrl: repoUrl.startsWith("http") ? repoUrl : `https://github.com/${repoUrl}`,
        owner: parsedOwner,
        name: parsedName,
        description,
        stars,
        primaryLanguage: language,
        note,
      });
      navigate(`/repos/${id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Không chia sẻ được repo");
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) return <ErrorState message="Bạn cần đăng nhập để chia sẻ repo." />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Share một repo</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Dán link GitHub repo — có thể gợi ý điền sẵn thông tin, nhưng bạn luôn tự viết ghi chú của mình.
        </p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-2">
        <input
          type="text"
          required
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="owner/name hoặc https://github.com/owner/name"
          className="flex-1 rounded-full border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={lookupLoading}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          {lookupLoading ? "Đang tìm..." : "Gợi ý điền sẵn"}
        </button>
      </form>

      {lookupError && <ErrorState message={lookupError} />}

      {looked && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <div className="flex gap-3">
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="owner"
              className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="repo name"
              className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn"
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <div className="flex gap-3">
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="Ngôn ngữ chính"
              className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
            <input
              type="number"
              value={stars ?? ""}
              onChange={(e) => setStars(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Stars"
              className="w-28 rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Vì sao repo này đáng chú ý?"
            rows={3}
            required
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <p className="text-xs text-zinc-400">Dữ liệu ở trên là tại thời điểm chia sẻ, không tự cập nhật sau này.</p>

          {submitError && <ErrorState message={submitError} />}

          <button
            type="submit"
            disabled={submitting}
            className="self-end rounded-full bg-accent-500 px-5 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
          >
            {submitting ? "Đang chia sẻ..." : "Chia sẻ repo"}
          </button>
        </form>
      )}
    </div>
  );
}
