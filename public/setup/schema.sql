-- Little Trade v1. Run once in the Supabase SQL Editor for your own project.
-- Existing progress is preserved. Only public browser keys belong in the app.
begin;
create table if not exists public.trade_game_saves (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 payload jsonb not null,
 revision integer not null default 1 check(revision>0),
 updated_at timestamptz not null default now()
);
create index if not exists trade_game_saves_user_idx on public.trade_game_saves(user_id);
alter table public.trade_game_saves enable row level security;
drop policy if exists trade_save_owner_read on public.trade_game_saves;
create policy trade_save_owner_read on public.trade_game_saves for select to authenticated using(auth.uid()=user_id);
revoke all on public.trade_game_saves from anon,authenticated;
grant select on public.trade_game_saves to authenticated;
create or replace function public.save_trade_game(p_id uuid,p_payload jsonb,p_expected_revision integer default 0)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare current_save public.trade_game_saves%rowtype; new_revision integer;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 if p_payload->>'id' is distinct from p_id::text or (p_payload->>'version')::integer is distinct from 1
    or length(coalesce(p_payload->>'name','')) not between 1 and 24
    or pg_column_size(p_payload)>150000 then raise exception 'INVALID_SAVE'; end if;
 select * into current_save from public.trade_game_saves where id=p_id for update;
 if found then
  if current_save.user_id<>auth.uid() then raise exception 'SAVE_FORBIDDEN'; end if;
  if current_save.revision is distinct from p_expected_revision then raise exception 'SAVE_CONFLICT'; end if;
  new_revision:=current_save.revision+1;
  update public.trade_game_saves set payload=p_payload,revision=new_revision,updated_at=now() where id=p_id;
 else
  if p_expected_revision is distinct from 0 then raise exception 'SAVE_CONFLICT'; end if;
  insert into public.trade_game_saves(id,user_id,payload,revision) values(p_id,auth.uid(),p_payload,1)
    on conflict do nothing returning revision into new_revision;
  if new_revision is null then raise exception 'SAVE_CONFLICT'; end if;
 end if;
 return jsonb_build_object('id',p_id,'revision',new_revision,'updated_at',now());
end;$$;
revoke all on function public.save_trade_game(uuid,jsonb,integer) from public,anon;
grant execute on function public.save_trade_game(uuid,jsonb,integer) to authenticated;
commit;

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
