import { Octokit } from "octokit";

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

/**
 * Fetch the metadata DevNest caches in `public.repos` for a shared repo
 * (see supabase/schema.sql). Accepts "owner/name" or a full github.com URL.
 */
export async function fetchRepoMetadata(ownerAndName: string): Promise<RepoMetadata> {
  const [owner, name] = ownerAndName
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\/$/, "")
    .split("/");

  if (!owner || !name) {
    throw new Error(`Not a valid GitHub repo reference: "${ownerAndName}"`);
  }

  const { data: repo } = await octokit.rest.repos.get({ owner, repo: name });

  let readmeExcerpt: string | null = null;
  try {
    const { data: readme } = await octokit.rest.repos.getReadme({ owner, repo: name });
    const decoded = Buffer.from(readme.content, "base64").toString("utf-8");
    readmeExcerpt = decoded.slice(0, 500);
  } catch {
    // Repo has no README — not fatal, just skip the excerpt.
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
}
