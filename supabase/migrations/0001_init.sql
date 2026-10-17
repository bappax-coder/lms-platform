create extension if not exists "pgcrypto";

create type public.app_role as enum (
  'platform_admin',
  'org_admin',
  'instructor',
  'learner',
  'auditor'
);

create type public.enrollment_status as enum (
  'invited',
  'active',
  'completed',
  'failed',
  'dropped',
  'expired'
);

create type public.progress_status as enum (
  'not_started',
  'in_progress',
  'completed'
);

create type public.certificate_status as enum (
  'issued',
  'revoked',
  'expired',
  'superseded'
);

create type public.attempt_status as enum (
  'in_progress',
  'submitted',
  'graded',
  'abandoned'
);

create type public.question_type as enum (
  'multiple_choice',
  'multi_select',
  'true_false',
  'short_answer'
);

create type public.lesson_content_type as enum (
  'video',
  'article',
  'scorm',
  'quiz',
  'document'
);

create type public.dsar_type as enum (
  'access',
  'rectification',
  'erasure',
  'portability',
  'restriction',
  'objection'
);

create type public.dsar_status as enum (
  'received',
  'in_progress',
  'completed',
  'rejected',
  'partially_completed'
);

create type public.consent_purpose as enum (
  'terms_of_service',
  'privacy_policy',
  'marketing',
  'analytics_cookies',
  'training_record_retention'
);

create type public.audit_action as enum (
  'create',
  'read',
  'update',
  'delete',
  'login',
  'logout',
  'export',
  'enroll',
  'complete',
  'issue_certificate',
  'revoke_certificate',
  'consent_granted',
  'consent_withdrawn',
  'dsar_opened',
  'dsar_closed'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  legal_name text,
  logo_url text,
  primary_color text,
  timezone text not null default 'UTC',
  country_code text,
  retention_days integer not null default 2555 check (retention_days > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.app_role not null default 'learner',
  job_title text,
  department text,
  locale text not null default 'en',
  timezone text,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  member_role public.app_role not null default 'learner',
  department text,
  hired_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  code text not null,
  version text not null default '1.0',
  passing_score numeric(5, 2) not null default 80 check (passing_score >= 0 and passing_score <= 100),
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  recertification_months integer check (recertification_months is null or recertification_months > 0),
  is_published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug),
  unique (organization_id, code, version)
);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules (id) on delete cascade,
  title text not null,
  content_type public.lesson_content_type not null default 'article',
  content_url text,
  body text,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  position integer not null default 0,
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_requirements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  target_role public.app_role,
  target_department text,
  due_days_from_assignment integer not null default 30 check (due_days_from_assignment >= 0),
  is_mandatory boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.enrollment_status not null default 'invited',
  assigned_at timestamptz not null default now(),
  due_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  progress_percent numeric(5, 2) not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  score numeric(5, 2) check (score is null or (score >= 0 and score <= 100)),
  assigned_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, user_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.progress_status not null default 'not_started',
  time_spent_seconds integer not null default 0 check (time_spent_seconds >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enrollment_id, lesson_id)
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete set null,
  title text not null,
  passing_score numeric(5, 2) not null default 80 check (passing_score >= 0 and passing_score <= 100),
  max_attempts integer check (max_attempts is null or max_attempts > 0),
  time_limit_minutes integer check (time_limit_minutes is null or time_limit_minutes > 0),
  is_randomized boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  prompt text not null,
  type public.question_type not null,
  options jsonb not null default '[]'::jsonb,
  points numeric(6, 2) not null default 1 check (points >= 0),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.question_answer_keys (
  question_id uuid primary key references public.questions (id) on delete cascade,
  correct_answer jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.attempt_status not null default 'in_progress',
  score numeric(5, 2) check (score is null or (score >= 0 and score <= 100)),
  answers jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  attempt_number integer not null default 1 check (attempt_number > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, user_id, attempt_number)
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  enrollment_id uuid not null unique references public.enrollments (id) on delete restrict,
  user_id uuid not null references public.profiles (id) on delete restrict,
  course_id uuid not null references public.courses (id) on delete restrict,
  certificate_number text not null unique,
  verification_code text not null unique,
  status public.certificate_status not null default 'issued',
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_reason text,
  pdf_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  purpose public.consent_purpose not null,
  granted boolean not null default false,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  policy_version text not null,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete set null,
  actor_id uuid references public.profiles (id) on delete set null,
  action public.audit_action not null,
  entity_table text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.data_subject_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  requester_email text not null,
  type public.dsar_type not null,
  status public.dsar_status not null default 'received',
  due_at timestamptz not null,
  completed_at timestamptz,
  notes text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.retention_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  entity_table text not null,
  retain_days integer not null check (retain_days > 0),
  legal_basis text not null,
  anonymize boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, entity_table)
);

create table public.legal_holds (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  started_at timestamptz not null default now(),
  released_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index organization_members_user_id_idx on public.organization_members (user_id);
create index organization_members_org_id_idx on public.organization_members (organization_id);
create index courses_organization_id_idx on public.courses (organization_id);
create index course_modules_course_id_idx on public.course_modules (course_id);
create index lessons_module_id_idx on public.lessons (module_id);
create index course_requirements_org_course_idx on public.course_requirements (organization_id, course_id);
create index enrollments_user_id_idx on public.enrollments (user_id);
create index enrollments_org_status_idx on public.enrollments (organization_id, status);
create index lesson_progress_user_id_idx on public.lesson_progress (user_id);
create index assessments_course_id_idx on public.assessments (course_id);
create index questions_assessment_id_idx on public.questions (assessment_id);
create index assessment_attempts_user_id_idx on public.assessment_attempts (user_id);
create index certificates_user_id_idx on public.certificates (user_id);
create index certificates_verification_code_idx on public.certificates (verification_code);
create index consents_user_id_idx on public.consents (user_id);
create index audit_logs_org_created_idx on public.audit_logs (organization_id, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_table, entity_id);
create index dsar_org_status_idx on public.data_subject_requests (organization_id, status);
create index legal_holds_user_id_idx on public.legal_holds (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at before update on public.organizations
for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger organization_members_set_updated_at before update on public.organization_members
for each row execute function public.set_updated_at();
create trigger courses_set_updated_at before update on public.courses
for each row execute function public.set_updated_at();
create trigger course_modules_set_updated_at before update on public.course_modules
for each row execute function public.set_updated_at();
create trigger lessons_set_updated_at before update on public.lessons
for each row execute function public.set_updated_at();
create trigger course_requirements_set_updated_at before update on public.course_requirements
for each row execute function public.set_updated_at();
create trigger enrollments_set_updated_at before update on public.enrollments
for each row execute function public.set_updated_at();
create trigger lesson_progress_set_updated_at before update on public.lesson_progress
for each row execute function public.set_updated_at();
create trigger assessments_set_updated_at before update on public.assessments
for each row execute function public.set_updated_at();
create trigger questions_set_updated_at before update on public.questions
for each row execute function public.set_updated_at();
create trigger question_answer_keys_set_updated_at before update on public.question_answer_keys
for each row execute function public.set_updated_at();
create trigger assessment_attempts_set_updated_at before update on public.assessment_attempts
for each row execute function public.set_updated_at();
create trigger certificates_set_updated_at before update on public.certificates
for each row execute function public.set_updated_at();
create trigger consents_set_updated_at before update on public.consents
for each row execute function public.set_updated_at();
create trigger data_subject_requests_set_updated_at before update on public.data_subject_requests
for each row execute function public.set_updated_at();
create trigger retention_policies_set_updated_at before update on public.retention_policies
for each row execute function public.set_updated_at();
create trigger legal_holds_set_updated_at before update on public.legal_holds
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, 'learner'), '@', 1)),
    'learner'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'platform_admin'
      and is_active = true
  );
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or exists (
      select 1
      from public.organization_members
      where organization_id = org_id
        and user_id = (select auth.uid())
    );
$$;

create or replace function public.org_role(org_id uuid)
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.is_platform_admin() then 'platform_admin'::public.app_role
    else (
      select member_role
      from public.organization_members
      where organization_id = org_id
        and user_id = (select auth.uid())
      limit 1
    )
  end;
$$;

create or replace function public.has_org_role(org_id uuid, allowed public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.org_role(org_id) = any (allowed);
$$;

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  if public.is_platform_admin() then
    return coalesce(new, old);
  end if;
  raise exception 'Audit logs are immutable.';
end;
$$;

create trigger audit_logs_immutable
before update or delete on public.audit_logs
for each row execute function public.prevent_audit_log_mutation();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.course_requirements enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.assessments enable row level security;
alter table public.questions enable row level security;
alter table public.question_answer_keys enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.certificates enable row level security;
alter table public.consents enable row level security;
alter table public.audit_logs enable row level security;
alter table public.data_subject_requests enable row level security;
alter table public.retention_policies enable row level security;
alter table public.legal_holds enable row level security;

create policy organizations_select on public.organizations
for select to authenticated
using (public.is_org_member(id));

create policy organizations_modify on public.organizations
for all to authenticated
using (public.has_org_role(id, array['platform_admin', 'org_admin']::public.app_role[]))
with check (public.has_org_role(id, array['platform_admin', 'org_admin']::public.app_role[]));

create policy profiles_select_self_or_admin on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or public.is_platform_admin()
  or exists (
    select 1
    from public.organization_members membership
    where membership.user_id = profiles.id
      and public.has_org_role(
        membership.organization_id,
        array['platform_admin', 'org_admin', 'instructor', 'auditor']::public.app_role[]
      )
  )
);

create policy profiles_update_self on public.profiles
for update to authenticated
using (id = (select auth.uid()) or public.is_platform_admin())
with check (id = (select auth.uid()) or public.is_platform_admin());

create policy organization_members_select on public.organization_members
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.is_org_member(organization_id)
);

create policy organization_members_modify on public.organization_members
for all to authenticated
using (public.has_org_role(organization_id, array['platform_admin', 'org_admin']::public.app_role[]))
with check (public.has_org_role(organization_id, array['platform_admin', 'org_admin']::public.app_role[]));

create policy courses_select on public.courses
for select to authenticated
using (
  public.is_org_member(organization_id)
  and (is_published or public.has_org_role(organization_id, array['platform_admin', 'org_admin', 'instructor', 'auditor']::public.app_role[]))
);

create policy courses_modify on public.courses
for all to authenticated
using (public.has_org_role(organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[]))
with check (public.has_org_role(organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[]));

create policy course_modules_select on public.course_modules
for select to authenticated
using (
  exists (
    select 1 from public.courses
    where courses.id = course_modules.course_id
      and public.is_org_member(courses.organization_id)
  )
);

create policy course_modules_modify on public.course_modules
for all to authenticated
using (
  exists (
    select 1 from public.courses
    where courses.id = course_modules.course_id
      and public.has_org_role(courses.organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
  )
)
with check (
  exists (
    select 1 from public.courses
    where courses.id = course_modules.course_id
      and public.has_org_role(courses.organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
  )
);

create policy lessons_select on public.lessons
for select to authenticated
using (
  exists (
    select 1
    from public.course_modules
    join public.courses on courses.id = course_modules.course_id
    where course_modules.id = lessons.module_id
      and public.is_org_member(courses.organization_id)
  )
);

create policy lessons_modify on public.lessons
for all to authenticated
using (
  exists (
    select 1
    from public.course_modules
    join public.courses on courses.id = course_modules.course_id
    where course_modules.id = lessons.module_id
      and public.has_org_role(courses.organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
  )
)
with check (
  exists (
    select 1
    from public.course_modules
    join public.courses on courses.id = course_modules.course_id
    where course_modules.id = lessons.module_id
      and public.has_org_role(courses.organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
  )
);

create policy course_requirements_select on public.course_requirements
for select to authenticated
using (public.is_org_member(organization_id));

create policy course_requirements_modify on public.course_requirements
for all to authenticated
using (public.has_org_role(organization_id, array['platform_admin', 'org_admin']::public.app_role[]))
with check (public.has_org_role(organization_id, array['platform_admin', 'org_admin']::public.app_role[]));

create policy enrollments_select on public.enrollments
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.has_org_role(organization_id, array['platform_admin', 'org_admin', 'instructor', 'auditor']::public.app_role[])
);

create policy enrollments_modify on public.enrollments
for all to authenticated
using (
  user_id = (select auth.uid())
  or public.has_org_role(organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
)
with check (
  user_id = (select auth.uid())
  or public.has_org_role(organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
);

create policy lesson_progress_select on public.lesson_progress
for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.enrollments
    where enrollments.id = lesson_progress.enrollment_id
      and public.has_org_role(enrollments.organization_id, array['platform_admin', 'org_admin', 'instructor', 'auditor']::public.app_role[])
  )
);

create policy lesson_progress_modify on public.lesson_progress
for all to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.enrollments
    where enrollments.id = lesson_progress.enrollment_id
      and public.has_org_role(enrollments.organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
  )
)
with check (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.enrollments
    where enrollments.id = lesson_progress.enrollment_id
      and public.has_org_role(enrollments.organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
  )
);

create policy assessments_select on public.assessments
for select to authenticated
using (
  exists (
    select 1 from public.courses
    where courses.id = assessments.course_id
      and public.is_org_member(courses.organization_id)
  )
);

create policy assessments_modify on public.assessments
for all to authenticated
using (
  exists (
    select 1 from public.courses
    where courses.id = assessments.course_id
      and public.has_org_role(courses.organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
  )
)
with check (
  exists (
    select 1 from public.courses
    where courses.id = assessments.course_id
      and public.has_org_role(courses.organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
  )
);

create policy questions_select on public.questions
for select to authenticated
using (
  exists (
    select 1
    from public.assessments
    join public.courses on courses.id = assessments.course_id
    where assessments.id = questions.assessment_id
      and (
        public.has_org_role(courses.organization_id, array['platform_admin', 'org_admin', 'instructor', 'auditor']::public.app_role[])
        or exists (
          select 1 from public.enrollments
          where enrollments.course_id = courses.id
            and enrollments.user_id = (select auth.uid())
        )
      )
  )
);

create policy questions_modify on public.questions
for all to authenticated
using (
  exists (
    select 1
    from public.assessments
    join public.courses on courses.id = assessments.course_id
    where assessments.id = questions.assessment_id
      and public.has_org_role(courses.organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
  )
)
with check (
  exists (
    select 1
    from public.assessments
    join public.courses on courses.id = assessments.course_id
    where assessments.id = questions.assessment_id
      and public.has_org_role(courses.organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
  )
);

create policy question_answer_keys_select on public.question_answer_keys
for select to authenticated
using (
  exists (
    select 1
    from public.questions
    join public.assessments on assessments.id = questions.assessment_id
    join public.courses on courses.id = assessments.course_id
    where questions.id = question_answer_keys.question_id
      and public.has_org_role(courses.organization_id, array['platform_admin', 'org_admin', 'instructor', 'auditor']::public.app_role[])
  )
);

create policy question_answer_keys_modify on public.question_answer_keys
for all to authenticated
using (
  exists (
    select 1
    from public.questions
    join public.assessments on assessments.id = questions.assessment_id
    join public.courses on courses.id = assessments.course_id
    where questions.id = question_answer_keys.question_id
      and public.has_org_role(courses.organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
  )
)
with check (
  exists (
    select 1
    from public.questions
    join public.assessments on assessments.id = questions.assessment_id
    join public.courses on courses.id = assessments.course_id
    where questions.id = question_answer_keys.question_id
      and public.has_org_role(courses.organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
  )
);

create policy assessment_attempts_select on public.assessment_attempts
for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.enrollments
    where enrollments.id = assessment_attempts.enrollment_id
      and public.has_org_role(enrollments.organization_id, array['platform_admin', 'org_admin', 'instructor', 'auditor']::public.app_role[])
  )
);

create policy assessment_attempts_modify on public.assessment_attempts
for all to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.enrollments
    where enrollments.id = assessment_attempts.enrollment_id
      and public.has_org_role(enrollments.organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
  )
)
with check (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.enrollments
    where enrollments.id = assessment_attempts.enrollment_id
      and public.has_org_role(enrollments.organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[])
  )
);

create policy certificates_select on public.certificates
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.has_org_role(organization_id, array['platform_admin', 'org_admin', 'instructor', 'auditor']::public.app_role[])
);

create policy certificates_modify on public.certificates
for all to authenticated
using (public.has_org_role(organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[]))
with check (public.has_org_role(organization_id, array['platform_admin', 'org_admin', 'instructor']::public.app_role[]));

create policy consents_select on public.consents
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.has_org_role(organization_id, array['platform_admin', 'org_admin', 'auditor']::public.app_role[])
);

create policy consents_modify on public.consents
for all to authenticated
using (
  user_id = (select auth.uid())
  or public.has_org_role(organization_id, array['platform_admin', 'org_admin']::public.app_role[])
)
with check (
  user_id = (select auth.uid())
  or public.has_org_role(organization_id, array['platform_admin', 'org_admin']::public.app_role[])
);

create policy audit_logs_select on public.audit_logs
for select to authenticated
using (
  public.has_org_role(organization_id, array['platform_admin', 'org_admin', 'auditor']::public.app_role[])
  or actor_id = (select auth.uid())
);

create policy audit_logs_insert on public.audit_logs
for insert to authenticated
with check (
  actor_id = (select auth.uid())
  or public.has_org_role(organization_id, array['platform_admin', 'org_admin']::public.app_role[])
);

create policy data_subject_requests_select on public.data_subject_requests
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.has_org_role(organization_id, array['platform_admin', 'org_admin', 'auditor']::public.app_role[])
);

create policy data_subject_requests_modify on public.data_subject_requests
for all to authenticated
using (public.has_org_role(organization_id, array['platform_admin', 'org_admin']::public.app_role[]))
with check (public.has_org_role(organization_id, array['platform_admin', 'org_admin']::public.app_role[]));

create policy retention_policies_select on public.retention_policies
for select to authenticated
using (public.has_org_role(organization_id, array['platform_admin', 'org_admin', 'auditor']::public.app_role[]));

create policy retention_policies_modify on public.retention_policies
for all to authenticated
using (public.has_org_role(organization_id, array['platform_admin', 'org_admin']::public.app_role[]))
with check (public.has_org_role(organization_id, array['platform_admin', 'org_admin']::public.app_role[]));

create policy legal_holds_select on public.legal_holds
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.has_org_role(organization_id, array['platform_admin', 'org_admin', 'auditor']::public.app_role[])
);

create policy legal_holds_modify on public.legal_holds
for all to authenticated
using (public.has_org_role(organization_id, array['platform_admin', 'org_admin']::public.app_role[]))
with check (public.has_org_role(organization_id, array['platform_admin', 'org_admin']::public.app_role[]));

insert into storage.buckets (id, name, public)
values
  ('certificates', 'certificates', false),
  ('course-assets', 'course-assets', false)
on conflict (id) do nothing;

create policy certificates_storage_select on storage.objects
for select to authenticated
using (
  bucket_id = 'certificates'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.is_platform_admin()
  )
);

create policy certificates_storage_write on storage.objects
for insert to authenticated
with check (
  bucket_id = 'certificates'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.is_platform_admin()
  )
);

create policy course_assets_select on storage.objects
for select to authenticated
using (bucket_id = 'course-assets');

create policy course_assets_modify on storage.objects
for all to authenticated
using (
  bucket_id = 'course-assets'
  and public.is_platform_admin()
)
with check (
  bucket_id = 'course-assets'
  and public.is_platform_admin()
);

grant usage on schema public to authenticated, service_role;
grant all on all tables in schema public to authenticated, service_role;
grant all on all sequences in schema public to authenticated, service_role;
grant execute on all functions in schema public to authenticated, service_role;
