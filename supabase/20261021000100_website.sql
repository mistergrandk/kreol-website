-- Kreol website: fast search, anonymous (guest) submissions with abuse protection.
-- Additive only: no data is deleted. Run in Supabase SQL editor (project cybchoqhntuhqxnpcgyv).

-- 1) Guest submissions: allow author-less rows tagged source='web_guest'.
alter table public.submissions alter column author_id drop not null;
alter table public.submissions add column if not exists source text not null default 'app'
  check (source in ('app', 'web', 'web_guest'));
alter table public.submissions add column if not exists contact text check (char_length(contact) <= 120);

-- 2) Search RPC (read-only, invoker rights => RLS applies).
create or replace function public.search_entries(q text, lim int default 30)
returns table (id text, headword text, status text, pos text, fr text, en text)
language sql stable security invoker set search_path = public as $$
  with t as (select lower(trim(left(coalesce(q, ''), 60))) as s)
  select e.id, e.headword, e.status, e.data->>'pos',
         e.data->'definitions_fr'->>0, e.data->'definitions_en'->>0
    from entries e, t
   where not e.deleted and t.s <> '' and (
         lower(e.headword) like t.s || '%'
      or e.data->>'variants' ilike '%' || t.s || '%'
      or e.data->>'definitions_fr' ilike '%' || t.s || '%'
      or e.data->>'definitions_en' ilike '%' || t.s || '%')
   order by (lower(e.headword) = t.s) desc, (lower(e.headword) like t.s || '%') desc,
            (e.status = 'verified') desc, length(e.headword), e.headword
   limit least(greatest(lim, 1), 50);
$$;
grant execute on function public.search_entries(text, int) to anon, authenticated;

-- 3) Rate-limit ledger (no raw IPs stored: salted sha256 hash only).
create table if not exists public.web_rate_limit (
  key_hash text not null, window_start timestamptz not null, hits int not null default 1,
  primary key (key_hash, window_start));
alter table public.web_rate_limit enable row level security;  -- no policies: invisible to clients
revoke all on public.web_rate_limit from anon, authenticated;

create or replace function public.submit_web(p_kind text, p_entry_id text, p_payload jsonb,
                                             p_contact text default null, p_hp text default null)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare
  hdr jsonb := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  ip  text := split_part(coalesce(hdr->>'cf-connecting-ip', hdr->>'x-forwarded-for', 'unknown'), ',', 1);
  k   text := encode(sha256(convert_to('kreol-web:' || ip || ':' || current_date, 'UTF8')), 'hex');
  w   timestamptz := date_trunc('hour', now());
  n   int; total int; sid uuid;
begin
  if coalesce(p_hp, '') <> '' then raise exception 'rejected'; end if;               -- honeypot
  if p_kind not in ('new_word', 'correction', 'example') then raise exception 'bad kind'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' or length(p_payload::text) > 4000
    then raise exception 'bad payload'; end if;
  if p_kind = 'new_word' and char_length(trim(coalesce(p_payload->>'headword', ''))) not between 1 and 60
    then raise exception 'headword required (1-60 chars)'; end if;
  if p_kind <> 'new_word' and not exists (select 1 from entries where id = p_entry_id and not deleted)
    then raise exception 'unknown entry'; end if;
  if p_payload::text ~* '(https?://|www\.|<script|<a\s)' then raise exception 'links not allowed'; end if;

  insert into web_rate_limit as r (key_hash, window_start) values (k, w)
    on conflict (key_hash, window_start) do update set hits = r.hits + 1 returning hits into n;
  if n > 5 then raise exception 'rate limit: try again later'; end if;
  select count(*) into total from submissions where source like 'web%' and status = 'pending';
  if total > 500 then raise exception 'moderation queue full, try later'; end if;
  delete from web_rate_limit where window_start < now() - interval '2 days';

  insert into submissions (kind, entry_id, payload, author_id, source, contact)
  values (p_kind, case when p_kind = 'new_word' then null else p_entry_id end,
          p_payload, auth.uid(), case when auth.uid() is null then 'web_guest' else 'web' end,
          nullif(trim(left(p_contact, 120)), ''))
  returning id into sid;
  return sid;
end $$;
revoke all on function public.submit_web(text, text, jsonb, text, text) from public;
grant execute on function public.submit_web(text, text, jsonb, text, text) to anon, authenticated;

-- 4) Moderator queue view helper (RLS on submissions already limits to moderators).
create or replace function public.am_i_moderator() returns boolean
language sql stable security definer set search_path = public as $$ select public.is_moderator(); $$;
grant execute on function public.am_i_moderator() to anon, authenticated;

-- 5) Make yourself admin (replace the email, run once after signing up on the site):
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'YOU@example.com');
