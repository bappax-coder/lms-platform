create table public.worker_access (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_code text not null,
  pin_hash text not null,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  last_used_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id),
  unique (badge_code),
  constraint worker_access_badge_code_format
    check (badge_code ~ '^[A-Z0-9-]{4,32}$')
);

create index worker_access_user_id_idx on public.worker_access (user_id);
create index worker_access_org_id_idx on public.worker_access (organization_id);

create trigger worker_access_set_updated_at
before update on public.worker_access
for each row execute function public.set_updated_at();

alter table public.worker_access enable row level security;

revoke all on public.worker_access from anon, authenticated;
grant select (
  id,
  organization_id,
  user_id,
  badge_code,
  failed_attempts,
  locked_until,
  last_used_at,
  is_active,
  created_at,
  updated_at
) on public.worker_access to authenticated;
grant all on public.worker_access to service_role;

create policy worker_access_admin_select on public.worker_access
for select to authenticated
using (
  public.has_org_role(
    organization_id,
    array['platform_admin', 'org_admin', 'auditor']::public.app_role[]
  )
);
