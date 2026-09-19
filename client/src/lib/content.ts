import { supabase } from "./supabaseClient";

export type ContentKind = "post" | "project" | "repo" | "question";

export interface Author {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface FeedItem {
  id: string;
  kind: ContentKind;
  title: string;
  createdAt: string;
  author: Author | null;
  tags: string[];
  excerpt: string | null;
  status: string | null;
  stars: number | null;
  language: string | null;
  githubUrl: string | null;
  repoOwner: string | null;
  repoName: string | null;
  demoUrl: string | null;
  bodyMarkdown: string | null;
}

const FEED_SELECT = `
  id, kind, title, created_at,
  profiles ( id, username, avatar_url ),
  content_tags ( tags ( name ) ),
  posts ( body_markdown, published ),
  projects ( description, status, repo_url, demo_url ),
  repos ( description, stars, primary_language, github_url, owner, name, note ),
  questions ( body_markdown, status )
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(row: any): FeedItem {
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

export async function fetchFeed(opts: { tag?: string; kind?: ContentKind; limit?: number; offset?: number } = {}) {
  const { tag, kind, limit = 20, offset = 0 } = opts;

  let query = supabase
    .from("content_items")
    .select(FEED_SELECT)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (kind) query = query.eq("kind", kind);
  if (tag) query = query.eq("content_tags.tags.name", tag);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function fetchContentById(id: string): Promise<FeedItem> {
  const { data, error } = await supabase.from("content_items").select(FEED_SELECT).eq("id", id).single();
  if (error) throw error;
  return normalize(data);
}

export async function searchContent(q: string, limit = 20) {
  const { data, error } = await supabase
    .from("content_items")
    .select(FEED_SELECT)
    .ilike("title", `%${q}%`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(normalize);
}

async function attachTags(contentId: string, tagNames: string[]) {
  const names = [...new Set(tagNames.map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 5);
  if (names.length === 0) return;

  for (const name of names) {
    const slug = name.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { data: tag, error: upsertError } = await supabase
      .from("tags")
      .upsert({ name, slug }, { onConflict: "name" })
      .select("id")
      .single();
    if (upsertError) throw upsertError;

    const { error: linkError } = await supabase
      .from("content_tags")
      .insert({ content_id: contentId, tag_id: tag.id });
    if (linkError) throw linkError;
  }
}

async function createContentItem(authorId: string, kind: ContentKind, title: string) {
  const { data, error } = await supabase
    .from("content_items")
    .insert({ author_id: authorId, kind, title })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function createPost(input: {
  authorId: string;
  title: string;
  bodyMarkdown: string;
  tags: string[];
  published: boolean;
}) {
  const id = await createContentItem(input.authorId, "post", input.title);
  const { error } = await supabase
    .from("posts")
    .insert({
      id,
      body_markdown: input.bodyMarkdown,
      published: input.published,
      published_at: input.published ? new Date().toISOString() : null,
    });
  if (error) throw error;
  await attachTags(id, input.tags);
  return id;
}

export async function createProject(input: {
  authorId: string;
  title: string;
  description: string;
  status: "in_progress" | "completed" | "looking_for_collaborators";
  repoUrl?: string;
  demoUrl?: string;
  tags: string[];
}) {
  const id = await createContentItem(input.authorId, "project", input.title);
  const { error } = await supabase.from("projects").insert({
    id,
    description: input.description,
    status: input.status,
    repo_url: input.repoUrl || null,
    demo_url: input.demoUrl || null,
  });
  if (error) throw error;
  await attachTags(id, input.tags);
  return id;
}

export async function createQuestion(input: { authorId: string; title: string; bodyMarkdown: string; tags: string[] }) {
  const id = await createContentItem(input.authorId, "question", input.title);
  const { error } = await supabase.from("questions").insert({ id, body_markdown: input.bodyMarkdown });
  if (error) throw error;
  await attachTags(id, input.tags);
  return id;
}

export async function createRepo(input: {
  authorId: string;
  title: string;
  githubUrl: string;
  owner: string;
  name: string;
  description?: string;
  stars?: number;
  primaryLanguage?: string;
  note: string;
}) {
  const id = await createContentItem(input.authorId, "repo", input.title);
  const { error } = await supabase.from("repos").insert({
    id,
    github_url: input.githubUrl,
    owner: input.owner,
    name: input.name,
    description: input.description || null,
    stars: input.stars ?? 0,
    primary_language: input.primaryLanguage || null,
    note: input.note,
  });
  if (error) throw error;
  return id;
}

export interface CommentRow {
  id: string;
  body: string;
  createdAt: string;
  isAcceptedAnswer: boolean;
  author: Author | null;
}

export async function fetchComments(contentId: string): Promise<CommentRow[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("id, body, created_at, is_accepted_answer, profiles ( id, username, avatar_url )")
    .eq("content_id", contentId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((c: any) => ({
    id: c.id,
    body: c.body,
    createdAt: c.created_at,
    isAcceptedAnswer: c.is_accepted_answer,
    author: c.profiles ? { id: c.profiles.id, username: c.profiles.username, avatarUrl: c.profiles.avatar_url } : null,
  }));
}

export async function addComment(contentId: string, authorId: string, body: string) {
  const { error } = await supabase.from("comments").insert({ content_id: contentId, author_id: authorId, body });
  if (error) throw error;
}

export async function markAcceptedAnswer(questionId: string, commentId: string) {
  const { error: resetError } = await supabase
    .from("comments")
    .update({ is_accepted_answer: false })
    .eq("content_id", questionId);
  if (resetError) throw resetError;

  const { error: acceptError } = await supabase
    .from("comments")
    .update({ is_accepted_answer: true })
    .eq("id", commentId);
  if (acceptError) throw acceptError;

  const { error: statusError } = await supabase
    .from("questions")
    .update({ status: "resolved", accepted_comment_id: commentId })
    .eq("id", questionId);
  if (statusError) throw statusError;
}

export async function fetchLikeCount(contentId: string) {
  const { count, error } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("content_id", contentId);
  if (error) throw error;
  return count ?? 0;
}

export async function hasLiked(contentId: string, userId: string) {
  const { data, error } = await supabase
    .from("likes")
    .select("user_id")
    .eq("content_id", contentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function toggleLike(contentId: string, userId: string, liked: boolean) {
  if (liked) {
    const { error } = await supabase.from("likes").delete().eq("content_id", contentId).eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("likes").insert({ content_id: contentId, user_id: userId });
    if (error) throw error;
  }
}
