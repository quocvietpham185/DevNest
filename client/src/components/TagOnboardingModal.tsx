import { useEffect, useState } from "react";
import { useSession } from "../hooks/useSession";
import { fetchUserFollowedTags, saveUserFollowedTags } from "../lib/social";

const POPULAR_TAGS = [
  "react",
  "typescript",
  "javascript",
  "nodejs",
  "python",
  "nextjs",
  "tailwindcss",
  "go",
  "rust",
  "docker",
  "ai",
  "postgresql",
  "devops",
  "system-design",
  "mobile",
  "web3",
];

export function TagOnboardingModal() {
  const { session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if onboarding needs to be shown for user
  useEffect(() => {
    if (!session) {
      setIsOpen(false);
      return;
    }

    const userId = session.user.id;
    const onboardedKey = `devnest_onboarded_${userId}`;
    const alreadyOnboarded = localStorage.getItem(onboardedKey);

    if (!alreadyOnboarded) {
      // Check if user already has followed tags
      fetchUserFollowedTags(userId)
        .then((tags) => {
          if (tags.length === 0) {
            setIsOpen(true);
          } else {
            localStorage.setItem(onboardedKey, "true");
          }
        })
        .catch(() => {
          // If check fails, don't block user
        });
    }

    const handleOpen = () => {
      fetchUserFollowedTags(userId)
        .then((tags) => {
          setSelectedTags(tags);
          setIsOpen(true);
        })
        .catch(() => setIsOpen(true));
    };

    window.addEventListener("devnest:open-onboarding", handleOpen);
    return () => window.removeEventListener("devnest:open-onboarding", handleOpen);
  }, [session]);

  if (!isOpen || !session) return null;

  function toggleTag(tag: string) {
    const cleanTag = tag.toLowerCase().trim();
    if (selectedTags.includes(cleanTag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== cleanTag));
    } else {
      if (selectedTags.length >= 5) {
        setError("Bạn chỉ có thể chọn tối đa 5 chủ đề quan tâm.");
        return;
      }
      setError(null);
      setSelectedTags((prev) => [...prev, cleanTag]);
    }
  }

  function handleAddCustomTag(e: React.FormEvent) {
    e.preventDefault();
    const cleanTag = customTag.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "");
    if (!cleanTag) return;
    if (selectedTags.includes(cleanTag)) {
      setCustomTag("");
      return;
    }
    if (selectedTags.length >= 5) {
      setError("Bạn chỉ có thể chọn tối đa 5 chủ đề quan tâm.");
      return;
    }
    setError(null);
    setSelectedTags((prev) => [...prev, cleanTag]);
    setCustomTag("");
  }

  async function handleSave() {
    if (!session) return;
    if (selectedTags.length < 3) {
      setError("Vui lòng chọn tối thiểu 3 chủ đề (tối đa 5) để có trải nghiệm tốt nhất.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await saveUserFollowedTags(session.user.id, selectedTags);
      localStorage.setItem(`devnest_onboarded_${session.user.id}`, "true");
      setIsOpen(false);
      // Optional reload or trigger feed refresh
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được chủ đề");
      setSaving(false);
    }
  }

  function handleDismiss() {
    if (session) {
      localStorage.setItem(`devnest_onboarded_${session.user.id}`, "dismissed");
    }
    setIsOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 dark:bg-accent-950/60 dark:text-accent-300">
              <span>👋 Chào mừng bạn!</span>
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Chọn chủ đề bạn quan tâm
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Chọn 3–5 chủ đề công nghệ yêu thích để DevNest tối ưu hóa bảng tin bài viết &amp; câu hỏi dành riêng cho bạn.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            title="Đóng"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {POPULAR_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-accent-500 text-white shadow-sm ring-2 ring-accent-400 ring-offset-1 dark:ring-offset-zinc-900"
                    : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>

        {/* Custom tag input */}
        <form onSubmit={handleAddCustomTag} className="mt-4 flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            placeholder="Thêm tag khác (vd: flutter, vuejs)..."
            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-xs outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            + Thêm
          </button>
        </form>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span
            className={
              selectedTags.length >= 3 && selectedTags.length <= 5
                ? "font-medium text-accent-600 dark:text-accent-400"
                : "text-zinc-500 dark:text-zinc-400"
            }
          >
            Đã chọn: <span className="font-semibold">{selectedTags.length}</span> / 5 (tối thiểu 3)
          </span>
          {error && <span className="text-red-500 dark:text-red-400">{error}</span>}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Để sau
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || selectedTags.length < 3}
            className="rounded-full bg-accent-500 px-5 py-2 text-xs font-medium text-white shadow-sm hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Xác nhận & Bắt đầu"}
          </button>
        </div>
      </div>
    </div>
  );
}

