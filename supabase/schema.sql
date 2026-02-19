create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  url text not null,
  title text not null,
  created_at timestamp with time zone default now()
);

alter table public.bookmarks enable row level security;

create policy if not exists "select_own_bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy if not exists "insert_own_bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy if not exists "delete_own_bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

