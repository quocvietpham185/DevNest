const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

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

/** Calls the Express backend, which proxies the GitHub API. */
export async function lookupRepo(repoUrl: string): Promise<RepoMetadata> {
  const response = await fetch(`${API_BASE_URL}/api/repos/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoUrl }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to fetch repo metadata");
  }
  return data as RepoMetadata;
}

/** Phase 2: Fetch full README content from backend */
export async function fetchRepoReadme(repoUrl: string): Promise<FullReadme> {
  const response = await fetch(`${API_BASE_URL}/api/repos/readme?repoUrl=${encodeURIComponent(repoUrl)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to fetch repository README");
  }
  return data as FullReadme;
}

/** Phase 2: Refresh repo metadata in database from GitHub */
export async function refreshRepoMetadata(repoId: string): Promise<{ success: boolean; metadata: RepoMetadata }> {
  const response = await fetch(`${API_BASE_URL}/api/repos/${repoId}/refresh`, {
    method: "POST",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to refresh repository metadata");
  }
  return data;
}

/** Phase 2: Fetch GitHub profile info */
export async function fetchGitHubProfile(username: string): Promise<GitHubUserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/github/profile/${encodeURIComponent(username)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to fetch GitHub profile");
  }
  return data as GitHubUserProfile;
}

/** Phase 2: Sync GitHub profile into database */
export async function syncGitHubProfile(userId: string, githubUsername: string) {
  const response = await fetch(`${API_BASE_URL}/api/github/sync-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, githubUsername }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to synchronize GitHub profile");
  }
  return data;
}

/** Phase 2: Fetch recent GitHub activity */
export async function fetchGitHubActivity(username: string): Promise<GitHubActivityEvent[]> {
  const response = await fetch(`${API_BASE_URL}/api/github/activity/${encodeURIComponent(username)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to fetch GitHub activity");
  }
  return data as GitHubActivityEvent[];
}

/** Phase 2: Fetch user pinned repositories */
export async function fetchGitHubPinnedRepos(username: string): Promise<PinnedRepo[]> {
  const response = await fetch(`${API_BASE_URL}/api/github/pinned/${encodeURIComponent(username)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to fetch pinned repositories");
  }
  return data as PinnedRepo[];
}
