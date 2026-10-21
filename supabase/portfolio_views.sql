-- Run this in the Supabase SQL Editor for the project used by the portfolio.
create table if not exists public.portfolio_view_counter (
  counter_key text primary key,
  total bigint not null default 0 check (total >= 0)
);

insert into public.portfolio_view_counter (counter_key, total)
values ('main', 0)
on conflict (counter_key) do nothing;

alter table public.portfolio_view_counter enable row level security;
revoke all on table public.portfolio_view_counter from anon, authenticated;

create or replace function public.get_portfolio_views()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select total
    from public.portfolio_view_counter
    where counter_key = 'main'
  ), 0);
$$;

create or replace function public.increment_portfolio_views()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_total bigint;
begin
  insert into public.portfolio_view_counter (counter_key, total)
  values ('main', 1)
  on conflict (counter_key)
  do update set total = public.portfolio_view_counter.total + 1
  returning total into updated_total;

  return updated_total;
end;
$$;

revoke all on function public.get_portfolio_views() from public;
revoke all on function public.increment_portfolio_views() from public;
grant execute on function public.get_portfolio_views() to anon;
grant execute on function public.increment_portfolio_views() to anon;
