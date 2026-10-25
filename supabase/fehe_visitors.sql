-- Fehe 자기소개 페이지의 오늘 방문자 수.
-- Supabase 대시보드 → SQL Editor에서 한 번 실행한다. 다시 실행해도 안전하다(멱등).
--
-- 설계
--   - 브라우저는 공개 키(anon)로 아래 두 함수만 부른다. 테이블에는 직접 읽기·쓰기 권한이 없다.
--   - 날짜는 클라이언트가 보내지 않고 DB가 한국 시간으로 정한다. 그래서 지난 날짜나 미래 날짜의
--     숫자를 바꿀 수 없고, 한 번 호출에 정확히 1만 오른다.
--   - 같은 브라우저를 하루 한 번만 세는 건 클라이언트(localStorage)가 맡는다.

create table if not exists public.fehe_daily_visitors (
  day   date primary key,
  count integer not null default 0 check (count >= 0)
);

-- RLS를 켜고 정책을 두지 않아 anon·authenticated 모두 테이블에 직접 접근할 수 없게 한다.
alter table public.fehe_daily_visitors enable row level security;
revoke all on table public.fehe_daily_visitors from anon, authenticated;

-- 오늘(한국 날짜) 방문을 1 올리고 올린 뒤의 숫자를 돌려준다.
create or replace function public.fehe_count_visit()
returns integer
language sql
security definer
set search_path = public
as $$
  insert into public.fehe_daily_visitors as v (day, count)
  values ((now() at time zone 'Asia/Seoul')::date, 1)
  on conflict (day) do update set count = v.count + 1
  returning count;
$$;

-- 오늘(한국 날짜) 방문자 수를 돌려준다. 아직 아무도 없으면 0.
create or replace function public.fehe_visitors_today()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select count from public.fehe_daily_visitors
      where day = (now() at time zone 'Asia/Seoul')::date),
    0
  );
$$;

revoke all on function public.fehe_count_visit() from public;
revoke all on function public.fehe_visitors_today() from public;
grant execute on function public.fehe_count_visit() to anon, authenticated;
grant execute on function public.fehe_visitors_today() to anon, authenticated;
