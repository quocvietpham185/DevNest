import { Router } from "express";
import { fetchRepoMetadata } from "../lib/github.js";

export const reposRouter = Router();

/**
 * POST /api/repos/lookup  { repoUrl: "owner/name" | "https://github.com/owner/name" }
 * → GitHub metadata to prefill the "share a repo" form (see FEATURES.md, Repo Share).
 * The client is responsible for persisting the result to Supabase itself
 * (RLS allows an authenticated user to insert their own content_items row).
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
