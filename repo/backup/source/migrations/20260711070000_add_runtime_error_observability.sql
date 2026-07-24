begin;

create table if not exists public.runtime_error_logs (
  id uuid primary key default gen_random_uuid(),
  incident_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  actor_id uuid null,
  source text not null check (source in ('react_boundary', 'window_error', 'unhandled_rejection')),
  message text not null,
  stack text null,
  component_stack text null,
  route text null,
  created_at timestamptz not null default now()
);

create index if not exists runtime_error_logs_created_at_idx on public.runtime_error_logs (created_at desc);
create index if not exists runtime_error_logs_source_created_at_idx on public.runtime_error_logs (source, created_at desc);

alter table public.runtime_error_logs enable row level security;
revoke all on public.runtime_error_logs from anon, authenticated;

drop function if exists public.report_runtime_error(text, text, text, text, text);
create function public.report_runtime_error(
  p_source text,
  p_message text,
  p_stack text default null,
  p_component_stack text default null,
  p_route text default null
) returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_incident_code text;
begin
  if p_source not in ('react_boundary', 'window_error', 'unhandled_rejection') then
    raise exception 'invalid_error_source';
  end if;
  if nullif(trim(p_message), '') is null then
    raise exception 'error_message_required';
  end if;

  insert into public.runtime_error_logs (actor_id, source, message, stack, component_stack, route)
  values (
    auth.uid(),
    p_source,
    left(trim(p_message), 1000),
    left(p_stack, 8000),
    left(p_component_stack, 8000),
    left(p_route, 500)
  )
  returning incident_code into v_incident_code;

  return v_incident_code;
end;
$$;

grant execute on function public.report_runtime_error(text, text, text, text, text) to anon, authenticated;

drop function if exists public.get_runtime_error_logs(text, text, integer, integer);
create function public.get_runtime_error_logs(
  p_query text default null,
  p_source text default null,
  p_page integer default 1,
  p_page_size integer default 20
) returns table (
  id uuid,
  incident_code text,
  source text,
  message text,
  route text,
  created_at timestamptz,
  total_count bigint
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_page integer := greatest(coalesce(p_page, 1), 1);
  v_page_size integer := least(greatest(coalesce(p_page_size, 20), 1), 100);
begin
  if not public.is_admin() then
    raise exception 'admin_required';
  end if;

  return query
  with filtered as (
    select rel.*
    from public.runtime_error_logs rel
    where (nullif(trim(p_query), '') is null
      or rel.incident_code ilike '%' || trim(p_query) || '%'
      or rel.message ilike '%' || trim(p_query) || '%'
      or coalesce(rel.route, '') ilike '%' || trim(p_query) || '%')
      and (nullif(trim(p_source), '') is null or rel.source = p_source)
  )
  select f.id, f.incident_code, f.source, f.message, f.route, f.created_at,
    count(*) over() as total_count
  from filtered f
  order by f.created_at desc
  offset (v_page - 1) * v_page_size
  limit v_page_size;
end;
$$;

revoke all on function public.get_runtime_error_logs(text, text, integer, integer) from public, anon;
grant execute on function public.get_runtime_error_logs(text, text, integer, integer) to authenticated;

commit;
