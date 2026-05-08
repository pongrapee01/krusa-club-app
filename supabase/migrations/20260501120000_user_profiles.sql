-- Krusa Club: user_profiles (ชื่อ–นามสกุล ตอนสมัคร) + ขยาย handle_new_user
-- ค่าชื่อส่งจาก client ผ่าน supabase.auth.signUp({ options: { data: { first_name, last_name } } })

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_updated_at_idx on public.user_profiles (updated_at desc);

alter table public.user_profiles enable row level security;

create policy "user_profiles_select_own"
  on public.user_profiles for select
  to authenticated
  using (id = auth.uid());

create policy "user_profiles_update_own"
  on public.user_profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "user_profiles_insert_own"
  on public.user_profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Trigger: สร้าง profiles + user_profiles จาก metadata ตอนสมัคร
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member_id uuid;
  fn text;
  ln text;
begin
  select id into member_id from public.roles where slug = 'member' limit 1;
  insert into public.profiles (id, role_id)
  values (new.id, member_id);

  fn := nullif(trim(coalesce(new.raw_user_meta_data->>'first_name', '')), '');
  ln := nullif(trim(coalesce(new.raw_user_meta_data->>'last_name', '')), '');

  insert into public.user_profiles (id, first_name, last_name)
  values (new.id, fn, ln)
  on conflict (id) do update set
    first_name = coalesce(excluded.first_name, public.user_profiles.first_name),
    last_name = coalesce(excluded.last_name, public.user_profiles.last_name),
    updated_at = now();

  return new;
end;
$$;
