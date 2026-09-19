import { supabase } from "./supabaseClient";

export interface Profile {
  id: string;
  username: string;
  githubUsername: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

export async function fetchProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, github_username, avatar_url, bio")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    username: data.username,
    githubUsername: data.github_username,
    avatarUrl: data.avatar_url,
    bio: data.bio,
  };
}

export async function updateProfile(
  userId: string,
  input: { username: string; bio: string; avatarUrl: string },
) {
  const { error } = await supabase
    .from("profiles")
    .update({ username: input.username, bio: input.bio, avatar_url: input.avatarUrl })
    .eq("id", userId);
  if (error) throw error;
}
