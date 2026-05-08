-- Krusa Club: เมนูตาม role (role_menu) + profiles.role_id
-- รันใน Supabase SQL Editor หรือ supabase db push

-- Roles ---------------------------------------------------------------------
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

alter table public.roles enable row level security;

create policy "roles_select_authenticated"
  on public.roles for select
  to authenticated
  using (true);

-- Menus (แบบ tree: parent_id = null = เมนูแถบบน) ---------------------------
create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.menus (id) on delete cascade,
  label text not null,
  path text not null,
  sort_order int not null default 0,
  match_end boolean not null default false
);

create index if not exists menus_parent_id_idx on public.menus (parent_id);

alter table public.menus enable row level security;

create policy "menus_select_by_role"
  on public.menus for select
  to authenticated
  using (
    exists (
      select 1
      from public.role_menu rm
      join public.profiles p on p.role_id = rm.role_id and p.id = auth.uid()
      where rm.menu_id = menus.id
    )
  );

-- role_menu (เชื่อม role กับ menu ที่มองเห็นได้) -----------------------------
create table if not exists public.role_menu (
  role_id uuid not null references public.roles (id) on delete cascade,
  menu_id uuid not null references public.menus (id) on delete cascade,
  primary key (role_id, menu_id)
);

create index if not exists role_menu_role_id_idx on public.role_menu (role_id);

alter table public.role_menu enable row level security;

create policy "role_menu_select_own_role"
  on public.role_menu for select
  to authenticated
  using (
    role_id = (select role_id from public.profiles where id = auth.uid())
  );

-- Profiles ------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role_id uuid references public.roles (id),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Trigger: สร้าง profile + default role member ตอนสมัคร -----------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member_id uuid;
begin
  select id into member_id from public.roles where slug = 'member' limit 1;
  insert into public.profiles (id, role_id)
  values (new.id, member_id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed (uuid คงที่เพื่ออ้างอิงใน role_menu) ---------------------------------
insert into public.roles (id, slug, name) values
  ('11111111-1111-1111-1111-111111111101', 'member', 'Member'),
  ('11111111-1111-1111-1111-111111111102', 'admin', 'Admin')
on conflict (slug) do nothing;

insert into public.menus (id, parent_id, label, path, sort_order, match_end) values
  ('22222222-2222-2222-2222-222222222201', null, 'Home', '/', 10, true),
  ('22222222-2222-2222-2222-222222222202', null, 'Guide', '/guide', 20, false),
  ('22222222-2222-2222-2222-222222222203', '22222222-2222-2222-2222-222222222202', 'คู่มือ', '/guide', 10, true),
  ('22222222-2222-2222-2222-222222222204', '22222222-2222-2222-2222-222222222202', 'Q&A', '/guide/qa', 20, false),
  ('22222222-2222-2222-2222-222222222205', null, 'Login', '/login', 90, true)
on conflict (id) do nothing;

-- Member: เห็น Home, Guide+ลูก, Login
insert into public.role_menu (role_id, menu_id) values
  ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201'),
  ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222202'),
  ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222203'),
  ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222204'),
  ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222205')
on conflict do nothing;

-- Admin: เห็นเหมือน member (ขยายเมนู admin ได้ภายหลัง)
insert into public.role_menu (role_id, menu_id) values
  ('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222201'),
  ('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222202'),
  ('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222203'),
  ('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222204'),
  ('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222205')
on conflict do nothing;
