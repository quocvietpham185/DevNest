-- Incremental migration for databases that already have the admin schema (profiles.role, is_admin()) applied.
-- Fresh installs do not need this file: schema.sql already contains everything below.
-- Safe to run more than once.

alter table public.profiles add column if not exists is_banned boolean not null default false;
alter table public.profiles add column if not exists banned_reason text;

create or replace function public.is_banned()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_banned from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.set_user_banned(target_user uuid, banned boolean, reason text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Only admins can ban users'; end if;
  if target_user = auth.uid() then raise exception 'You cannot ban yourself'; end if;
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

-- Writes require a non-banned account.
drop policy if exists "authors create own content" on public.content_items;
create policy "authors create own content" on public.content_items for insert to authenticated
  with check (auth.uid() = author_id and not public.is_banned());

drop policy if exists "authors update own content" on public.content_items;
create policy "authors update own content" on public.content_items for update
  using (auth.uid() = author_id and not public.is_banned());

drop policy if exists "authors tag own content" on public.content_tags;
create policy "authors tag own content" on public.content_tags for insert to authenticated
  with check (exists (select 1 from public.content_items c where c.id = content_id and c.author_id = auth.uid()) and not public.is_banned());

drop policy if exists "authors write own posts" on public.posts;
create policy "authors write own posts" on public.posts for all
  using (exists (select 1 from public.content_items c where c.id = id and c.author_id = auth.uid()) and not public.is_banned());

drop policy if exists "authors write own projects" on public.projects;
create policy "authors write own projects" on public.projects for all
  using (exists (select 1 from public.content_items c where c.id = id and c.author_id = auth.uid()) and not public.is_banned());

drop policy if exists "authors write own repos" on public.repos;
create policy "authors write own repos" on public.repos for all
  using (exists (select 1 from public.content_items c where c.id = id and c.author_id = auth.uid()) and not public.is_banned());

drop policy if exists "authors write own questions" on public.questions;
create policy "authors write own questions" on public.questions for all
  using (exists (select 1 from public.content_items c where c.id = id and c.author_id = auth.uid()) and not public.is_banned());

drop policy if exists "authenticated users create comments" on public.comments;
create policy "authenticated users create comments" on public.comments for insert to authenticated
  with check (auth.uid() = author_id and not public.is_banned());

drop policy if exists "authors manage own comments" on public.comments;
create policy "authors manage own comments" on public.comments for update
  using (auth.uid() = author_id and not public.is_banned());

drop policy if exists "users file reports as themselves" on public.reports;
create policy "users file reports as themselves" on public.reports for insert to authenticated
  with check (auth.uid() = reporter_id and not public.is_banned());
