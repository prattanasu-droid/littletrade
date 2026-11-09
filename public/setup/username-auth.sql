-- Little Trade: username-only registration using Supabase Auth.
-- Run as project owner in SQL Editor, then turn OFF Authentication > Confirm email.
-- Passwords are handled by Supabase Auth, never stored in this profile table.
begin;
create table if not exists public.player_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique,
 created_at timestamptz not null default now(),
 constraint player_username_length check (char_length(username) between 3 and 24),
 constraint player_username_canonical check (username=lower(normalize(username,NFKC))),
 constraint player_username_no_spaces check (username !~ '[[:space:][:cntrl:]@]')
);
alter table public.player_profiles enable row level security;
drop policy if exists player_profile_owner_read on public.player_profiles;
create policy player_profile_owner_read on public.player_profiles
 for select to authenticated using ((select auth.uid())=id);
revoke all on public.player_profiles from anon,authenticated;
grant select on public.player_profiles to authenticated;

create or replace function public.create_player_profile()
returns trigger language plpgsql security definer set search_path=pg_catalog,public,pg_temp as $$
declare player_name text; expected_alias text;
begin
 -- Preserve existing email accounts that have no username metadata.
 if nullif(new.raw_user_meta_data->>'username','') is null then return new; end if;
 player_name:=lower(normalize(btrim(new.raw_user_meta_data->>'username'),NFKC));
 if char_length(player_name) not between 3 and 24 or player_name ~ '[[:space:][:cntrl:]@]' then
  raise exception 'INVALID_USERNAME';
 end if;
 expected_alias:=encode(sha256(convert_to(player_name,'UTF8')),'hex')||'@players.littletrade.invalid';
 if new.email is distinct from expected_alias then raise exception 'INVALID_USERNAME_ALIAS'; end if;
 insert into public.player_profiles(id,username) values(new.id,player_name);
 return new;
end;$$;
revoke all on function public.create_player_profile() from public,anon,authenticated;
drop trigger if exists little_trade_create_profile on auth.users;
create trigger little_trade_create_profile after insert on auth.users
 for each row execute function public.create_player_profile();

-- Safe readiness probe: exposes only the installed schema version, not user records.
create or replace function public.username_auth_ready()
returns integer language sql stable set search_path=pg_catalog as $$ select 1; $$;
revoke all on function public.username_auth_ready() from public;
grant execute on function public.username_auth_ready() to anon,authenticated;
commit;
