import { Octokit } from "octokit";
import { githubQueue } from "./rateLimitQueue.js";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });

export interface RepoMetadata {
  owner: string;
  name: string;
  githubUrl: string;
  description: string | null;
  stars: number;
  primaryLanguage: string | null;
  readmeExcerpt: string | null;
}

export interface FullReadme {
  content: string;
  name: string;
  size: number;
}

export interface GitHubUserProfile {
  username: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  publicRepos: number;
  followers: number;
  following: number;
}

export interface PinnedRepo {
  name: string;
  owner: string;
  description: string | null;
  stars: number;
  language: string | null;
  url: string;
}

export interface GitHubActivityEvent {
  id: string;
  type: string;
  repo: string;
  createdAt: string;
  summary: string;
}

function parseOwnerAndName(ownerAndName: string): [string, string] {
  const parts = ownerAndName
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\/$/, "")
    .split("/");

  if (!parts[0] || !parts[1]) {
    throw new Error(`Not a valid GitHub repo reference: "${ownerAndName}"`);
  }
  return [parts[0], parts[1]];
}

/**
 * Fetch the metadata DevNest caches in `public.repos` for a shared repo.
 */
export async function fetchRepoMetadata(ownerAndName: string): Promise<RepoMetadata> {
  const [owner, name] = parseOwnerAndName(ownerAndName);
  const cacheKey = `repo:${owner}/${name}:metadata`;

  return githubQueue.execute(cacheKey, async () => {
    const { data: repo } = await octokit.rest.repos.get({ owner, repo: name });

    let readmeExcerpt: string | null = null;
    try {
      const { data: readme } = await octokit.rest.repos.getReadme({ owner, repo: name });
      const decoded = Buffer.from(readme.content, "base64").toString("utf-8");
      readmeExcerpt = decoded.slice(0, 500);
    } catch {
      // Repo has no README — skip
    }

    return {
      owner: repo.owner.login,
      name: repo.name,
      githubUrl: repo.html_url,
      description: repo.description,
      stars: repo.stargazers_count,
      primaryLanguage: repo.language,
      readmeExcerpt,
    };
  });
}

/**
 * Phase 2: Fetch full README content from GitHub.
 */
export async function fetchRepoReadme(ownerAndName: string): Promise<FullReadme> {
  const [owner, name] = parseOwnerAndName(ownerAndName);
  const cacheKey = `repo:${owner}/${name}:readme`;

  return githubQueue.execute(
    cacheKey,
    async () => {
      const { data: readme } = await octokit.rest.repos.getReadme({ owner, repo: name });
      const decoded = Buffer.from(readme.content, "base64").toString("utf-8");
      return {
        content: decoded,
        name: readme.name,
        size: readme.size,
      };
    },
    15 * 60 * 1000 // Cache README for 15 minutes
  );
}

/**
 * Phase 2: Auto-sync GitHub Profile
 */
export async function fetchUserProfile(username: string): Promise<GitHubUserProfile> {
  const cleanUser = username.trim().replace(/^@/, "");
  const cacheKey = `user:${cleanUser}:profile`;

  return githubQueue.execute(cacheKey, async () => {
    const { data: u } = await octokit.rest.users.getByUsername({ username: cleanUser });
    return {
      username: u.login,
      name: u.name,
      avatarUrl: u.avatar_url,
      bio: u.bio,
      company: u.company,
      location: u.location,
      publicRepos: u.public_repos,
      followers: u.followers,
      following: u.following,
    };
  });
}

/**
 * Phase 2: Fetch user's top / pinned repositories.
 */
export async function fetchUserPinnedRepos(username: string): Promise<PinnedRepo[]> {
  const cleanUser = username.trim().replace(/^@/, "");
  const cacheKey = `user:${cleanUser}:pinned`;

  return githubQueue.execute(cacheKey, async () => {
    const { data: repos } = await octokit.rest.repos.listForUser({
      username: cleanUser,
      sort: "pushed",
      per_page: 6,
    });

    return repos.map((r) => ({
      name: r.name,
      owner: r.owner.login,
      description: r.description,
      stars: r.stargazers_count ?? 0,
      language: r.language ?? null,
      url: r.html_url,
    }));
  });
}

/**
 * Phase 2: Fetch user public activity stream.
 */
export async function fetchUserActivity(username: string): Promise<GitHubActivityEvent[]> {
  const cleanUser = username.trim().replace(/^@/, "");
  const cacheKey = `user:${cleanUser}:activity`;

  return githubQueue.execute(cacheKey, async () => {
    const { data: events } = await octokit.rest.activity.listPublicEventsForUser({
      username: cleanUser,
      per_page: 10,
    });

    return events.map((event) => {
      let summary = event.type ?? "Activity";
      if (event.type === "PushEvent") {
        const commits = (event.payload as { commits?: unknown[] })?.commits?.length ?? 1;
        summary = `Đã đẩy ${commits} commit vào ${event.repo.name}`;
      } else if (event.type === "WatchEvent") {
        summary = `Đã gắn sao (star) ${event.repo.name}`;
      } else if (event.type === "CreateEvent") {
        const refType = (event.payload as { ref_type?: string })?.ref_type ?? "repo";
        summary = `Đã tạo ${refType} tại ${event.repo.name}`;
      } else if (event.type === "ForkEvent") {
        summary = `Đã fork repository ${event.repo.name}`;
      } else if (event.type === "IssuesEvent") {
        summary = `Tương tác với issue trên ${event.repo.name}`;
      }

      return {
        id: event.id,
        type: event.type ?? "Unknown",
        repo: event.repo.name,
        createdAt: event.created_at ?? new Date().toISOString(),
        summary,
      };
    });
  });
}
