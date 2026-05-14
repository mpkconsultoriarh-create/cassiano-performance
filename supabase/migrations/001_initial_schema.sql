-- ============================================================
-- CASSIANO SOCIEDADE DE ADVOGADOS
-- Sistema de Avaliação de Desempenho
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type employee_status as enum ('Ativo', 'Licença', 'Desligado');
create type evaluation_type as enum ('90', '180', '360');
create type evaluator_role as enum ('auto', 'gestor', 'par', 'subordinado', 'cliente');
create type pdi_status as enum ('Em andamento', 'Concluído', 'Prorrogado', 'Cancelado');
create type user_role as enum ('admin', 'rh', 'gestor', 'colaborador');

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  role user_role not null default 'colaborador',
  employee_id uuid,
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- EMPLOYEES
-- ============================================================

create table public.employees (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  email text,
  setor text not null,
  cargo text not null,
  nivel integer not null default 1 check (nivel between 1 and 10),
  gestor_id uuid references public.employees(id) on delete set null,
  gestor_nome text,
  admissao date,
  oab text,
  status employee_status not null default 'Ativo',
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_employees_setor on public.employees(setor);
create index idx_employees_status on public.employees(status);
create index idx_employees_deleted_at on public.employees(deleted_at);

-- ============================================================
-- EVALUATIONS
-- ============================================================

create table public.evaluations (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  tipo evaluation_type not null,
  ciclo text not null,
  nota_final numeric(4,2),
  conceito text,
  acao_recomendada text,
  has_gap boolean default false,
  pdi_needed boolean default false,
  obs_geral text,
  finalizada boolean not null default false,
  created_by uuid references auth.users(id),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_evaluations_employee on public.evaluations(employee_id);
create index idx_evaluations_ciclo on public.evaluations(ciclo);
create index idx_evaluations_finalizada on public.evaluations(finalizada);

-- ============================================================
-- EVALUATORS (per evaluator scores inside an evaluation)
-- ============================================================

create table public.evaluators (
  id uuid primary key default uuid_generate_v4(),
  evaluation_id uuid not null references public.evaluations(id) on delete cascade,
  role evaluator_role not null,
  peso integer not null default 0 check (peso between 0 and 100),
  nota_media numeric(4,2),
  obs text,
  confirmado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(evaluation_id, role)
);

create index idx_evaluators_evaluation on public.evaluators(evaluation_id);

-- ============================================================
-- DIMENSION SCORES (per evaluator, per dimension, per criterion)
-- ============================================================

create table public.dimension_scores (
  id uuid primary key default uuid_generate_v4(),
  evaluator_id uuid not null references public.evaluators(id) on delete cascade,
  dimension_id text not null,  -- 'kpi' | 'tec' | 'beh' | 'dev'
  criterion_id text not null,  -- 'k1' ... 'd2'
  score integer check (score between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(evaluator_id, dimension_id, criterion_id)
);

create index idx_dim_scores_evaluator on public.dimension_scores(evaluator_id);

-- ============================================================
-- PDI
-- ============================================================

create table public.pdis (
  id uuid primary key default uuid_generate_v4(),
  evaluation_id uuid references public.evaluations(id) on delete set null,
  employee_id uuid not null references public.employees(id) on delete cascade,
  tipo text not null default 'Melhoria de desempenho',
  nota_origem numeric(4,2),
  lacunas text,
  causa_raiz text,
  status pdi_status not null default 'Em andamento',
  resultado text,
  data_inicio date default current_date,
  data_fim date,
  objetivos jsonb not null default '[]',
  acoes jsonb not null default '[]',
  checkins jsonb not null default '[]',
  created_by uuid references auth.users(id),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_pdis_employee on public.pdis(employee_id);
create index idx_pdis_status on public.pdis(status);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index idx_audit_user on public.audit_logs(user_id);
create index idx_audit_table on public.audit_logs(table_name);
create index idx_audit_created on public.audit_logs(created_at desc);

-- ============================================================
-- VIEWS
-- ============================================================

-- Employee summary with latest evaluation
create view public.v_employee_summary as
select
  e.id,
  e.nome,
  e.email,
  e.setor,
  e.cargo,
  e.nivel,
  e.gestor_nome,
  e.admissao,
  e.oab,
  e.status,
  count(ev.id) as total_avaliacoes,
  round(avg(ev.nota_final)::numeric, 2) as media_geral,
  max(ev.nota_final) as melhor_nota,
  min(ev.nota_final) as pior_nota,
  (select ev2.nota_final from public.evaluations ev2
   where ev2.employee_id = e.id and ev2.finalizada = true and ev2.deleted_at is null
   order by ev2.created_at desc limit 1) as ultima_nota,
  (select ev2.conceito from public.evaluations ev2
   where ev2.employee_id = e.id and ev2.finalizada = true and ev2.deleted_at is null
   order by ev2.created_at desc limit 1) as ultimo_conceito,
  (select ev2.tipo from public.evaluations ev2
   where ev2.employee_id = e.id and ev2.finalizada = true and ev2.deleted_at is null
   order by ev2.created_at desc limit 1) as ultimo_tipo
from public.employees e
left join public.evaluations ev on ev.employee_id = e.id
  and ev.finalizada = true
  and ev.deleted_at is null
where e.deleted_at is null
group by e.id;

-- Sector summary
create view public.v_sector_summary as
select
  e.setor,
  count(distinct e.id) as total_funcionarios,
  count(distinct ev.employee_id) as total_avaliados,
  count(ev.id) as total_avaliacoes,
  round(avg(ev.nota_final)::numeric, 2) as media_nota,
  count(case when round(ev.nota_final) <= 2 then 1 end) as casos_criticos,
  count(case when round(ev.nota_final) = 5 then 1 end) as excepcionais
from public.employees e
left join public.evaluations ev on ev.employee_id = e.id
  and ev.finalizada = true
  and ev.deleted_at is null
where e.deleted_at is null
  and e.status = 'Ativo'
group by e.setor
order by media_nota desc nulls last;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_employees_updated_at before update on public.employees
  for each row execute function public.handle_updated_at();

create trigger trg_evaluations_updated_at before update on public.evaluations
  for each row execute function public.handle_updated_at();

create trigger trg_evaluators_updated_at before update on public.evaluators
  for each row execute function public.handle_updated_at();

create trigger trg_pdis_updated_at before update on public.pdis
  for each row execute function public.handle_updated_at();

create trigger trg_users_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

-- Auto insert user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, nome, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'colaborador')
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.employees enable row level security;
alter table public.evaluations enable row level security;
alter table public.evaluators enable row level security;
alter table public.dimension_scores enable row level security;
alter table public.pdis enable row level security;
alter table public.audit_logs enable row level security;

-- Helper to get current user role
create or replace function public.get_my_role()
returns user_role language sql security definer stable as $$
  select role from public.users where id = auth.uid()
$$;

-- Users policies
create policy "users_select_own" on public.users for select using (id = auth.uid());
create policy "users_update_own" on public.users for update using (id = auth.uid());
create policy "admin_rh_all_users" on public.users for all using (public.get_my_role() in ('admin', 'rh'));

-- Employees policies (admin/rh full, gestor/colaborador read)
create policy "emp_select_authenticated" on public.employees for select
  using (auth.role() = 'authenticated' and deleted_at is null);
create policy "emp_insert_admin_rh" on public.employees for insert
  with check (public.get_my_role() in ('admin', 'rh'));
create policy "emp_update_admin_rh" on public.employees for update
  using (public.get_my_role() in ('admin', 'rh'));
create policy "emp_delete_admin" on public.employees for delete
  using (public.get_my_role() = 'admin');

-- Evaluations policies
create policy "eval_select_auth" on public.evaluations for select
  using (auth.role() = 'authenticated' and deleted_at is null);
create policy "eval_insert_rh_gestor" on public.evaluations for insert
  with check (public.get_my_role() in ('admin', 'rh', 'gestor'));
create policy "eval_update_rh_gestor" on public.evaluations for update
  using (public.get_my_role() in ('admin', 'rh', 'gestor'));

-- Evaluators & scores
create policy "evtr_select_auth" on public.evaluators for select using (auth.role() = 'authenticated');
create policy "evtr_all_rh" on public.evaluators for all using (public.get_my_role() in ('admin', 'rh', 'gestor'));

create policy "scores_select_auth" on public.dimension_scores for select using (auth.role() = 'authenticated');
create policy "scores_all_rh" on public.dimension_scores for all using (public.get_my_role() in ('admin', 'rh', 'gestor'));

-- PDI policies
create policy "pdi_select_auth" on public.pdis for select using (auth.role() = 'authenticated' and deleted_at is null);
create policy "pdi_all_rh" on public.pdis for all using (public.get_my_role() in ('admin', 'rh', 'gestor'));

-- Audit: only admins
create policy "audit_select_admin" on public.audit_logs for select using (public.get_my_role() = 'admin');
create policy "audit_insert_auth" on public.audit_logs for insert with check (auth.role() = 'authenticated');
