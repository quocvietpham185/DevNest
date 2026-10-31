import { supabase } from "./supabaseClient";
import { deleteContent, type ContentKind } from "./content";

export { deleteContent };

export interface AccountStatus {
  isAdmin: boolean;
  isBanned: boolean;
  bannedReason: string | null;
}

export async function fetchAccountStatus(userId: string): Promise<AccountStatus> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, is_banned, banned_reason")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return {
    isAdmin: data?.role === "admin",
    isBanned: data?.is_banned ?? false,
    bannedReason: data?.banned_reason ?? null,
  };
}

export interface AdminStats {
  users: number;
  openReports: number;
  byKind: Record<ContentKind, number>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function count(table: string, filter?: (q: any) => any) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) query = filter(query);
  const { count: total, error } = await query;
  if (error) throw error;
  return total ?? 0;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const kinds: ContentKind[] = ["post", "project", "question", "repo"];
  const [users, openReports, ...kindCounts] = await Promise.all([
    count("profiles"),
    count("reports", (q) => q.eq("status", "open")),
    ...kinds.map((kind) => count("content_items", (q) => q.eq("kind", kind))),
  ]);
  return {
    users,
    openReports,
    byKind: Object.fromEntries(kinds.map((kind, i) => [kind, kindCounts[i]])) as Record<ContentKind, number>,
  };
}

export type ReportStatus = "open" | "resolved" | "dismissed";

export interface ReportRow {
  id: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  reporter: string | null;
  content: { id: string; kind: ContentKind; title: string; author: string | null } | null;
}

export async function fetchReports(status: ReportStatus | "all" = "open"): Promise<ReportRow[]> {
  let query = supabase
    .from("reports")
    .select(
      "id, reason, status, created_at, reporter:profiles!reporter_id ( username ), content_items ( id, kind, title, profiles ( username ) )",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({
    id: r.id,
    reason: r.reason,
    status: r.status,
    createdAt: r.created_at,
    reporter: r.reporter?.username ?? null,
    content: r.content_items
      ? {
          id: r.content_items.id,
          kind: r.content_items.kind,
          title: r.content_items.title,
          author: r.content_items.profiles?.username ?? null,
        }
      : null,
  }));
}

export async function setReportStatus(id: string, status: ReportStatus) {
  const { error } = await supabase.from("reports").update({ status }).eq("id", id);
  if (error) throw error;
}

export interface AdminUser {
  id: string;
  username: string;
  role: "user" | "admin";
  isBanned: boolean;
  bannedReason: string | null;
  createdAt: string;
}

export async function fetchUsers(search = ""): Promise<AdminUser[]> {
  let query = supabase
    .from("profiles")
    .select("id, username, role, is_banned, banned_reason, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (search.trim()) query = query.ilike("username", `%${search.trim()}%`);

  const { data, error } = await query;
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((u: any) => ({
    id: u.id,
    username: u.username,
    role: u.role,
    isBanned: u.is_banned,
    bannedReason: u.banned_reason,
    createdAt: u.created_at,
  }));
}

export async function setUserRole(userId: string, role: "user" | "admin") {
  const { error } = await supabase.rpc("set_user_role", { target_user: userId, new_role: role });
  if (error) throw error;
}

export async function setUserBanned(userId: string, banned: boolean, reason?: string) {
  const { error } = await supabase.rpc("set_user_banned", {
    target_user: userId,
    banned,
    reason: reason ?? null,
  });
  if (error) throw error;
}

export async function reportContent(contentId: string, reporterId: string, reason: string) {
  const { error } = await supabase.from("reports").insert({ content_id: contentId, reporter_id: reporterId, reason });
  if (error) {
    if (error.code === "23505") throw new Error("Bạn đã báo cáo nội dung này rồi.");
    throw error;
  }
}
