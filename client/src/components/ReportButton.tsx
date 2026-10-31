import { useState } from "react";
import { reportContent } from "../lib/admin";
import { useSession } from "../hooks/useSession";

export function ReportButton({ contentId, authorId }: { contentId: string; authorId?: string | null }) {
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!session || session.user.id === authorId) return null;

  async function handleSubmit() {
    if (!session) return;
    setBusy(true);
    setMessage(null);
    try {
      await reportContent(contentId, session.user.id, reason.trim());
      setMessage({ ok: true, text: "Đã gửi báo cáo, cảm ơn bạn." });
      setReason("");
      setOpen(false);
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Không gửi được báo cáo" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative ml-auto">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        Báo cáo
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 flex w-72 flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Nội dung này vi phạm điều gì? (spam, sai sự thật, xúc phạm...)"
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <button
            onClick={handleSubmit}
            disabled={busy || reason.trim().length < 3}
            className="self-end rounded-full bg-accent-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
          >
            {busy ? "Đang gửi..." : "Gửi báo cáo"}
          </button>
        </div>
      )}
      {message && (
        <p className={`absolute right-0 mt-1 whitespace-nowrap text-xs ${message.ok ? "text-accent-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
