import { Router } from "express";
import { fetchRepoMetadata, fetchRepoReadme } from "../lib/github.js";
import { supabaseServer } from "../lib/supabase.js";

export const reposRouter = Router();

/**
 * POST /api/repos/lookup
 * Prefill the "share a repo" form.
 */
reposRouter.post("/lookup", async (req, res) => {
  const { repoUrl } = req.body ?? {};

  if (!repoUrl || typeof repoUrl !== "string") {
    return res.status(400).json({ error: "repoUrl is required" });
  }

  try {
    const metadata = await fetchRepoMetadata(repoUrl);
    res.json(metadata);
  } catch (error) {
    res.status(422).json({
      error: error instanceof Error ? error.message : "Failed to fetch repo metadata",
    });
  }
});

/**
 * Phase 2: GET /api/repos/readme
 * Fetches and returns full README content from GitHub or cached repo.
 */
reposRouter.get("/readme", async (req, res) => {
  const repoUrl = req.query.repoUrl as string;

  if (!repoUrl) {
    return res.status(400).json({ error: "repoUrl parameter is required" });
  }

  try {
    const readme = await fetchRepoReadme(repoUrl);
    res.json(readme);
  } catch (error) {
    res.status(404).json({
      error: error instanceof Error ? error.message : "README not found for this repository",
    });
  }
});

/**
 * Phase 2: POST /api/repos/:id/refresh
 * Refresh repo metadata in Postgres from GitHub API.
 */
reposRouter.post("/:id/refresh", async (req, res) => {
  const { id } = req.params;

  try {
    const { data: repo, error: findError } = await supabaseServer
      .from("repos")
      .select("id, github_url, owner, name")
      .eq("id", id)
      .single();

    if (findError || !repo) {
      return res.status(404).json({ error: "Repository not found in database" });
    }

    const metadata = await fetchRepoMetadata(repo.github_url);

    const { error: updateError } = await supabaseServer
      .from("repos")
      .update({
        stars: metadata.stars,
        description: metadata.description,
        primary_language: metadata.primaryLanguage,
        metadata_fetched_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update repo in DB:", updateError);
      return res.status(500).json({ error: "Database update failed", details: updateError.message });
    }

    res.json({ success: true, metadata });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to refresh repository metadata",
    });
  }
});

/**
 * Phase 2: Background refresh job for all repos in Postgres.
 */
export async function refreshAllSharedRepos(): Promise<number> {
  try {
    const { data: repos, error } = await supabaseServer
      .from("repos")
      .select("id, github_url")
      .limit(20);

    if (error || !repos) return 0;

    let updated = 0;
    for (const r of repos) {
      try {
        const metadata = await fetchRepoMetadata(r.github_url);
        await supabaseServer
          .from("repos")
          .update({
            stars: metadata.stars,
            description: metadata.description,
            primary_language: metadata.primaryLanguage,
            last_synced_at: new Date().toISOString(),
          })
          .eq("id", r.id);
        updated++;
      } catch (err) {
        console.warn(`[Auto-Refresh] Skipped ${r.github_url}:`, err);
      }
    }
    return updated;
  } catch (err) {
    console.error("[Auto-Refresh Error]", err);
    return 0;
  }
}
