-- Migration for Phase 2: Deep GitHub Integration
-- Adds fields to profiles for GitHub profile sync, pinned repos, and activity.
-- Adds cached readme and refresh timestamp to repos.

alter table public.profiles
  add column if not exists company text,
  add column if not exists location text,
  add column if not exists followers_count integer default 0,
  add column if not exists following_count integer default 0,
  add column if not exists public_repos_count integer default 0,
  add column if not exists github_synced_at timestamptz,
  add column if not exists pinned_repos jsonb default '[]'::jsonb,
  add column if not exists github_activity jsonb default '[]'::jsonb;

alter table public.repos
  add column if not exists readme_markdown text,
  add column if not exists readme_fetched_at timestamptz,
  add column if not exists last_synced_at timestamptz default now();
