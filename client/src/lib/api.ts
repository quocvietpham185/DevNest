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

/** Calls the Express backend, which proxies the GitHub API (see server/src/routes/repos.ts). */
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
