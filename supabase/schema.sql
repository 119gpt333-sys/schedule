-- Supabase SQL Editor에서 한 번 실행하세요.

create table if not exists public.app_schedule (
  id text primary key default 'main',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_schedule enable row level security;

-- anon(브라우저 공개 키)으로 읽기/쓰기 — 내부용. 외부 공개 시 서비스 정책에 맞게 조정하세요.
create policy "app_schedule_select_anon"
  on public.app_schedule for select
  to anon
  using (true);

create policy "app_schedule_insert_anon"
  on public.app_schedule for insert
  to anon
  with check (true);

create policy "app_schedule_update_anon"
  on public.app_schedule for update
  to anon
  using (true)
  with check (true);
