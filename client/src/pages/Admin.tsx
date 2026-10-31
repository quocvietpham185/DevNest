import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteContent,
  fetchAdminStats,
  fetchReports,
  fetchUsers,
  setReportStatus,
  setUserRole,
  type AdminStats,
  type AdminUser,
  type ReportRow,
  type ReportStatus,
} from "../lib/admin";
import { fetchFeed, type ContentKind, type FeedItem } from "../lib/content";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useSession } from "../hooks/useSession";
import { EmptyState, ErrorState } from "../components/EmptyState";

type Tab = "overview" | "reports" | "content" | "users";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Tổng quan" },
  { id: "reports", label: "Báo cáo" },
  { id: "content", label: "Nội dung" },
  { id: "users", label: "Người dùng" },
];

const KIND_LABEL: Record<ContentKind, string> = { post: "Blog", project: "Project", repo: "Repo", question: "Q&A" };
const KIND_PATH: Record<ContentKind, string> = {
  post: "blog",
  project: "projects",
  repo: "repos",
  question: "questions",
};

const dateFmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

const rowClass =
  "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950";
const smallBtn =
  "rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900";
const dangerBtn = "rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50";

function useAsync<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    load()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được dữ liệu"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}

function Overview() {
  const { data, error, loading } = useAsync<AdminStats>(fetchAdminStats, []);
  if (loading) return <p className="text-sm text-zinc-500">Đang tải...</p>;
  if (error || !data) return <ErrorState message={error ?? "Không có dữ liệu"} />;

  const tiles = [
    { label: "Báo cáo chờ xử lý", value: data.openReports, alert: data.openReports > 0 },
    { label: "Người dùng", value: data.users },
    { label: "Bài viết", value: data.byKind.post },
    { label: "Project", value: data.byKind.project },
    { label: "Câu hỏi", value: data.byKind.question },
    { label: "Repo", value: data.byKind.repo },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {tiles.map((t) => (
        <div
          key={t.label}
          className={`rounded-2xl border p-4 ${
            t.alert
              ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
              : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          }`}
        >
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.label}</p>
          <p
            className={`mt-1 text-2xl font-semibold tabular-nums ${
              t.alert ? "text-red-700 dark:text-red-300" : "text-zinc-950 dark:text-zinc-50"
            }`}
          >
            {t.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function Reports() {
  const [status, setStatus] = useState<ReportStatus | "all">("open");
  const { data, error, loading, reload } = useAsync<ReportRow[]>(() => fetchReports(status), [status]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function run(id: string, action: () => Promise<void>) {
    setBusyId(id);
    setActionError(null);
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Thao tác thất bại");
    } finally {
      setBusyId(null);
    }
  }

  function removeContent(report: ReportRow) {
    if (!report.content) return;
    if (!window.confirm(`Xóa "${report.content.title}"? Hành động này không thể hoàn tác.`)) return;
    run(report.id, () => deleteContent(report.content!.id));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {(["open", "resolved", "dismissed", "all"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              status === s ? "bg-accent-500 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {{ open: "Chờ xử lý", resolved: "Đã xử lý", dismissed: "Đã bỏ qua", all: "Tất cả" }[s]}
          </button>
        ))}
      </div>

      {actionError && <ErrorState message={actionError} />}
      {loading ? (
        <p className="text-sm text-zinc-500">Đang tải...</p>
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="Không có báo cáo nào" />
      ) : (
        <ul className="flex flex-col gap-3">
          {data.map((r) => (
            <li key={r.id} className={`${rowClass} flex-col items-stretch`}>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                {r.content && (
                  <span className="font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-400">
                    {KIND_LABEL[r.content.kind]}
                  </span>
                )}
                <span>@{r.reporter ?? "ẩn danh"} báo cáo</span>
                <span>· {dateFmt.format(new Date(r.createdAt))}</span>
                {r.status !== "open" && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                    {r.status === "resolved" ? "Đã xử lý" : "Đã bỏ qua"}
                  </span>
                )}
              </div>
              {r.content && (
                <Link
                  to={`/${KIND_PATH[r.content.kind]}/${r.content.id}`}
                  className="text-sm font-medium text-zinc-950 hover:underline dark:text-zinc-50"
                >
                  {r.content.title}
                  {r.content.author && <span className="font-normal text-zinc-500"> · @{r.content.author}</span>}
                </Link>
              )}
              <p className="whitespace-pre-wrap rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {r.reason}
              </p>
              {r.status === "open" && (
                <div className="flex flex-wrap gap-2">
                  <button disabled={busyId === r.id} onClick={() => removeContent(r)} className={dangerBtn}>
                    Xóa nội dung
                  </button>
                  <button
                    disabled={busyId === r.id}
                    onClick={() => run(r.id, () => setReportStatus(r.id, "resolved"))}
                    className={smallBtn}
                  >
                    Đánh dấu đã xử lý
                  </button>
                  <button
                    disabled={busyId === r.id}
                    onClick={() => run(r.id, () => setReportStatus(r.id, "dismissed"))}
                    className={smallBtn}
                  >
                    Bỏ qua
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const PAGE_SIZE = 20;

function ContentList() {
  const [kind, setKind] = useState<ContentKind | undefined>(undefined);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadPage = useCallback(
    async (offset: number, replace: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const page = await fetchFeed({ kind, limit: PAGE_SIZE, offset });
        setItems((prev) => (replace ? page : [...prev, ...page]));
        setHasMore(page.length === PAGE_SIZE);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không tải được nội dung");
      } finally {
        setLoading(false);
      }
    },
    [kind],
  );

  useEffect(() => {
    loadPage(0, true);
  }, [loadPage]);

  async function remove(item: FeedItem) {
    if (!window.confirm(`Xóa "${item.title}"? Hành động này không thể hoàn tác.`)) return;
    setBusyId(item.id);
    try {
      await deleteContent(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {[undefined, "post", "project", "question", "repo"].map((k) => (
          <button
            key={k ?? "all"}
            onClick={() => setKind(k as ContentKind | undefined)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              kind === k ? "bg-accent-500 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {k ? KIND_LABEL[k as ContentKind] : "Tất cả"}
          </button>
        ))}
      </div>

      {error && <ErrorState message={error} />}
      {items.length === 0 && !loading && !error ? (
        <EmptyState title="Chưa có nội dung nào" />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className={rowClass}>
              <span className="w-16 text-xs font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-400">
                {KIND_LABEL[item.kind]}
              </span>
              <Link
                to={`/${KIND_PATH[item.kind]}/${item.id}`}
                className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-950 hover:underline dark:text-zinc-50"
              >
                {item.title}
              </Link>
              <span className="text-xs text-zinc-500">@{item.author?.username ?? "ẩn danh"}</span>
              <button disabled={busyId === item.id} onClick={() => remove(item)} className={dangerBtn}>
                Xóa
              </button>
            </li>
          ))}
        </ul>
      )}
      {loading && <p className="text-sm text-zinc-500">Đang tải...</p>}
      {hasMore && !loading && (
        <button onClick={() => loadPage(items.length, false)} className={`${smallBtn} self-center`}>
          Tải thêm
        </button>
      )}
    </div>
  );
}

function Users() {
  const { session } = useSession();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const { data, error, loading, reload } = useAsync<AdminUser[]>(() => fetchUsers(query), [query]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function toggleRole(user: AdminUser) {
    const next = user.role === "admin" ? "user" : "admin";
    const verb = next === "admin" ? "cấp quyền admin cho" : "gỡ quyền admin của";
    if (!window.confirm(`Bạn muốn ${verb} @${user.username}?`)) return;
    setBusyId(user.id);
    setActionError(null);
    try {
      await setUserRole(user.id, next);
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Không đổi được quyền");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(search);
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm username..."
          className="w-full rounded-full border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </form>

      {actionError && <ErrorState message={actionError} />}
      {loading ? (
        <p className="text-sm text-zinc-500">Đang tải...</p>
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="Không tìm thấy người dùng" />
      ) : (
        <ul className="flex flex-col gap-3">
          {data.map((u) => (
            <li key={u.id} className={rowClass}>
              <Link to={`/u/${u.username}`} className="flex-1 text-sm font-medium text-zinc-950 hover:underline dark:text-zinc-50">
                @{u.username}
              </Link>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  u.role === "admin"
                    ? "bg-accent-500 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {u.role === "admin" ? "Admin" : "Thành viên"}
              </span>
              <span className="text-xs text-zinc-500">{dateFmt.format(new Date(u.createdAt))}</span>
              {u.id !== session?.user.id && (
                <button disabled={busyId === u.id} onClick={() => toggleRole(u)} className={smallBtn}>
                  {u.role === "admin" ? "Gỡ admin" : "Cấp admin"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Admin() {
  const { session, loading: sessionLoading } = useSession();
  const { isAdmin, loading } = useIsAdmin();
  const [tab, setTab] = useState<Tab>("overview");

  if (sessionLoading || loading) return <p className="text-sm text-zinc-500">Đang kiểm tra quyền...</p>;
  if (!session) return <ErrorState message="Bạn cần đăng nhập." />;
  if (!isAdmin) return <ErrorState message="Bạn không có quyền truy cập trang quản trị." />;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Quản trị</h1>

      <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === t.id
                ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview />}
      {tab === "reports" && <Reports />}
      {tab === "content" && <ContentList />}
      {tab === "users" && <Users />}
    </div>
  );
}
