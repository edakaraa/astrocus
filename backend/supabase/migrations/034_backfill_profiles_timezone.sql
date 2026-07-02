-- profiles.timezone defaults to UTC; copy real TZ from latest daily goal entry.
update public.profiles p
set timezone = sub.timezone
from (
  select distinct on (user_id)
    user_id,
    timezone
  from public.daily_goal_entries
  where nullif(trim(timezone), '') is not null
    and trim(timezone) <> 'UTC'
  order by user_id, goal_date desc
) sub
where p.id = sub.user_id
  and (p.timezone is null or p.timezone = 'UTC');
