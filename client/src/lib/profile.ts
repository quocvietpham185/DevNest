import { supabase } from "./supabaseClient";
import type { PinnedRepo, GitHubActivityEvent } from "./api";

export interface Profile {
  id: string;
  username: string;
  githubUsername: string | null;
  avatarUrl: string | null;
  bio: string | null;
  company?: string | null;
  location?: string | null;
  followersCount?: number;
  followingCount?: number;
  publicReposCount?: number;
  githubSyncedAt?: string | null;
  pinnedRepos?: PinnedRepo[];
  githubActivity?: GitHubActivityEvent[];
}

export async function fetchProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      github_username,
      avatar_url,
      bio,
      company,
      location,
      followers_count,
      following_count,
      public_repos_count,
      github_synced_at,
      pinned_repos,
      github_activity
    `)
    .eq("username", username)
    .maybeSingle();

  if (error) {
    // If some columns are not migrated yet in Supabase, fall back to basic columns
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("profiles")
      .select("id, username, github_username, avatar_url, bio")
      .eq("username", username)
      .maybeSingle();

    if (fallbackError) throw fallbackError;
    if (!fallbackData) return null;

    return {
      id: fallbackData.id,
      username: fallbackData.username,
      githubUsername: fallbackData.github_username,
      avatarUrl: fallbackData.avatar_url,
      bio: fallbackData.bio,
    };
  }

  if (!data) return null;
  return {
    id: data.id,
    username: data.username,
    githubUsername: data.github_username,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    company: data.company,
    location: data.location,
    followersCount: data.followers_count ?? 0,
    followingCount: data.following_count ?? 0,
    publicReposCount: data.public_repos_count ?? 0,
    githubSyncedAt: data.github_synced_at,
    pinnedRepos: data.pinned_repos ?? [],
    githubActivity: data.github_activity ?? [],
  };
}

export async function updateProfile(
  userId: string,
  input: { username: string; bio: string; avatarUrl: string; githubUsername?: string },
) {
  const payload: Record<string, unknown> = {
    username: input.username,
    bio: input.bio,
    avatar_url: input.avatarUrl,
  };
  if (input.githubUsername !== undefined) {
    payload.github_username = input.githubUsername;
  }

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId);
  if (error) throw error;
}
