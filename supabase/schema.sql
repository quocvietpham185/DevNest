-- DevNest — initial Postgres schema (Phase 1 / MVP, see ../PRD.md and ../FEATURES.md)
--
-- Apply with:
--   npx supabase db push
-- or paste into the Supabase SQL editor.
--
-- Design: blog posts, projects and shared repos are three distinct tables
-- (different fields each), but all three point back to one `content_items`
-- row. Likes, comments, bookmarks and tags attach to `content_items`, so the
-- feed/search/social layer doesn't need to care which content type it is.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with an auth.users row, created via trigger on sign-up)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  github_username text,
  avatar_url text,
  bio text,
  -- Changed only through public.set_user_role(); column-level grants below
  -- stop users from updating it on their own row.
  role text not null default 'user' check (role in ('user', 'admin')),
  -- Set only through public.set_user_banned(); a banned user keeps read access
  -- but every write policy below requires `not public.is_banned()`.
  is_banned boolean not null default false,
  banned_reason text,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, github_username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'user_name', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data ->> 'user_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Tags
-- ---------------------------------------------------------------------------
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

-- ---------------------------------------------------------------------------
-- Content items — shared parent row for posts / projects / repos
-- ---------------------------------------------------------------------------
create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('post', 'project', 'repo', 'question')),
  title text not null,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index content_items_search_idx on public.content_items using gin (search_vector);
create index content_items_kind_idx on public.content_items (kind, created_at desc);

create table public.content_tags (
  content_id uuid not null references public.content_items (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (content_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- Blog posts
-- ---------------------------------------------------------------------------
create table public.posts (
  id uuid primary key references public.content_items (id) on delete cascade,
  body_markdown text not null,
  cover_image_url text,
  published boolean not null default false,
  published_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Project showcases
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key references public.content_items (id) on delete cascade,
  description text not null,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'looking_for_collaborators')),
  repo_url text,
  demo_url text,
  cover_image_url text
);

-- ---------------------------------------------------------------------------
-- Shared repos (metadata cached from the GitHub API — see PRD.md section 6)
-- ---------------------------------------------------------------------------
create table public.repos (
  id uuid primary key references public.content_items (id) on delete cascade,
  github_url text not null unique,
  owner text not null,
  name text not null,
  description text,
  stars integer not null default 0,
  primary_language text,
  note text,
  metadata_fetched_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Q&A questions (comments on a question double as answers — see is_accepted
-- below; accepted_comment_id is nullable until the asker picks a best answer)
-- ---------------------------------------------------------------------------
create table public.questions (
  id uuid primary key references public.content_items (id) on delete cascade,
  body_markdown text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  accepted_comment_id uuid
);

-- Keep content_items.search_vector in sync whenever a child row changes.
create function public.sync_content_search_vector()
returns trigger as $$
declare
  v_title text;
  v_body text;
begin
  select title into v_title from public.content_items where id = coalesce(new.id, old.id);

  -- Child tables do not share the same body column, so inspect the row as JSON
  -- instead of dereferencing fields that may not exist on the current table.
  v_body := coalesce(
    to_jsonb(new) ->> 'body_markdown',
    to_jsonb(new) ->> 'description',
    to_jsonb(new) ->> 'note',
    ''
  );

  update public.content_items
  set search_vector = setweight(to_tsvector('simple', coalesce(v_title, '')), 'A')
                    || setweight(to_tsvector('simple', coalesce(v_body, '')), 'B'),
      updated_at = now()
  where id = new.id;

  return new;
end;
$$ language plpgsql;

create trigger posts_search_sync
  after insert or update on public.posts
  for each row execute function public.sync_content_search_vector();

create trigger projects_search_sync
  after insert or update on public.projects
  for each row execute function public.sync_content_search_vector();

create trigger repos_search_sync
  after insert or update on public.repos
  for each row execute function public.sync_content_search_vector();

create trigger questions_search_sync
  after insert or update on public.questions
  for each row execute function public.sync_content_search_vector();

-- ---------------------------------------------------------------------------
-- Social: likes, comments, bookmarks, follows
-- ---------------------------------------------------------------------------
create table public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  content_id uuid not null references public.content_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  -- Only meaningful when the parent content_items.kind = 'question'.
  is_accepted_answer boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.questions
  add constraint questions_accepted_comment_fkey
  foreign key (accepted_comment_id) references public.comments (id) on delete set null;

create table public.bookmarks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  content_id uuid not null references public.content_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create table public.user_follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create table public.tag_follows (
  user_id uuid not null references public.profiles (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- Moderation: reports + admin helpers
-- ---------------------------------------------------------------------------
-- A report row is removed together with its content (on delete cascade), so
-- "delete content" from the admin queue also clears that content's reports.
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 500),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (content_id, reporter_id)
);

create index reports_status_idx on public.reports (status, created_at desc);

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Only an admin may change roles, and never their own (avoids removing the last admin).
create function public.set_user_role(target_user uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  if target_user = auth.uid() then
    raise exception 'You cannot change your own role';
  end if;
  if new_role not in ('user', 'admin') then
    raise exception 'Invalid role';
  end if;
  update public.profiles set role = new_role where id = target_user;
end;
$$;

revoke all on function public.set_user_role(uuid, text) from public, anon;
grant execute on function public.set_user_role(uuid, text) to authenticated;
grant execute on function public.is_admin() to authenticated;

create function public.is_banned()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_banned from public.profiles where id = auth.uid()), false);
$$;

-- Admins only; cannot ban yourself or another admin (demote them first).
create function public.set_user_banned(target_user uuid, banned boolean, reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can ban users';
  end if;
  if target_user = auth.uid() then
    raise exception 'You cannot ban yourself';
  end if;
  if exists (select 1 from public.profiles where id = target_user and role = 'admin') then
    raise exception 'Demote this admin before banning';
  end if;
  update public.profiles
  set is_banned = banned,
      banned_reason = case when banned then nullif(trim(reason), '') else null end
  where id = target_user;
end;
$$;

revoke all on function public.set_user_banned(uuid, boolean, text) from public, anon;
grant execute on function public.set_user_banned(uuid, boolean, text) to authenticated;
grant execute on function public.is_banned() to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.tags enable row level security;
alter table public.content_items enable row level security;
alter table public.content_tags enable row level security;
alter table public.posts enable row level security;
alter table public.projects enable row level security;
alter table public.repos enable row level security;
alter table public.questions enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.bookmarks enable row level security;
alter table public.user_follows enable row level security;
alter table public.tag_follows enable row level security;
alter table public.reports enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.content_items, public.profiles, public.tags,
  public.content_tags, public.posts, public.projects, public.repos,
  public.questions to anon, authenticated;
grant insert, update, delete on public.content_items, public.content_tags,
  public.posts, public.projects, public.repos, public.questions to authenticated;
-- Column-level update grant: `role` is deliberately absent so a user cannot
-- promote themselves to admin through the "users update own profile" policy.
grant insert on public.profiles to authenticated;
grant update (username, github_username, avatar_url, bio) on public.profiles to authenticated;
grant insert on public.tags to authenticated;
grant select on public.likes, public.comments, public.user_follows,
  public.tag_follows to anon, authenticated;
grant select on public.bookmarks to authenticated;
grant insert, update, delete on public.likes, public.comments,
  public.bookmarks, public.user_follows, public.tag_follows to authenticated;
grant select, insert on public.reports to authenticated;
grant update (status) on public.reports to authenticated;

-- Public read on everything content-shaped; writes limited to the owner.
create policy "profiles are publicly readable" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);

create policy "tags are publicly readable" on public.tags for select using (true);
create policy "authenticated users create tags" on public.tags for insert to authenticated with check (true);

create policy "content is publicly readable" on public.content_items for select using (true);
create policy "authors create own content" on public.content_items for insert to authenticated with check (auth.uid() = author_id and not public.is_banned());
create policy "authors update own content" on public.content_items for update using (auth.uid() = author_id and not public.is_banned());
create policy "authors delete own content" on public.content_items for delete using (auth.uid() = author_id);

create policy "content_tags are publicly readable" on public.content_tags for select using (true);
create policy "authors tag own content" on public.content_tags for insert to authenticated
  with check (exists (select 1 from public.content_items c where c.id = content_id and c.author_id = auth.uid()) and not public.is_banned());
create policy "authors untag own content" on public.content_tags for delete to authenticated
  using (exists (select 1 from public.content_items c where c.id = content_id and c.author_id = auth.uid()));

create policy "posts are publicly readable" on public.posts for select using (true);
create policy "authors write own posts" on public.posts for all
  using (exists (select 1 from public.content_items c where c.id = id and c.author_id = auth.uid()) and not public.is_banned());

create policy "projects are publicly readable" on public.projects for select using (true);
create policy "authors write own projects" on public.projects for all
  using (exists (select 1 from public.content_items c where c.id = id and c.author_id = auth.uid()) and not public.is_banned());

create policy "repos are publicly readable" on public.repos for select using (true);
create policy "authors write own repos" on public.repos for all
  using (exists (select 1 from public.content_items c where c.id = id and c.author_id = auth.uid()) and not public.is_banned());

create policy "questions are publicly readable" on public.questions for select using (true);
create policy "authors write own questions" on public.questions for all
  using (exists (select 1 from public.content_items c where c.id = id and c.author_id = auth.uid()) and not public.is_banned());

create policy "likes are publicly readable" on public.likes for select using (true);
create policy "users manage own likes" on public.likes for all using (auth.uid() = user_id);

create policy "comments are publicly readable" on public.comments for select using (true);
create policy "authenticated users create comments" on public.comments for insert to authenticated with check (auth.uid() = author_id and not public.is_banned());
create policy "authors manage own comments" on public.comments for update using (auth.uid() = author_id and not public.is_banned());
create policy "question owners mark accepted answer" on public.comments for update
  using (exists (select 1 from public.content_items c where c.id = content_id and c.author_id = auth.uid()));
create policy "authors delete own comments" on public.comments for delete using (auth.uid() = author_id);

create policy "admins delete any content" on public.content_items for delete to authenticated using (public.is_admin());
create policy "admins delete any comment" on public.comments for delete to authenticated using (public.is_admin());

create policy "users file reports as themselves" on public.reports for insert to authenticated
  with check (auth.uid() = reporter_id and not public.is_banned());
create policy "admins read reports" on public.reports for select to authenticated using (public.is_admin());
create policy "admins update reports" on public.reports for update to authenticated using (public.is_admin());

create policy "users see own bookmarks" on public.bookmarks for select using (auth.uid() = user_id);
create policy "users manage own bookmarks" on public.bookmarks for all using (auth.uid() = user_id);

create policy "follows are publicly readable" on public.user_follows for select using (true);
create policy "users manage own follows" on public.user_follows for all using (auth.uid() = follower_id);

create policy "tag follows are publicly readable" on public.tag_follows for select using (true);
create policy "users manage own tag follows" on public.tag_follows for all using (auth.uid() = user_id);
