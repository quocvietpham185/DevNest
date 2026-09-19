import { Link } from "react-router-dom";
import type { FeedItem } from "../lib/content";
import { TagPill } from "./TagPill";

const KIND_LABEL: Record<FeedItem["kind"], string> = {
  post: "Blog",
  project: "Project",
  repo: "Repo",
  question: "Q&A",
};

const KIND_PATH: Record<FeedItem["kind"], string> = {
  post: "blog",
  project: "projects",
  repo: "repos",
  question: "questions",
};

const PROJECT_STATUS_LABEL: Record<string, string> = {
  in_progress: "Đang phát triển",
  completed: "Hoàn thành",
  looking_for_collaborators: "Tìm cộng tác viên",
};

const QUESTION_STATUS_LABEL: Record<string, string> = {
  open: "Chưa giải quyết",
  resolved: "Đã giải quyết",
};

export function ContentCard({ item }: { item: FeedItem }) {
  const href = `/${KIND_PATH[item.kind]}/${item.id}`;
  const statusLabel =
    item.kind === "project" ? PROJECT_STATUS_LABEL[item.status ?? ""] : item.kind === "question" ? QUESTION_STATUS_LABEL[item.status ?? ""] : null;

  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-400">
          {KIND_LABEL[item.kind]}
        </span>
        {statusLabel && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {statusLabel}
          </span>
        )}
        {item.kind === "repo" && item.language && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {item.language}
          </span>
        )}
        {item.kind === "repo" && typeof item.stars === "number" && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">★ {item.stars}</span>
        )}
      </div>

      <Link to={href} className="mt-1.5 block text-base font-medium text-zinc-950 hover:underline dark:text-zinc-50">
        {item.kind === "repo" && item.repoOwner ? `${item.repoOwner}/${item.repoName}` : item.title}
      </Link>

      {item.excerpt && (
        <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{item.excerpt}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {item.author && <span className="text-sm text-zinc-500 dark:text-zinc-400">@{item.author.username}</span>}
        {item.tags.map((tag) => (
          <TagPill key={tag} tag={tag} />
        ))}
      </div>
    </li>
  );
}
