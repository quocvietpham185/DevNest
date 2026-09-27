import { supabase } from "./supabaseClient";
import type { FeedItem } from "./content";

// -- Bookmarks ---------------------------------------------------------

export async function isBookmarked(contentId: string, userId: string) {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("user_id")
    .eq("content_id", contentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function toggleBookmark(contentId: string, userId: string, bookmarked: boolean) {
  if (bookmarked) {
    const { error } = await supabase.from("bookmarks").delete().eq("content_id", contentId).eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("bookmarks").insert({ content_id: contentId, user_id: userId });
    if (error) throw error;
  }
}

const FEED_SELECT_FOR_BOOKMARKS = `
  content_items (
    id, kind, title, created_at,
    profiles ( id, username, avatar_url ),
    content_tags ( tags ( name ) ),
    posts ( body_markdown, published ),
    projects ( description, status, repo_url, demo_url ),
    repos ( description, stars, primary_language, github_url, owner, name, note ),
    questions ( body_markdown, status )
  )
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeContentItem(row: any): FeedItem {
  const post = row.posts ?? null;
  const project = row.projects ?? null;
  const repo = row.repos ?? null;
  const question = row.questions ?? null;
  const bodyMarkdown = post?.body_markdown ?? project?.description ?? repo?.note ?? question?.body_markdown ?? null;

  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    createdAt: row.created_at,
    author: row.profiles
      ? { id: row.profiles.id, username: row.profiles.username, avatarUrl: row.profiles.avatar_url }
      : null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tags: (row.content_tags ?? []).map((ct: any) => ct.tags?.name).filter(Boolean),
    excerpt: bodyMarkdown ? bodyMarkdown.slice(0, 220) : repo?.description ?? null,
    status: project?.status ?? question?.status ?? null,
    stars: repo?.stars ?? null,
    language: repo?.primary_language ?? null,
    githubUrl: repo?.github_url ?? project?.repo_url ?? null,
    repoOwner: repo?.owner ?? null,
    repoName: repo?.name ?? null,
    demoUrl: project?.demo_url ?? null,
    bodyMarkdown,
  };
}

export async function fetchBookmarkedItems(userId: string): Promise<FeedItem[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select(FEED_SELECT_FOR_BOOKMARKS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => normalizeContentItem(row.content_items)).filter((item) => item.id);
}

// -- Follow user ---------------------------------------------------------

export async function isFollowingUser(followerId: string, followeeId: string) {
  const { data, error } = await supabase
    .from("user_follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("followee_id", followeeId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function toggleFollowUser(followerId: string, followeeId: string, following: boolean) {
  if (following) {
    const { error } = await supabase
      .from("user_follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("followee_id", followeeId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("user_follows").insert({ follower_id: followerId, followee_id: followeeId });
    if (error) throw error;
  }
}

export async function fetchFollowerCount(userId: string) {
  const { count, error } = await supabase
    .from("user_follows")
    .select("*", { count: "exact", head: true })
    .eq("followee_id", userId);
  if (error) throw error;
  return count ?? 0;
}

// -- Follow tag ------------------------------------------------------------

async function findTagId(tagName: string) {
  const { data, error } = await supabase.from("tags").select("id").eq("name", tagName.toLowerCase()).maybeSingle();
  if (error) throw error;
  return data?.id as string | undefined;
}

export async function isFollowingTag(tagName: string, userId: string) {
  const tagId = await findTagId(tagName);
  if (!tagId) return false;
  const { data, error } = await supabase
    .from("tag_follows")
    .select("user_id")
    .eq("tag_id", tagId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function toggleFollowTag(tagName: string, userId: string, following: boolean) {
  const tagId = await findTagId(tagName);
  if (!tagId) throw new Error(`Không tìm thấy tag "${tagName}"`);
  if (following) {
    const { error } = await supabase.from("tag_follows").delete().eq("tag_id", tagId).eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("tag_follows").insert({ tag_id: tagId, user_id: userId });
    if (error) throw error;
  }
}
