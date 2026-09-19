import { useEffect, useState } from "react";
import { addComment, fetchComments, markAcceptedAnswer, type CommentRow } from "../lib/content";
import { useSession } from "../hooks/useSession";

export function CommentSection({
  contentId,
  isQuestion,
  questionAuthorId,
  onAccepted,
}: {
  contentId: string;
  isQuestion?: boolean;
  questionAuthorId?: string | null;
  onAccepted?: () => void;
}) {
  const { session } = useSession();
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setComments(await fetchComments(contentId));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  async function handleSubmit() {
    if (!session || !draft.trim()) return;
    setSubmitting(true);
    try {
      await addComment(contentId, session.user.id, draft.trim());
      setDraft("");
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAccept(commentId: string) {
    await markAcceptedAnswer(contentId, commentId);
    await load();
    onAccepted?.();
  }

  const canAccept = isQuestion && session && questionAuthorId === session.user.id;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {isQuestion ? "Câu trả lời" : "Bình luận"} {!loading && `(${comments.length})`}
      </h2>

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Đang tải...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {isQuestion ? "Chưa có câu trả lời nào." : "Chưa có bình luận nào."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className={`rounded-2xl border p-4 ${
                c.isAcceptedAnswer
                  ? "border-accent-500 bg-accent-50 dark:border-accent-400 dark:bg-accent-700/10"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  @{c.author?.username ?? "ẩn danh"}
                </span>
                {c.isAcceptedAnswer && (
                  <span className="rounded-full bg-accent-500 px-2 py-0.5 text-xs font-medium text-white">
                    ✓ Best answer
                  </span>
                )}
                {canAccept && !c.isAcceptedAnswer && (
                  <button
                    onClick={() => handleAccept(c.id)}
                    className="text-xs font-medium text-accent-600 hover:underline dark:text-accent-400"
                  >
                    Đánh dấu best answer
                  </button>
                )}
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      {session ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={isQuestion ? "Viết câu trả lời..." : "Viết bình luận..."}
            rows={3}
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !draft.trim()}
            className="self-end rounded-full bg-accent-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
          >
            {submitting ? "Đang gửi..." : "Gửi"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Đăng nhập để bình luận.</p>
      )}
    </div>
  );
}
