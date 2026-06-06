-- Soften dynamic star pricing tiers (medium/mastery were too steep vs catalog curve).

create or replace function public.compute_star_cost(p_completed_count integer)
returns integer
language sql
immutable
as $$
  select case
    when p_completed_count < 4  then 500
    when p_completed_count < 9  then 1500
    else                             2000
  end;
$$;

grant execute on function public.compute_star_cost to authenticated;
