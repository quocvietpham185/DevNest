import crypto from "crypto";
import { Router } from "express";
import {
  fetchUserActivity,
  fetchUserPinnedRepos,
  fetchUserProfile,
  fetchRepoMetadata,
} from "../lib/github.js";
import { supabaseServer } from "../lib/supabase.js";

export const githubRouter = Router();

/**
 * Phase 2: GET /api/github/profile/:username
 */
githubRouter.get("/profile/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const profile = await fetchUserProfile(username);
    res.json(profile);
  } catch (error) {
    res.status(404).json({
      error: error instanceof Error ? error.message : "GitHub user not found",
    });
  }
});

/**
 * Phase 2: POST /api/github/sync-profile
 * Synchronizes GitHub profile data into public.profiles for a given user.
 */
githubRouter.post("/sync-profile", async (req, res) => {
  const { userId, githubUsername } = req.body ?? {};

  if (!userId || !githubUsername) {
    return res.status(400).json({ error: "userId and githubUsername are required" });
  }

  try {
    const ghUser = await fetchUserProfile(githubUsername);
    const pinned = await fetchUserPinnedRepos(githubUsername);
    const activity = await fetchUserActivity(githubUsername);

    const updatePayload = {
      company: ghUser.company,
      location: ghUser.location,
      followers_count: ghUser.followers,
      following_count: ghUser.following,
      public_repos_count: ghUser.publicRepos,
      github_synced_at: new Date().toISOString(),
      pinned_repos: pinned,
      github_activity: activity,
    };

    const { data, error } = await supabaseServer
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Failed to sync profile to DB:", error);
      // Even if DB update fails (e.g. column not yet migrated), return fetched data
      return res.json({
        success: true,
        profile: ghUser,
        pinned,
        activity,
        dbUpdated: false,
        warning: error.message,
      });
    }

    res.json({
      success: true,
      profile: ghUser,
      pinned,
      activity,
      dbUpdated: true,
      updatedRecord: data,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to sync GitHub profile",
    });
  }
});

/**
 * Phase 2: GET /api/github/activity/:username
 */
githubRouter.get("/activity/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const activity = await fetchUserActivity(username);
    res.json(activity);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch GitHub activity",
    });
  }
});

/**
 * Phase 2: GET /api/github/pinned/:username
 */
githubRouter.get("/pinned/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const pinned = await fetchUserPinnedRepos(username);
    res.json(pinned);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch pinned repositories",
    });
  }
});

/**
 * Phase 2: POST /api/github/webhook
 * Receives GitHub Webhook events (push, star/watch, issues, etc.)
 */
githubRouter.post("/webhook", async (req, res) => {
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  const event = req.headers["x-github-event"] as string | undefined;
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (secret && signature) {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }
  }

  console.log(`[GitHub Webhook] Received event "${event}"`);

  // Handle ping
  if (event === "ping") {
    return res.json({ message: "pong", zen: req.body?.zen });
  }

  // Handle repository changes or stars
  if (event === "star" || event === "watch" || event === "push") {
    const repoFullName = req.body?.repository?.full_name;
    if (repoFullName) {
      try {
        const metadata = await fetchRepoMetadata(repoFullName);
        await supabaseServer
          .from("repos")
          .update({
            stars: metadata.stars,
            description: metadata.description,
            primary_language: metadata.primaryLanguage,
            last_synced_at: new Date().toISOString(),
          })
          .ilike("github_url", `%${repoFullName}%`);
        console.log(`[GitHub Webhook] Successfully updated ${repoFullName}`);
      } catch (err) {
        console.warn(`[GitHub Webhook] Failed to update ${repoFullName}:`, err);
      }
    }
  }

  res.json({ received: true, event });
});
